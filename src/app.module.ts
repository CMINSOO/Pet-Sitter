import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from 'configs/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SitterModule } from './sitter/sitter.module';
import { BookingModule } from './booking/booking.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
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
