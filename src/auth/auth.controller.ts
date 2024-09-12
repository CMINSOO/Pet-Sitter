import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.signUp(createUserDto);

    return {
      status: HttpStatus.CREATED,
      message: '회원가입 에 성공하였습니다',
      data,
    };
  }
}
