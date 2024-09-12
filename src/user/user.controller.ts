import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내정보 조회
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async myInfo(@UserInfo() user: User) {
    const data = await this.userService.getMyInfo(user.id);

    return {
      status: HttpStatus.OK,
      message: '내 정보 조회를 성공하였습니다',
      data,
    };
  }
}
