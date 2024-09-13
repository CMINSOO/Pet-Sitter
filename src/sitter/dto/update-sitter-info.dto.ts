import { IsOptional, IsString } from 'class-validator';

export class UpdateSitterInfoDto {
  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  profileUrl: string;

  @IsOptional()
  @IsString()
  description: string;
}
