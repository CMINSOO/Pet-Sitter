import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Sitter])],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, AwsService],
})
export class UserModule {}
