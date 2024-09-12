import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMyInfoDto extends PickType(User, [
  'description',
  'profileUrl',
  'nickname',
]) {
  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  profileUrl: string;

  @IsString()
  @IsOptional()
  nickname: string;
}
