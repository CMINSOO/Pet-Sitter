import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UpdateMyInfoDto } from './dtos/update-my-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
   * 내 정보 수정
   * @param user
   * @param updateMyInfo
   * @param file
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', nullable: true },
        nickname: { type: 'string', example: 'new_nickname', nullable: true },
        profileUrl: {
          type: 'string',
          example: 'https://example.com/profile.jpg',
          nullable: true,
        },
        description: {
          type: 'string',
          example: 'New description',
          nullable: true,
        },
      },
    },
  })
  @Patch('me')
  async updateMyInfo(
    @UserInfo() user: User,
    @Body() updateMyInfo: UpdateMyInfoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.userService.updateMyInfo(
      user.email,
      updateMyInfo,
      file,
    );

    return {
      status: HttpStatus.CREATED,
      message: '내 정보 수정에 성공하였습니다',
      data,
    };
  }
}
