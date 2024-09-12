import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Sitter } from 'src/sitter/entities/sitter.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly sitterRepository: Repository<Sitter>,
  ) {}

  async getMyInfo(id: number) {
    const myInfo = await this.userRepository.findOneBy({ id });

    if (!myInfo) {
      throw new NotFoundException('내 정보를 찾는데 실패하였습니다');
    }
    return myInfo;
  }
}
