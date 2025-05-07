import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import { App } from 'supertest/types';
import { AppModule } from '@src/app.module';
// import { CacheService } from '@src/core/cache/cache.service';
import { DatabaseService } from '@src/database/database.service';

let app: INestApplication<App>;
let server: any;
let databaseService: DatabaseService;
// let cacheService: CacheService;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  server = app.getHttpServer();
  databaseService = app.get(DatabaseService);
  // cacheService = app.get(CacheService);
});

afterEach(async () => {
  // await cacheService.reset();
  await databaseService.resetDb();
});

afterAll(async () => {
  await databaseService.$disconnect?.();

  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
  await app.close();
});

export { app, server };
