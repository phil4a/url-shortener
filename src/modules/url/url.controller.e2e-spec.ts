import * as request from 'supertest';
import { server } from '@app/test/setup';

describe('UrlController (e2e)', () => {
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
      await request(server).post('/url').set('x-api-key', 'SECRET').expect(400);
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
        .set('x-api-key', 'SECRET')
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
        .set('x-api-key', 'SECRET')
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
});
