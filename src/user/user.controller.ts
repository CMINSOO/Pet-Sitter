import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateMyInfoDto } from './dtos/update-my-info.dto';

@ApiTags('user')
@Controller('users')
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
    const data = await this.userService.getMyInfo(user.email);

    return {
      status: HttpStatus.OK,
      message: '내 정보 조회를 성공하였습니다',
      data,
    };
  }

  /**
   * 유저 정보조회
   * @param id
   * @returns
   */
  @Get(':id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userService.getUserInfo(id);

    return {
      status: HttpStatus.OK,
      message: '유저 정보를 조회하는데 성공하였습니다',
      data,
    };
  }

  /**
   * 내 정보수정
   * @param user
   * @param updateMyInfo
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch('me')
  async updateMyInfo(
    @UserInfo() user: User,
    @Body() updateMyInfo: UpdateMyInfoDto,
  ) {
    const data = await this.userService.updateMyInfo(user.email, updateMyInfo);

    return {
      status: HttpStatus.CREATED,
      message: '내 정보 수정에 성공하였습니다',
      data,
    };
  }
}
