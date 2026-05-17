import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Url } from 'prisma/generated/prisma/client';
import { UrlService } from '../../url.service';
import { UrlExistsPipe } from './url-exists.pipe';

// Мокаем модуль, который вызывает ошибку
jest.mock(
  'prisma/generated/prisma/client',
  () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({})),
  }),
  { virtual: true },
);

describe('UrlExistsPipe', () => {
  let urlExistsPipe: UrlExistsPipe;
  let urlService: DeepMocked<UrlService>;

  beforeEach(async () => {
    urlService = createMock<UrlService>();
    urlExistsPipe = new UrlExistsPipe(urlService);
  });

  it('should be defined', () => {
    expect(urlExistsPipe).toBeDefined();
  });

  it('should return redirectUrl', async () => {
    const url: Url = {
      id: 1,
      redirect: 'https://instagram.com',
      url: 'localhost:3000/random-url',
      title: 'Instagram',
      clicks: 0,
      description: 'Instagram',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    urlService.findOne.mockResolvedValue(url);
    const result = await urlExistsPipe.transform('random-url');
    expect(result).toBe(url);
  });
  it('should return 404-exception if url not found', async () => {
    urlService.findOne.mockResolvedValue(null);
    const result = async () => await urlExistsPipe.transform('random-url');
    expect(result).rejects.toThrow(NotFoundException);
  });
});
