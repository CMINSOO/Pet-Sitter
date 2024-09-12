import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  //body로 들어온 email,password 검증
  async validate(request: Request, email: string, password: string) {
    console.log(request.body.userType);

    if (request.body.userType === 'user') {
      const userId = await this.authService.validateUser({ email, password });
      if (!userId) {
        throw new UnauthorizedException('일치하는 인증 정보가 없습니다');
      }
      return userId;
    } else if (request.body.userType === 'sitter') {
      const userId = await this.authService.validateSitter({ email, password });
      if (!userId) {
        throw new UnauthorizedException('일치하는 인증 정보가 없습니다');
      }
      return userId;
    } else {
      throw new BadRequestException('유저타입을 선택해주세요');
    }
  }
}
