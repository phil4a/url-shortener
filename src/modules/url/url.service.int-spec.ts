import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '@src/database/database.service';
import { createManyUrls } from '@app/src/utils/test/test-utils';
import { app } from '@app/test/setup';
import { UrlService } from './url.service';

describe('UrlService Integration Tests', () => {
  let urlService: UrlService;
  let databaseService: DatabaseService;
  let configService: ConfigService;
  let host: string;

  beforeEach(async () => {
    urlService = app.get<UrlService>(UrlService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    configService = app.get<ConfigService>(ConfigService);
    host = configService.getOrThrow<string>('HOST');
  });

  describe('create', () => {
    it('should create new url and verify it in database', async () => {
      const payload = {
        redirect: 'https://ya.ru',
        title: 'ya.ru',
        description: 'ya.ru',
      };

      // Создаем URL через сервис
      const createdUrl = await urlService.create(payload);

      // Проверяем, что URL создан и имеет все необходимые поля
      expect(createdUrl).toBeDefined();
      expect(createdUrl.id).toBeDefined();
      expect(createdUrl.clicks).toBe(0);
      expect(createdUrl.redirect).toBe(payload.redirect);
      expect(createdUrl.title).toBe(payload.title);
      expect(createdUrl.description).toBe(payload.description);

      // Проверяем, что URL действительно существует в базе данных
      const urlInDb = await databaseService.url.findUnique({
        where: { id: createdUrl.id },
      });

      // Проверяем, что данные в базе соответствуют отправленным
      expect(urlInDb).toBeDefined();
      expect(urlInDb).toEqual(
        expect.objectContaining({
          ...payload,
          clicks: 0,
          id: createdUrl.id,
        }),
      );
      expect(createdUrl).toEqual(urlInDb);
    });
  });

  describe('findAll', () => {
    it('should return an empty array if no URLs exist', async () => {
      const result = await urlService.findAll({});
      expect(result.data).toEqual([]);
    });

    it('should return an array of URLs if URLs exist', async () => {
      const mockedPayload = createManyUrls({ host });

      await databaseService.url.createMany({
        data: mockedPayload,
      });

      const urls = await databaseService.url.findMany({});
      const result = await urlService.findAll({});
      expect(result.data).toEqual(urls);
    });

    it('should return an array of URLs with pagination at 1st page', async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 1;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        nextPage: `${host}/url?limit=1&page=2`,
        prevPage: null,
      });
    });

    it('should return an array of URLs with pagination at middle page', async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 2;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        nextPage: `${host}/url?limit=1&page=3`,
        prevPage: `${host}/url?limit=1&page=1`,
      });
    });

    it('should return an array of URLs with pagination at last page', async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 3;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        nextPage: null,
        prevPage: `${host}/url?limit=1&page=2`,
      });
    });
  });

  describe('findOne', () => {
    it(`should return null when url does not exist`, async () => {
      const url = await urlService.findOne(`non-existing-url`);

      expect(url).toBeNull();
    });

    it(`should return respective url when found`, async () => {
      const uid = `12345`;
      const persistedUrl = await databaseService.url.create({
        data: {
          title: `My special link`,
          redirect: `https://google.com`,
          url: `${host}/${uid}`,
          clicks: 0,
        },
      });
      const url = await urlService.findOne(uid);

      expect(url).toEqual(persistedUrl);
    });
  });

  describe(`update`, () => {
    it(`should update and return respective url`, async () => {
      await databaseService.url.create({
        data: {
          id: 1,
          title: `My special link`,
          redirect: `https://tomray.dev`,
          url: `${host}/123456`,
          clicks: 0,
        },
      });
      const url = await urlService.update(1, { title: `Updated title` });
      const updatedPersistedUrl = await databaseService.url.findUnique({
        where: { id: 1 },
      });

      expect(url).toEqual(updatedPersistedUrl);
    });

    it(`should throw error when url does not exist`, async () => {
      const updateUrl = urlService.update(1, { title: `Updated title` });

      await expect(updateUrl).rejects.toThrow();
    });
  });

  describe(`remove`, () => {
    it(`should remove and return respective url`, async () => {
      const persistedUrl = await databaseService.url.create({
        data: {
          id: 1,
          title: `Google`,
          redirect: `https://google.com`,
          url: `${host}/12345`,
        },
      });
      const url = await urlService.remove(1);
      const removedPersistedUrl = await databaseService.url.findUnique({
        where: { id: 1 },
      });

      expect(url).toEqual(persistedUrl);
      expect(removedPersistedUrl).toBeNull();
    });

    it(`should throw error when url does not exist`, async () => {
      const removeUrl = urlService.remove(1);

      await expect(removeUrl).rejects.toThrow();
    });
  });
});
