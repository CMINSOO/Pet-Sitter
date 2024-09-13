import { PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import { UserType } from '../types/user-type';

export class SignInDto extends PickType(User, ['email', 'password']) {
  /**
   * @exmaple "sitter1@example.com"
   */
  @IsString()
  @IsNotEmpty()
  email: string;

  /**
   * @example "Qwer1234!"
   */
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  /**
   * @exmaple "SITTER"
   */
  @IsEnum({ type: 'enum', enum: UserType, default: UserType.SITTER })
  @IsOptional()
  userType: UserType.SITTER | UserType.USER;
}
