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
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsEnum({ type: 'enum', enum: UserType, default: UserType.USER })
  @IsOptional()
  userType: UserType;
}
