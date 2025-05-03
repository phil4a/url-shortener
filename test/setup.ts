import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
// import { CacheService } from '@src/core/cache/cache.service';
// import { DatabaseService } from '@src/database/database.service';
import helmet from 'helmet';
import { App } from 'supertest/types';

let app: INestApplication<App>;
let server: any;
// let databaseService: DatabaseService;
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
  // databaseService = app.get(DatabaseService);
  // cacheService = app.get(CacheService);
});

// afterEach(async () => {
//   await cacheService.reset();
//   await databaseService.resetDb();
// });

// afterAll(async () => {
//   await app.close();
//   await databaseService.$disconnect();
//   if ((cacheService as any).cache?.disconnect) {
//     await (cacheService as any).cache.disconnect();
//   } else if ((cacheService as any).cache?.quit) {
//     await (cacheService as any).cache.quit();
//   }
// });

export { app, server };
