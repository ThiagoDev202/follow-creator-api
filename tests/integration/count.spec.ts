import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import { closeDatabase, resetDatabase } from '../helpers/database';

describe('GET /creators/:creatorId/followers/count', () => {
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

  it('FR-008: responde { creatorId: 1, count: 2 } com ambos numéricos quando Ana e Bruno seguem Luna Prado', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 2 });

    const response = await request(running.url).get(
      '/creators/1/followers/count',
    );

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ creatorId: 1, count: 2 });
    const body = response.body as { creatorId: unknown; count: unknown };
    expect(typeof body.creatorId).toBe('number');
    expect(typeof body.count).toBe('number');
  });

  it('FR-008: responde count 0 numérico para criadora sem seguidores', async () => {
    const response = await request(running.url).get(
      '/creators/2/followers/count',
    );

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ creatorId: 2, count: 0 });
  });

  it('FR-008: conta só os seguidores da criadora consultada', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });
    await request(running.url)
      .post('/creators/2/followers')
      .send({ userId: 2 });
    await request(running.url)
      .post('/creators/2/followers')
      .send({ userId: 3 });

    const response = await request(running.url).get(
      '/creators/2/followers/count',
    );

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ creatorId: 2, count: 2 });
  });
});
