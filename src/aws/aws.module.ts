import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AwsController],
  exports: [AwsService],
  providers: [AwsService],
})
export class AwsModule {}
