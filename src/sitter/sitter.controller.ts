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
  UseGuards,
} from '@nestjs/common';
import { SitterService } from './sitter.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindAllSitterDto } from './dto/find-all-sitter.dto';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSitterInfoDto } from './dto/update-sitter-info.dto';

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
    const data = await this.sitterService.recommend(id, user.id);

    return {
      status: HttpStatus.CREATED,
      message: '시터 를 추천하였습니다',
      data,
    };
  }

  /**
   * 내 정보
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@UserInfo() user: User) {
    const data = await this.sitterService.myInfo(user.id);

    return {
      status: HttpStatus.OK,
      message: '내 정보를 불러왔습니다!',
      data,
    };
  }

  /**
   * 시터 정보수정
   * @param user
   * @param updateSitterInfoDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async myInfo(
    @UserInfo() user: User,
    @Body() updateSitterInfoDto: UpdateSitterInfoDto,
  ) {
    const data = await this.sitterService.updateInfo(
      updateSitterInfoDto,
      user.id,
    );

    return {
      status: HttpStatus.OK,
      message: '시터 장보를 수정했습니다',
      data,
    };
  }
}
