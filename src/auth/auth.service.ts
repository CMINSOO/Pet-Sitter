import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { CreateSitterDto } from './dto/create-sitter.dto';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { SignInDto } from './dto/user-sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserType } from './types/user-type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly SitterRepository: Repository<Sitter>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManger: Cache,
  ) {}

  async checkEmail(email: string) {
    const existedEmail = await this.UserRepository.findOne({
      where: { email },
    });

    const existSitterEmail = await this.SitterRepository.findOne({
      where: { email },
    });
    if (existedEmail || existSitterEmail) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }
    return true;
  }

  async crossCheckPassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    } else {
      return true;
    }
  }

  async findUserById(payloadId: number) {
    const user = await this.UserRepository.findOne({
      where: { id: payloadId },
    });
    if (!user) {
      throw new UnauthorizedException('인증 정보가 일치하지 않습니다.');
    }
    return user.id;
  }

  async findUserByEmail(payloadEmail: string, userType: UserType) {
    if (userType === UserType.USER) {
      const user = await this.UserRepository.findOne({
        where: { email: payloadEmail },
      });
      if (!user) {
        throw new UnauthorizedException('인증정보 가 일치 하지 않습니다');
      }
      return user;
    } else if (userType === UserType.SITTER) {
      const user = await this.SitterRepository.findOne({
        where: { email: payloadEmail },
      });
      if (!user) {
        throw new UnauthorizedException('인증정보 가 일치 하지 않습니다');
      }
      return user;
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

  async validateUser({ email, password }: SignInDto) {
    const user = await this.UserRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('인증 정보가 일치하지 않습니다');
    }

    const isPasswordMatched = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('인증정보가 일치하지 않습니다');
    }
    return { id: user.id };
  }
  async validateSitter({ email, password }: SignInDto) {
    const sitter = await this.SitterRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });

    if (!sitter) {
      throw new NotFoundException('인증 정보가 일치하지 않습니다');
    }

    const isPasswordMatched = bcrypt.compareSync(password, sitter.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('인증정보가 일치하지 않습니다');
    }
    return { id: sitter.id };
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

  async createToken(userId: number, email: string, userType: string) {
    const payload = { id: userId, email, userType };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES'),
    });

    const hashedRefreshToken = bcrypt.hashSync(
      refreshToken,
      Number(this.configService.get<number>('HASH_ROUND')),
      //10,
    );

    const redisRefreshToken = await this.cacheManger.get<string>(
      `${userType}-userId:${userId}`,
    );
    if (redisRefreshToken) {
      await this.cacheManger.del(`${userType}-userId:${userId}`);
    }

    const ttl = 60 * 60 * 24 * 7;
    await this.cacheManger.set(
      `${userType}-userId:${userId}`,
      hashedRefreshToken,
      ttl,
    );

    return { accessToken, refreshToken };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async userSignIn(userId: number, signInDto: SignInDto) {
    const accessToken = await this.createToken(
      userId,
      signInDto.email,
      signInDto.userType,
    );

    return accessToken;
  }

  async signOut(userEmail: string, userType: UserType) {
    if (userType === UserType.USER) {
      const user = await this.UserRepository.findOne({
        where: { email: userEmail },
      });

      const redisRefreshToken = await this.cacheManger.get<string>(
        `${userType}-userId:${user.id}`,
      );
      console.log(redisRefreshToken);
      console.log();
      if (!user || !redisRefreshToken) {
        throw new NotFoundException('없는 유저이거나 토큰이 존재하지 않습니다');
      }
      await this.cacheManger.del(`${userType}-userId:${user.id}`);

      return true;
    } else if (userType === UserType.SITTER) {
      const user = await this.SitterRepository.findOne({
        where: { email: userEmail },
      });
      const redisRefreshToken = await this.cacheManger.get<string>(
        `${userType}-userId:${user.id}`,
      );
      if (!user || !redisRefreshToken) {
        throw new NotFoundException('없는 유저이거나 토큰이 존재하지 않습니다');
      }
      await this.cacheManger.del(`${userType}-userId:${user.id}`);

      return true;
    }
  }
}
