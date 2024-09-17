import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'configs/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SitterModule } from './sitter/sitter.module';
import { BookingModule } from './booking/booking.module';
import { AwsModule } from './aws/aws.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true, // 전역설정
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'), // ConfigService로 호스트 가져오기
        port: configService.get<number>('REDIS_PORT'), // ConfigService로 포트 가져오기
        username: configService.get<string>('REDIS_USERNAME'), // Redis 사용자 이름
        password: configService.get<string>('REDIS_PW'), // Redis 비밀번호
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UserModule,
    AuthModule,
    SitterModule,
    BookingModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
