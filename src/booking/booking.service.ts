import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { User } from 'src/user/entities/user.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { ServiceHour } from './types/service-hour.type';
import { UpdateBookingDto } from './dtos/update-booking.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sitter)
    private readonly sitterRepository: Repository<Sitter>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectQueue('joinQueue') private joinQueue: Queue,
  ) {}

  async createBooking(
    userId: number,
    sitterId: number,
    createBookingDto: CreateBookingDto,
  ) {
    const { bookingStartTime, serviceHour, description } = createBookingDto;

    // 문자열로 받은 bookingStartTime을 Date 객체로 변환
    const startTime = new Date(bookingStartTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('올바르지 않은 시간 형식 입니다.');
    }

    const validateUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!validateUser) {
      throw new NotFoundException('유저를 찾을수 없습니다');
    }

    const sitter = await this.sitterRepository.findOne({
      where: { id: sitterId },
    });
    if (!sitter) {
      throw new NotFoundException('시터를 조회할수 없습니다.');
    }

    await this.joinQueue.add('createBookingJob', {
      userId,
      sitterId,
      bookingStartTime,
      serviceHour,
      description,
    });

    return { message: '예약이 요청되었습니다.' };
  }

  calculateEndTime(bookingStartTime: Date, serviceHour: ServiceHour): Date {
    const startTime = new Date(bookingStartTime);
    switch (serviceHour) {
      case ServiceHour.ONE_HOUR:
        startTime.setHours(startTime.getHours() + 1);
        break;
      case ServiceHour.TWO_HOUR:
        startTime.setHours(startTime.getHours() + 2);
        break;
      case ServiceHour.THREE_HOUR:
        startTime.setHours(startTime.getHours() + 3);
        break;
      default:
        throw new Error('올바르지 않은 시간입니다');
    }
    return startTime;
  }

  async updateBooking(
    userId: number,
    bookingId: number,
    updateBookingDto: UpdateBookingDto,
  ) {
    const { description, serviceHour, bookingStartTime } = updateBookingDto;

    const booked = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });
    if (!booked) {
      throw new NotFoundException('예약 정보를 찾을수 없습니다.');
    }

    const startTime = new Date(bookingStartTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('올바르지 않은 시간 형식 입니다.');
    }

    const bookingEndTime = this.calculateEndTime(startTime, serviceHour);

    const validStartTime = await this.bookingRepository.findOne({
      where: {
        sitterId: booked.sitterId,
        bookingStartTime: LessThanOrEqual(bookingEndTime),
        bookingEndTime: MoreThanOrEqual(startTime),
      },
    });

    if (validStartTime) {
      throw new ConflictException('해당 시간대에 이미 예약이 존재합니다.');
    }

    const bookingData: Partial<Booking> = {
      ...booked,
      userId,
      sitterId: booked.sitterId,
      bookingStartTime: new Date(bookingStartTime),
      bookingEndTime,
      serviceHour,
      description,
    };

    const returnValue = await this.bookingRepository.save(bookingData);

    return returnValue;
  }

  async cancelBooking(userId: number, bookingId: number) {
    const book = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (book.userId !== userId) {
      throw new UnauthorizedException('접근 권한이 없는 예약정보입니다');
    }
    if (!book) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    const returnValue = await this.bookingRepository.softDelete(bookingId);

    return returnValue;
  }
}
