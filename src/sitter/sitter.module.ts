import { Module } from '@nestjs/common';
import { SitterService } from './sitter.service';
import { SitterController } from './sitter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sitter } from './entities/sitter.entity';
import { Recommend } from './entities/recommend-sitter.entity';
import { User } from 'src/user/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sitter, Recommend, User, Booking])],
  controllers: [SitterController],
  providers: [SitterService],
})
export class SitterModule {}
