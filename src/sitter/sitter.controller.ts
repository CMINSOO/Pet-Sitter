import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SitterService } from './sitter.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FindAllSitterDto } from './dto/find-all-sitter.dto';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSitterInfoDto } from './dto/update-sitter-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('sitter')
@Controller('sitters')
export class SitterController {
  constructor(private readonly sitterService: SitterService) {}

  /**
   * 모든 시터 조회
   * @param findAllSitterDto
   * @returns
   */
  @Get()
  async allSitters(@Query() findAllSitterDto: FindAllSitterDto) {
    const data = await this.sitterService.findAll(findAllSitterDto);

    return {
      status: HttpStatus.OK,
      message: '모든 펫시터를 불러왔습니다',
      data,
    };
  }

  /**
   * 시터 내정보 불러오기
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@UserInfo() user: { email: string }) {
    const data = await this.sitterService.myInfo(user.email);

    return {
      status: HttpStatus.OK,
      message: '내 정보를 불러왔습니다!',
      data,
    };
  }

  /**
   * 시터 상세조회
   * @param id
   * @returns
   */
  @Get(':id')
  async sitterDetail(@Query('id', ParseIntPipe) id: number) {
    const data = await this.sitterService.findOne(id);

    return {
      status: HttpStatus.OK,
      message: '시터 상세조회에 성공하였습니다',
      data,
    };
  }

  /**
   * 시터추천하기
   * @param user
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('recommend/:id')
  async recommendSitter(
    @UserInfo() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.sitterService.recommend(id, user.email);

    return {
      status: HttpStatus.CREATED,
      message: '시터 를 추천하였습니다',
      data,
    };
  }

  /**
   * 시터 정보수정
   * @param user
   * @param updateSitterInfoDto
   * @param file
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
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
  async myInfo(
    @UserInfo() user: User,
    @Body() updateSitterInfoDto: UpdateSitterInfoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.sitterService.updateInfo(
      updateSitterInfoDto,
      user.email,
      file,
    );

    return {
      status: HttpStatus.OK,
      message: '시터 장보를 수정했습니다',
      data,
    };
  }

  /**
   * 예약 상세조회
   * @param user
   * @param bookingId
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my/bookings/:bookingId')
  async readMyBooking(
    @UserInfo() user: User,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    const data = await this.sitterService.readMyBooking(
      user.id,
      user.email,
      bookingId,
    );

    return {
      status: HttpStatus.OK,
      message: '예약 상세조회에 성공하였습니다',
      data,
    };
  }

  /**
   * 내 예약건 전체조회
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my/bookings')
  async findMyBooking(@UserInfo() user: User) {
    const data = await this.sitterService.findMyBook(user.id, user.email);

    return {
      status: HttpStatus.OK,
      message: '전체 예약 현황을 조회했습니다',
      data,
    };
  }
}
