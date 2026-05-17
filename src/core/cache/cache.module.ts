import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { CacheService } from '@cache/cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'CACHE_INSTANCE',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = configService.get<string>('REDIS_PORT') ?? '6379';
        const username =
          configService.get<string>('REDIS_USERNAME')?.trim() || undefined;
        const password =
          configService.get<string>('REDIS_PASSWORD')?.trim() || undefined;

        const auth =
          username && password
            ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
            : username
              ? `${encodeURIComponent(username)}@`
              : password
                ? `:${encodeURIComponent(password)}@`
                : '';

        const redisUrl = `redis://${auth}${host}:${port}`;
        const secondary = createKeyv(redisUrl);
        return new Cacheable({ secondary, ttl: '4h' });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['CACHE_INSTANCE', CacheService],
})
export class CacheModule {}
