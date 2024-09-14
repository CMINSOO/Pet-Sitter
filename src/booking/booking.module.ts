import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/user/entities/user.entity';
import { Sitter } from 'src/sitter/entities/sitter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Sitter])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
