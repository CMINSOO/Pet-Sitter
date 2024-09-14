import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingDto } from './dtos/update-booking.dto';

@ApiTags('booking')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * 예약 생성하기
   * @param user
   * @param createBookingDto
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create/:id')
  async createBooking(
    @UserInfo() user: User,
    @Body() createBookingDto: CreateBookingDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.bookingService.createBooking(
      user.id,
      id,
      createBookingDto,
    );

    return {
      status: HttpStatus.CREATED,
      message: '예약에 성공하였습니다',
      data,
    };
  }

  /**
   * 예약정보 수정
   * @param user
   * @param bookingId
   * @param updateBookingDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:bookingId')
  async updateBooking(
    @UserInfo() user: User,
    @Query('bookingId', ParseIntPipe) bookingId: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const data = await this.bookingService.updateBooking(
      user.id,
      bookingId,
      updateBookingDto,
    );

    return {
      status: HttpStatus.OK,
      message: '예약정보를 변경하였습니다',
      data,
    };
  }
}
