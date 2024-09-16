import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { UpdateMyInfoDto } from './dtos/update-my-info.dto';
import { AuthService } from 'src/auth/auth.service';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly sitterRepository: Repository<Sitter>,
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
  ) {}

  async getMyInfo(email: string) {
    const myInfo = await this.userRepository.findOneBy({ email });
    if (!myInfo) {
      throw new NotFoundException('내 정보를 찾는데 실패하였습니다');
    }
    return myInfo;
  }

  async getUserInfo(id: number) {
    const userInfo = await this.userRepository.findOneBy({ id });

    if (!userInfo || userInfo.deletedAt) {
      throw new NotFoundException('존재하지 않은 유저입니다');
    }

    return userInfo;
  }

  async updateMyInfo(
    email: string,
    updateMyInfo: UpdateMyInfoDto,
    file?: Express.Multer.File,
  ) {
    const { description, nickname, profileUrl } = updateMyInfo;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('존재하지 않은 유저입니다');
    }

    await this.authService.checkNickname(nickname);

    const updateData: Partial<User> = {};

    if (file) {
      const uploadResult = await this.awsService.saveImage(file);
      updateData.profileUrl = uploadResult.imageUrl;
    } else if (profileUrl) {
      updateData.profileUrl = profileUrl;
    }

    if (nickname) {
      updateData.nickname = nickname;
    }
    if (description) {
      updateData.description = description;
    }

    await this.userRepository.update(user.id, updateData);
    return updateData;
  }
}
