import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ServiceHour } from '../types/service-hour.type';
import { Transform } from 'class-transformer';
import { formatISO, parse } from 'date-fns';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => {
    // "yyyy-MM-dd:HH:mm:ss" 형식을 ISO 8601로 변환
    const date = parse(value, 'yyyy-MM-dd:HH:mm', new Date());
    return formatISO(date);
  })
  bookingStartTime: string;

  @IsNotEmpty()
  @IsEnum(ServiceHour)
  serviceHour: ServiceHour = ServiceHour.ONE_HOUR;

  @IsNotEmpty()
  @IsString()
  description: string;
}
