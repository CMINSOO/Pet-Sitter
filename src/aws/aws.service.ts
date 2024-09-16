import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
      },
    });
  }

  async saveImage(file: Express.Multer.File) {
    return await this.imageUpload(file);
  }

  private async getUUID() {
    return v4();
  }

  async imageUpload(file: Express.Multer.File) {
    const imageName = await this.getUUID();
    const ext = file.originalname.split('.').pop();

    const imageUrl = await this.imageUploadToS3(
      `${imageName}.${ext}`,
      file,
      ext,
    );

    return { imageUrl };
  }

  async imageUploadToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Key: `images/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);
    return `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/images/${fileName}`;
  }
}
