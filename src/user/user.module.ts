import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Sitter } from 'src/sitter/entities/sitter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Sitter])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
