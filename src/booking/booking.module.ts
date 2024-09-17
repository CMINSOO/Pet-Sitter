import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/user/entities/user.entity';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { queueFactory } from 'configs/queue.config';
import { BookingProcessor } from './booking.process';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Sitter]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: queueFactory,
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'joinQueue',
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingProcessor],
})
export class BookingModule {}
