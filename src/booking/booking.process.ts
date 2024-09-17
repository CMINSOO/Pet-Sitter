import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { Booking } from './entities/booking.entity';
import { BookingService } from './booking.service';

@Injectable()
@Processor('joinQueue') // 큐 이름과 동일해야 함
export class BookingProcessor {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly sitterRepository: Repository<Sitter>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly bookingService: BookingService,
  ) {}

  @Process('createBookingJob') // 작업의 이름과 동일해야 함
  async handleCreateBooking(job: Job) {
    const { userId, sitterId, bookingStartTime, serviceHour, description } =
      job.data;

    try {
      const validateUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!validateUser) {
        throw new NotFoundException('유저를 찾을 수 없습니다.');
      }

      const sitter = await this.sitterRepository.findOne({
        where: { id: sitterId },
      });
      if (!sitter) {
        throw new NotFoundException('시터를 조회할 수 없습니다.');
      }

      const startTime = new Date(bookingStartTime);
      const bookingEndTime = this.bookingService.calculateEndTime(
        startTime,
        serviceHour,
      );

      const existingBooking = await this.bookingRepository.findOne({
        where: {
          sitterId,
          bookingStartTime: LessThanOrEqual(bookingEndTime),
          bookingEndTime: MoreThanOrEqual(startTime),
        },
      });

      if (existingBooking) {
        throw new ConflictException('해당 시간대에 이미 예약이 존재합니다.');
      }

      const bookingData: Partial<Booking> = {
        userId,
        sitterId,
        bookingStartTime: startTime,
        bookingEndTime,
        serviceHour,
        description,
      };

      const returnValue = await this.bookingRepository.save(bookingData);

      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}
