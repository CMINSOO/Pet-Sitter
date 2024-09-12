import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
  ) {}

  async checkEmail(email: string) {
    const existedEmail = await this.UserRepository.findOne({
      where: { email },
    });

    if (existedEmail) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }
    return true;
  }

  async signUp(createUserDto: CreateUserDto) {
    const { email, password, nickname, confirmPassword } = createUserDto;

    //email 중복검사
    await this.checkEmail(email);

    //비밀번호 검증
    if (password !== confirmPassword) {
      throw new BadRequestException(
        '비밀번호 와 비밀번호 확인이 일치하지 않습니다',
      );
    }

    //TODO: salt값 env에 저장하여 상수로 사용하기
    //비밀번호 암호화 해서 저장해주기
    const hashedPassword = bcrypt.hashSync(password, 10);

    // data 저장해주기
    const userData = this.UserRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });

    const user = await this.UserRepository.save(userData);
    user.password = undefined;
    user.deletedAt = undefined;
    return user;
  }
}
