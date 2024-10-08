import { ConfigService } from '@nestjs/config';

export const queueFactory = (configService: ConfigService) => ({
  redis: {
    host: configService.get<string>('REDIS_HOST', { infer: true }),
    port: configService.get<number>('REDIS_PORT', { infer: true }),
    db: configService.get<number>('REDIS_DB', { infer: true }),
    password: configService.get<string>('REDIS_PW', { infer: true }),
  },
});
