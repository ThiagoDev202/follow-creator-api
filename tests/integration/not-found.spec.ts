import request from 'supertest';
import { RunningApp, startApp } from '../helpers/app';
import {
  closeDatabase,
  countFollowRows,
  query,
  resetDatabase,
} from '../helpers/database';

const creatorNotFound = {
  error: { code: 'CREATOR_NOT_FOUND', message: 'Criadora não encontrada.' },
};

const userNotFound = {
  error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' },
};

describe('referências inexistentes', () => {
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

  describe('criadora 999 inexistente', () => {
    it('FR-009 FR-015: POST /creators/999/followers responde 404 CREATOR_NOT_FOUND em português e nada é gravado', async () => {
      const response = await request(running.url)
        .post('/creators/999/followers')
        .send({ userId: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
      await expect(countFollowRows()).resolves.toBe(0);
    });

    it('FR-009 FR-015: DELETE /creators/999/followers/1 responde 404 CREATOR_NOT_FOUND em português', async () => {
      const response = await request(running.url).delete(
        '/creators/999/followers/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-009 FR-015: GET /creators/999/followers/count responde 404 CREATOR_NOT_FOUND em português', async () => {
      const response = await request(running.url).get(
        '/creators/999/followers/count',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-009 FR-015: GET /creators/999/followers/1 responde 404 CREATOR_NOT_FOUND em português', async () => {
      const response = await request(running.url).get(
        '/creators/999/followers/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-009 FR-015: GET /creators/999 responde 404 CREATOR_NOT_FOUND em português', async () => {
      const response = await request(running.url).get('/creators/999');

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });
  });

  describe('usuário 999 inexistente', () => {
    it('FR-010 FR-015: POST /creators/1/followers com userId 999 responde 404 USER_NOT_FOUND em português e nada é gravado', async () => {
      const response = await request(running.url)
        .post('/creators/1/followers')
        .send({ userId: 999 });

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(userNotFound);
      await expect(countFollowRows()).resolves.toBe(0);
    });

    it('FR-010 FR-015: DELETE /creators/1/followers/999 responde 404 USER_NOT_FOUND em português', async () => {
      const response = await request(running.url).delete(
        '/creators/1/followers/999',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(userNotFound);
    });

    it('FR-010 FR-015: GET /creators/1/followers/999 responde 404 USER_NOT_FOUND em português', async () => {
      const response = await request(running.url).get(
        '/creators/1/followers/999',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(userNotFound);
    });
  });

  describe('criadora 999 e usuário 999 inexistentes', () => {
    it('FR-011 FR-015: POST responde 404 CREATOR_NOT_FOUND', async () => {
      const response = await request(running.url)
        .post('/creators/999/followers')
        .send({ userId: 999 });

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-011 FR-015: DELETE responde 404 CREATOR_NOT_FOUND', async () => {
      const response = await request(running.url).delete(
        '/creators/999/followers/999',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-011 FR-015: GET de "segue?" responde 404 CREATOR_NOT_FOUND', async () => {
      const response = await request(running.url).get(
        '/creators/999/followers/999',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });
  });

  describe('registro removido do banco antes da operação', () => {
    it('FR-012 FR-015: seguir com usuário removido responde 404 USER_NOT_FOUND e nada é gravado', async () => {
      await query("INSERT INTO users (id, name) VALUES (4, 'Davi')");
      await query('DELETE FROM users WHERE id = 4');

      const response = await request(running.url)
        .post('/creators/1/followers')
        .send({ userId: 4 });

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(userNotFound);
      await expect(countFollowRows()).resolves.toBe(0);
    });

    it('FR-012 FR-015: seguir criadora removida responde 404 CREATOR_NOT_FOUND e nada é gravado', async () => {
      await query('DELETE FROM creators WHERE id = 2');

      const response = await request(running.url)
        .post('/creators/2/followers')
        .send({ userId: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
      await expect(countFollowRows()).resolves.toBe(0);
    });

    it('FR-012 FR-015: deixar de seguir com usuário removido responde 404 USER_NOT_FOUND', async () => {
      await request(running.url)
        .post('/creators/1/followers')
        .send({ userId: 3 });
      await query('DELETE FROM users WHERE id = 3');

      const response = await request(running.url).delete(
        '/creators/1/followers/3',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(userNotFound);
    });

    it('FR-012 FR-015: deixar de seguir criadora removida responde 404 CREATOR_NOT_FOUND', async () => {
      await request(running.url)
        .post('/creators/2/followers')
        .send({ userId: 1 });
      await query('DELETE FROM creators WHERE id = 2');

      const response = await request(running.url).delete(
        '/creators/2/followers/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });

    it('FR-012 FR-015: contagem de criadora removida responde 404 CREATOR_NOT_FOUND', async () => {
      await request(running.url)
        .post('/creators/2/followers')
        .send({ userId: 1 });
      await query('DELETE FROM creators WHERE id = 2');

      const response = await request(running.url).get(
        '/creators/2/followers/count',
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual(creatorNotFound);
    });
  });
});
