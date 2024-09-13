import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from '../types/order-type';
import { SortType } from '../types/sort-type';

export class FindAllSitterDto {
  @IsOptional()
  @IsEnum(OrderType)
  orderBy?: OrderType = OrderType.DESC;

  @IsOptional()
  @IsEnum(SortType)
  sortBy?: SortType = SortType.CREATED_AT;
}
