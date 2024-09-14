import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';

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
}
