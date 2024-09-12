import { PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Sitter } from 'src/sitter/entities/sitter.entity';

export class CreateSitterDto extends PickType(Sitter, [
  'email',
  'password',
  'nickname',
]) {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsStrongPassword()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
