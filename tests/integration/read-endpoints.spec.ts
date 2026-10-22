import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import { closeDatabase, query, resetDatabase } from '../helpers/database';

describe('leituras extras para a página', () => {
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

  it('FR-016: GET /creators/1 responde { id: 1, name: "Luna Prado" }', async () => {
    const response = await request(running.url).get('/creators/1');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ id: 1, name: 'Luna Prado' });
  });

  it('FR-016: GET /creators/2 responde { id: 2, name: "Mel Duarte" }', async () => {
    const response = await request(running.url).get('/creators/2');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ id: 2, name: 'Mel Duarte' });
  });

  it('FR-017: responde following true para Ana, que segue Luna Prado, e false para Bruno, que não segue', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });

    const ana = await request(running.url).get('/creators/1/followers/1');
    const bruno = await request(running.url).get('/creators/1/followers/2');

    expect(ana.status).toBe(200);
    expect(ana.body).toStrictEqual({ following: true });
    expect(bruno.status).toBe(200);
    expect(bruno.body).toStrictEqual({ following: false });
  });

  it('FR-017: responde following false depois de deixar de seguir', async () => {
    await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 1 });
    await request(running.url).delete('/creators/1/followers/1');

    const response = await request(running.url).get('/creators/1/followers/1');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({ following: false });
  });

  it('FR-018: GET /users lista Ana, Bruno e Carla em ordem crescente de id', async () => {
    const response = await request(running.url).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      { id: 1, name: 'Ana' },
      { id: 2, name: 'Bruno' },
      { id: 3, name: 'Carla' },
    ]);
  });

  it('FR-018: GET /users mantém a ordem crescente de id mesmo quando a ordem física das linhas muda', async () => {
    await query("UPDATE users SET name = 'Ana' WHERE id = 1");

    const response = await request(running.url).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      { id: 1, name: 'Ana' },
      { id: 2, name: 'Bruno' },
      { id: 3, name: 'Carla' },
    ]);
  });
});
