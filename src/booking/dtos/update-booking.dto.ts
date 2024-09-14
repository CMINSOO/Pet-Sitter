import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { formatISO, parse } from 'date-fns';
import { ServiceHour } from '../types/service-hour.type';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    // "yyyy-MM-dd:HH:mm:ss" 형식을 ISO 8601로 변환
    const date = parse(value, 'yyyy-MM-dd:HH:mm', new Date());
    return formatISO(date);
  })
  bookingStartTime: string;

  @IsOptional()
  @IsEnum(ServiceHour)
  serviceHour: ServiceHour = ServiceHour.ONE_HOUR;

  @IsOptional()
  @IsString()
  description: string;
}
