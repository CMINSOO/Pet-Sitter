import { Module } from '@nestjs/common';
import { SitterService } from './sitter.service';
import { SitterController } from './sitter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sitter } from './entities/sitter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sitter])],
  controllers: [SitterController],
  providers: [SitterService],
})
export class SitterModule {}
