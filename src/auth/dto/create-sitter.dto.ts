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
  /**
   * 시터이메일
   * @example "sitter1@example.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * 비밀번호
   * @example "Qwer1234!"
   */
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  /**
   * 비밀번호 확인
   * @example "Qwer1234!"
   */
  @IsStrongPassword()
  @IsNotEmpty()
  confirmPassword: string;

  /**
   * 닉네임
   * @example "시터송사무엘"
   */
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
