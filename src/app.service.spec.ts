import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '@src/app.service';
import { LoggerService } from './core/logger/logger.service';
import { CacheService } from './core/cache/cache.service';
import { DatabaseService } from './database/database.service';
import { createMock } from '@golevelup/ts-jest';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
        {
          provide: DatabaseService,
          useValue: createMock<DatabaseService>(),
        },
      ],
    }).compile();
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      const result = await appService.getHello();
      expect(result).toBe('Hello World!');
    });
  });
});
