import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Delete,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSitterDto } from './dto/create-sitter.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserInfo } from './decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { SignInDto } from './dto/user-sign-in.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Post('sign-up/user')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.signUp(createUserDto);

    return {
      status: HttpStatus.CREATED,
      message: '회원가입 에 성공하였습니다',
      data,
    };
  }

  /**
   * 시터회원가입
   * @param createSitterDto
   * @returns
   */
  @Post('sign-up/sitter')
  async sitterSignUp(@Body() createSitterDto: CreateSitterDto) {
    const data = await this.authService.sitterSignUp(createSitterDto);

    return {
      status: HttpStatus.CREATED,
      message: '회원가입 에 성공하였습니다',
      data,
    };
  }

  /**
   * 로그인
   * @param user
   * @returns
   */
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async userSignIn(@UserInfo() user: User, @Body() signInDto: SignInDto) {
    const data = await this.authService.userSignIn(user.id, signInDto);

    return {
      status: HttpStatus.OK,
      message: '로그인에 성공하였습니다',
      data: data,
    };
  }

  /**
   * 로그아웃
   * @param user
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('sign-out')
  async signOut(@UserInfo() user: User, @Request() req) {
    const userType = req.user.userType;
    console.log(userType);
    const data = await this.authService.signOut(user.email, userType);

    return {
      status: HttpStatus.OK,
      message: '로그아웃에 성공했습니다',
      data,
    };
  }
}
