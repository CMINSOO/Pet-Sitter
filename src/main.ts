import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    // title은 제목 이름 정하는것
    .setDescription('The cats API description')
    // description: 디스크립션 내용 적는부분
    .setVersion('1.0')
    .addTag('cats')
    //태그는 카테고리개념이라고 생각하면됨
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
