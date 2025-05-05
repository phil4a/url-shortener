import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from '@src/database/database.service';
import { PaginationService } from '@src/services/pagination/pagination.service';
import { UidService } from '@src/services/uid/uid.service';
import { UrlService } from './url.service';

// Мокаем модуль Prisma, который вызывает ошибку
jest.mock(
  'prisma/generated/prisma/client',
  () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Здесь можно добавить моки для методов PrismaClient, если они используются в тестах
      url: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  }),
  { virtual: true },
);

describe('UrlService', () => {
  let urlService: UrlService;
  let uidService: DeepMocked<UidService>;
  let configService: DeepMocked<ConfigService>;
  let databaseService: DeepMockProxy<DatabaseService>;
  let host = 'localhost:3000';
  // let paginationService: DeepMocked<PaginationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: UidService,
          useValue: createMock<UidService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: DatabaseService,
          useValue: mockDeep<DatabaseService>(),
        },
        {
          provide: PaginationService,
          useValue: createMock<PaginationService>(),
        },
      ],
    }).compile();

    const app = module.createNestApplication();

    urlService = module.get<UrlService>(UrlService);
    uidService = module.get(UidService);
    configService = module.get(ConfigService);
    configService.getOrThrow.mockReturnValue(host);
    databaseService = module.get(DatabaseService);
    // paginationService = module.get(PaginationService)

    await app.init();
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new url', async () => {
      const payload = {
        redirect: 'https://instagram.com',
        title: 'Instagram',
        description: 'Social media',
      };
      const uid = '12345';
      const mockedUrl = {
        ...payload,
        id: 1,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: `${host}/${uid}`,
      };
      uidService.generate.mockReturnValueOnce(uid);
      databaseService.url.create.mockResolvedValue(mockedUrl);
      const result = await urlService.create(payload);

      expect(result).toEqual(mockedUrl);
    });
  });
});
