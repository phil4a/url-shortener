import { ConfigService } from '@nestjs/config';
import { app } from 'test/setup';
import { DatabaseService } from '@src/database/database.service';
import { UrlService } from './url.service';

describe('UrlService Integration Tests', () => {
  let urlService: UrlService;
  let databaseService: DatabaseService;
  let configService: ConfigService;

  beforeEach(async () => {
    urlService = app.get<UrlService>(UrlService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    configService = app.get<ConfigService>(ConfigService);
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

      // Проверяем формат сгенерированного короткого URL
      const host = configService.getOrThrow<string>('HOST');
      expect(urlInDb!.url).toMatch(new RegExp(`^${host}/[a-zA-Z0-9]{5}$`));
    });
  });
});
