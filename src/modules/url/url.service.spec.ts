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
  const host = 'localhost:3000';
  let paginationService: DeepMockProxy<PaginationService>;

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
    paginationService = module.get(PaginationService);

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

  describe('findAll', () => {
    it('should return all urls with pagination', async () => {
      const filter = 'test';
      const page = 2;
      const limit = 10;

      const mockedUrls = [
        {
          id: 1,
          redirect: 'https://test1.com',
          title: 'Test 1',
          description: 'Test description 1',
          clicks: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          url: `${host}/test1`,
        },
        {
          id: 2,
          redirect: 'https://test2.com',
          title: 'Test 2',
          description: 'Test description 2',
          clicks: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          url: `${host}/test2`,
        },
      ];

      const paginationResult = {
        meta: {
          totalCount: mockedUrls.length,
          currentPage: page,
          totalPages: 1,
          nextPage: 'https://test2.com/page1',
          prevPage: 'https://test2.com/page3',
          perPage: limit,
        },
        urls: mockedUrls,
      };

      paginationService.getPagination.mockResolvedValue(paginationResult);

      const result = await urlService.findAll({
        filter,
        page,
        limit,
      });

      expect(result).toEqual({
        data: mockedUrls,
        meta: paginationResult.meta,
      });
    });
  });

  describe('findOne', () => {
    it('should return a url', async () => {
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

      databaseService.url.findUnique.mockResolvedValueOnce(mockedUrl);

      const result = await urlService.findOne(uid);

      expect(result).toEqual(mockedUrl);
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks', async () => {
      // Подготовка начальных данных
      const urlId = 1;
      const initialUrl = {
        id: urlId,
        redirect: 'https://instagram.com',
        title: 'Instagram',
        description: 'Social media',
        clicks: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: `${host}/12345`,
      };

      const updatedUrl = {
        ...initialUrl,
        clicks: 6, // Увеличено на 1
      };

      databaseService.url.update.mockResolvedValueOnce(updatedUrl);

      const result = await urlService.incrementClicks(urlId);

      expect(databaseService.url.update).toHaveBeenCalledWith({
        where: { id: urlId },
        data: { clicks: { increment: 1 } },
      });

      expect(result).toEqual(updatedUrl);
      expect(result.clicks).toBe(initialUrl.clicks + 1);
    });
  });
});
