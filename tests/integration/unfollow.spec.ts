import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import {
  closeDatabase,
  countFollowRows,
  resetDatabase,
} from '../helpers/database';

describe('DELETE /creators/:creatorId/followers/:userId', () => {
  let running: RunningApp;

  beforeAll(async () => {
    running = await startApp();
  });

  afterAll(async () => {
    await running.app.close();
    await closeDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('FR-003: responde 204 sem corpo e a contagem de Luna Prado volta a 0', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    const response = await request(running.url).delete(
      '/creators/1/followers/1',
    );

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    await expect(countFollowRows()).resolves.toBe(0);

    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.status).toBe(200);
    expect(count.body).toStrictEqual({ creatorId: 1, count: 0 });
  });

  it('FR-003: remove só a relação pedida e mantém as demais', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 2 });

    const response = await request(running.url).delete(
      '/creators/1/followers/1',
    );

    expect(response.status).toBe(204);
    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.body).toStrictEqual({ creatorId: 1, count: 1 });
  });

  it('FR-004: responde a mesma confirmação 204 sem corpo para quem não seguia e a contagem continua 0', async () => {
    const response = await request(running.url).delete(
      '/creators/1/followers/1',
    );

    expect(response.status).toBe(204);
    expect(response.text).toBe('');

    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.status).toBe(200);
    expect(count.body).toStrictEqual({ creatorId: 1, count: 0 });
  });

  it('FR-004: repetir o DELETE responde 204 nas duas vezes', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    const first = await request(running.url).delete('/creators/1/followers/1');
    const second = await request(running.url).delete('/creators/1/followers/1');

    expect([first.status, second.status]).toEqual([204, 204]);
    await expect(countFollowRows()).resolves.toBe(0);
  });
});
