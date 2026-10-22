import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import {
  closeDatabase,
  countFollowRows,
  resetDatabase,
} from '../helpers/database';

describe('POST /creators/:creatorId/followers', () => {
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

  it('FR-001: responde 201 com { creatorId: 1, count: 1 } quando Ana passa a seguir Luna Prado', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual({ creatorId: 1, count: 1 });
    await expect(countFollowRows()).resolves.toBe(1);
  });

  it('FR-001: a contagem de Luna Prado passa a 1 depois de seguir', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    const response = await request(running.url).get(
      '/creators/1/followers/count',
    );

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ creatorId: 1, count: 1 });
  });

  it('FR-002: segundo POST responde 200 com count 1 e não duplica a relação', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    const response = await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ creatorId: 1, count: 1 });
    await expect(countFollowRows()).resolves.toBe(1);
  });

  it('FR-001: seguir a criadora 2 responde com creatorId 2 e não altera a contagem da criadora 1', async () => {
    const response = await request(running.url)
      .post('/creators/2/followers')
      .send({ userId: 3 });

    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual({ creatorId: 2, count: 1 });

    const countOfFirst = await request(running.url).get(
      '/creators/1/followers/count',
    );
    expect(countOfFirst.body).toStrictEqual({ creatorId: 1, count: 0 });
  });
});
