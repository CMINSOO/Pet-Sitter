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
import { CreateSitterDto } from './dto/create-sitter.dto';
import { Sitter } from 'src/sitter/entities/sitter.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly SitterRepository: Repository<Sitter>,
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

  async crossCheckPassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
  }

  async checkNickname(nickname: string) {
    const existUserNickname = await this.UserRepository.findOne({
      where: { nickname },
    });
    const existSitterNickname = await this.SitterRepository.findOne({
      where: { nickname },
    });

    if (existSitterNickname || existUserNickname) {
      throw new ConflictException('이미 사용중인 닉네임 입니다');
    }
  }

  async signUp(createUserDto: CreateUserDto) {
    const { email, password, nickname, confirmPassword } = createUserDto;

    //email 중복검사
    await this.checkEmail(email);

    //비밀번호 검증
    await this.crossCheckPassword(password, confirmPassword);

    //닉네임 중복체크
    await this.checkNickname(nickname);

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

  async sitterSignUp(createSitterDto: CreateSitterDto) {
    const { email, password, confirmPassword, nickname } = createSitterDto;

    await this.checkEmail(email);
    await this.crossCheckPassword(password, confirmPassword);
    await this.checkNickname(nickname);

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sitterData = this.SitterRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });

    const sitter = await this.SitterRepository.save(sitterData);
    sitter.password = undefined;
    sitter.deletedAt = undefined;

    return sitter;
  }
}
