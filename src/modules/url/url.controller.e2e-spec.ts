import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { DatabaseService } from '@app/src/database/database.service';
import { createManyUrls } from '@app/src/utils/test/test-utils';
import { app, server } from '@app/test/setup';

describe('UrlController (e2e)', () => {
  let databaseService: DatabaseService;
  let configService: ConfigService;
  let apiKey: string;
  let host: string;

  beforeEach(async () => {
    databaseService = app.get(DatabaseService);
    configService = app.get(ConfigService);
    apiKey = configService.getOrThrow<string>('API_KEY');
    host = configService.getOrThrow<string>('HOST');
  });
  describe(`POST /url`, () => {
    // invalid api key
    it(`should return 401 if no api key provided`, async () => {
      await request(server).post('/url').expect(401);
    });

    it('should return 401 if invalid api key provided', async () => {
      await request(server)
        .post('/url')
        .set('x-api-key', 'invadid-api')
        .expect(401);
    });

    //invalid json body payload
    it('should return 400 if the json body is empty', async () => {
      await request(server).post('/url').set('x-api-key', apiKey).expect(400);
    });
    it('should return 400 if the json body is invalid', async () => {
      await request(server)
        .post('/url')
        .send({
          redirect: 'invalid url',
          title: 'test',
          description: 'test',
          clicks: 0,
        })
        .set('x-api-key', apiKey)
        .expect(400);
    });
    //valid path
    it('should return 201 if api key  and json  is valid', async () => {
      await request(server)
        .post('/url')
        .send({
          redirect: 'https://instagram.com',
          title: 'test',
          description: 'test',
          clicks: 0,
        })
        .set('x-api-key', apiKey)
        .expect(201)
        .expect(({ body }) => {
          const { data } = body;
          expect(data.redirect).toBe('https://instagram.com');
          expect(data.title).toBe('test');
          expect(data.description).toBe('test');
          expect(data).toHaveProperty('url');
          expect(data).toHaveProperty('id');
          expect(data).toHaveProperty('clicks');
          expect(data).toHaveProperty('createdAt');
          expect(data).toHaveProperty('updatedAt');
        });
    });
  });

  describe(`GET /url`, () => {
    it(`should return an empty list when no URLs exist`, async () => {
      await request(server)
        .get(`/url`)
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta).toEqual({
            totalCount: 0,
            currentPage: 1,
            perPage: 10,
            totalPages: 0,
            nextPage: null,
            prevPage: null,
          });
        });
    });

    it(`should return a list of URLs when they exist`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3); // Assuming 3 URLs were pre-created
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 3,
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            prevPage: null,
            nextPage: null,
          });
        });
    });
    it(`should return a filtered list of URLs when they exist`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url?filter=Google`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1); // Assuming 3 URLs were pre-created
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 1,
            currentPage: 1,
            perPage: 10,
            totalPages: 1,
            prevPage: null,
            nextPage: null,
          });
        });
    });
    it(`using limit query parameter should impact pagination`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url?limit=2`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 3,
            currentPage: 1,
            perPage: 2,
            totalPages: 2,
            prevPage: null,
            nextPage: `${host}/url?limit=2&page=2`,
          });
        });
    });
  });

  describe(`PATCH /url/:uid`, () => {
    it(`should update the URL if it exists`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      await request(server)
        .patch(`/url/random-uid`)
        .send({ title: 'Updated Title' })
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toEqual('Updated Title');
        });
    });

    it(`should return a 404 if the URL does not exist`, async () => {
      await request(server)
        .patch(`/url/non-existing-uid`)
        .set('x-api-key', apiKey)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe(`DELETE /url/:uid`, () => {
    it(`should delete the URL if it exists`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      await request(server)
        .delete(`/url/random-uid`)
        .set('x-api-key', apiKey)
        .expect(200);
    });

    it(`should return a 404 if the URL does not exist`, async () => {
      await request(server)
        .delete(`/url/non-existing-uid`)
        .set('x-api-key', apiKey)
        .expect(404);
    });
  });

  describe(`GET /:uid (URL Redirection)`, () => {
    it(`should redirect to the original URL`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      const response = await request(server)
        .get(`/random-uid`)
        .redirects(0) // Prevents supertest from following the redirect
        .expect(302); // 302 Found is the HTTP status code for redirection

      expect(response.headers.location).toBe('https://google.com');
    });

    it(`should return a 404 if the short URL does not exist`, async () => {
      await request(server).get(`/non-existing-uid`).expect(404);
    });
  });
});
