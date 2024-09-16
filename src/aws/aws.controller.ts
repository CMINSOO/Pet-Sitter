import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data = await this.awsService.imageUpload(file);

    return data;
  }
}
