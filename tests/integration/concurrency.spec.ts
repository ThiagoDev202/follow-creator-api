import request from 'supertest';
import { Pool } from 'pg';
import { PG_POOL } from '../../src/database/database.module';
import { RunningApp, startApp } from '../helpers/app';
import {
  closeDatabase,
  countFollowRows,
  query,
  resetDatabase,
} from '../helpers/database';

describe('concorrência', () => {
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

  it('FR-005 FR-006: o pool de conexões da aplicação permite mais de uma conexão simultânea', () => {
    const pool = running.app.get<string, Pool>(PG_POOL);

    expect(pool.options.max).toBeGreaterThan(1);
  });

  it('FR-005: 30 POSTs simultâneos de Ana para Luna Prado geram exatamente um 201, 29 200, uma relação e count 1', async () => {
    const responses = await Promise.all(
      Array.from({ length: 30 }, () =>
        request(running.url).post('/creators/1/followers').send({ userId: 1 }),
      ),
    );

    const statuses = responses.map((response) => response.status);
    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 200)).toHaveLength(29);
    for (const response of responses) {
      expect(response.body).toStrictEqual({ creatorId: 1, count: 1 });
    }
    await expect(countFollowRows()).resolves.toBe(1);

    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.body).toStrictEqual({ creatorId: 1, count: 1 });
  });

  it('FR-006: 30 usuários seguindo Luna Prado ao mesmo tempo resultam em count exatamente 30', async () => {
    const userIds = Array.from({ length: 30 }, (_value, index) => index + 101);
    await query(
      "INSERT INTO users (id, name) SELECT id, 'Usuário ' || id FROM unnest($1::int[]) AS id",
      [userIds],
    );

    const responses = await Promise.all(
      userIds.map((userId) =>
        request(running.url).post('/creators/1/followers').send({ userId }),
      ),
    );

    expect(responses.map((response) => response.status)).toEqual(
      userIds.map(() => 201),
    );
    const counts = responses.map(
      (response) => (response.body as { count: number }).count,
    );
    expect(Math.max(...counts)).toBe(30);
    await expect(countFollowRows()).resolves.toBe(30);

    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.status).toBe(200);
    expect(count.body).toStrictEqual({ creatorId: 1, count: 30 });
  });

  it('FR-007: 40 POST e DELETE alternados e simultâneos de Ana não geram erro interno e deixam estado coerente', async () => {
    const responses = await Promise.all(
      Array.from({ length: 40 }, (_value, index) =>
        index % 2 === 0
          ? request(running.url)
              .post('/creators/1/followers')
              .send({ userId: 1 })
          : request(running.url).delete('/creators/1/followers/1'),
      ),
    );

    const statuses = responses.map((response) => response.status);
    expect(statuses.filter((status) => status >= 500)).toEqual([]);
    statuses.forEach((status, index) => {
      expect(index % 2 === 0 ? [200, 201] : [204]).toContain(status);
    });

    const rows = await query<{ total: number }>(
      'SELECT COUNT(*)::int AS total FROM follows WHERE creator_id = 1 AND user_id = 1',
    );
    const stored = rows[0].total;
    expect(stored).toBeLessThanOrEqual(1);
    await expect(countFollowRows()).resolves.toBe(stored);

    const status = await request(running.url).get('/creators/1/followers/1');
    expect(status.status).toBe(200);
    expect(status.body).toStrictEqual({ following: stored === 1 });

    const count = await request(running.url).get('/creators/1/followers/count');
    expect(count.body).toStrictEqual({ creatorId: 1, count: stored });
  });
});
