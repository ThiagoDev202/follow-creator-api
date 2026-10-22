import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import {
  closeDatabase,
  countFollowRows,
  resetDatabase,
} from '../helpers/database';

const validationError = {
  error: { code: 'VALIDATION_ERROR', message: 'Requisição inválida.' },
};

const invalidIds = ['0', '-1', 'abc', '1.5', '1e3', '0x10', '01', '2147483648'];

type Method = 'get' | 'post' | 'delete';

interface RouteCase {
  method: Method;
  path: (id: string) => string;
}

const creatorIdRoutes: RouteCase[] = [
  { method: 'post', path: (id) => `/creators/${id}/followers` },
  { method: 'delete', path: (id) => `/creators/${id}/followers/1` },
  { method: 'get', path: (id) => `/creators/${id}/followers/count` },
  { method: 'get', path: (id) => `/creators/${id}/followers/1` },
  { method: 'get', path: (id) => `/creators/${id}` },
];

const userIdRoutes: RouteCase[] = [
  { method: 'delete', path: (id) => `/creators/1/followers/${id}` },
  { method: 'get', path: (id) => `/creators/1/followers/${id}` },
];

function expand(routes: RouteCase[]): [string, string, Method][] {
  return routes.flatMap((route) =>
    invalidIds.map((id): [string, string, Method] => [
      route.method.toUpperCase(),
      route.path(id),
      route.method,
    ]),
  );
}

describe('entradas inválidas', () => {
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

  function send(method: Method, path: string): request.Test {
    const agent = request(running.url);
    if (method === 'post') {
      return agent.post(path).send({ userId: 1 });
    }
    if (method === 'delete') {
      return agent.delete(path);
    }
    return agent.get(path);
  }

  it.each(expand(creatorIdRoutes))(
    'FR-013 FR-015: creatorId inválido em %s %s responde 400 VALIDATION_ERROR em português',
    async (_label, path, method) => {
      const response = await send(method, path);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(validationError);
      await expect(countFollowRows()).resolves.toBe(0);
    },
  );

  it.each(expand(userIdRoutes))(
    'FR-013 FR-015: userId inválido em %s %s responde 400 VALIDATION_ERROR em português',
    async (_label, path, method) => {
      const response = await send(method, path);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(validationError);
    },
  );

  it('FR-013: creatorId 2147483647 na rota é aceito e responde 404 CREATOR_NOT_FOUND', async () => {
    const response = await request(running.url).get(
      '/creators/2147483647/followers/count',
    );

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: { code: 'CREATOR_NOT_FOUND', message: 'Criadora não encontrada.' },
    });
  });

  it('FR-013: userId 2147483647 na rota é aceito e responde 404 USER_NOT_FOUND', async () => {
    const response = await request(running.url).get(
      '/creators/1/followers/2147483647',
    );

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' },
    });
  });

  it.each([
    ['sem userId', {}],
    ['userId texto "1"', { userId: '1' }],
    ['campo extra', { userId: 1, extra: true }],
    ['userId 0', { userId: 0 }],
    ['userId -1', { userId: -1 }],
    ['userId 1.5', { userId: 1.5 }],
    ['userId 2147483648', { userId: 2147483648 }],
    ['userId null', { userId: null }],
    ['userId booleano', { userId: true }],
  ])(
    'FR-014 FR-015: corpo %s responde 400 VALIDATION_ERROR em português e nada é gravado',
    async (_label, body) => {
      const response = await request(running.url)
        .post('/creators/1/followers')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual(validationError);
      await expect(countFollowRows()).resolves.toBe(0);
    },
  );

  it('FR-014 FR-015: JSON malformado responde 400 VALIDATION_ERROR em português e nada é gravado', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .set('Content-Type', 'application/json')
      .send('{"userId": 1');

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(validationError);
    await expect(countFollowRows()).resolves.toBe(0);
  });

  it('FR-014 FR-015: corpo JSON acima do limite do body-parser responde 400 VALIDATION_ERROR em português e nada é gravado', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .set('Content-Type', 'application/json')
      .send(`{"userId": 1${' '.repeat(200 * 1024)}}`);

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(validationError);
    await expect(countFollowRows()).resolves.toBe(0);
  });

  it('FR-014 FR-015: Content-Type JSON com charset não suportado responde 400 VALIDATION_ERROR em português e nada é gravado', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .set('Content-Type', 'application/json; charset=latin1')
      .send('{"userId": 1}');

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(validationError);
    await expect(countFollowRows()).resolves.toBe(0);
  });

  it('FR-014 FR-015: Content-Encoding não suportado responde 400 VALIDATION_ERROR em português e nada é gravado', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'foo')
      .send('{"userId": 1}');

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(validationError);
    await expect(countFollowRows()).resolves.toBe(0);
  });

  it('FR-014: userId 2147483647 no corpo é aceito e responde 404 USER_NOT_FOUND', async () => {
    const response = await request(running.url)
      .post('/creators/1/followers')
      .send({ userId: 2147483647 });

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' },
    });
  });

  it('FR-013 FR-015: rota inexistente responde 404 NOT_FOUND em português', async () => {
    const response = await request(running.url).get('/rota-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' },
    });
  });
});
