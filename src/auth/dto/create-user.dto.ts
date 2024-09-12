import { PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreateUserDto extends PickType(User, [
  'email',
  'password',
  'nickname',
]) {
  /**
   * 이메일
   * @example "test1@example.com"
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
   * 닉네임
   * @example "김노을"
   */
  @IsString()
  @IsNotEmpty()
  nickname: string;

  /**
   * 비밀번호확인
   * @example "Qwer1234!"
   */
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
