import { Test } from '@nestjs/testing';
import { CreatorNotFoundError } from '../../src/common/errors/creator-not-found.error';
import { UserNotFoundError } from '../../src/common/errors/user-not-found.error';
import { FollowersRepository } from '../../src/followers/followers.repository';
import { FollowersService } from '../../src/followers/followers.service';
import { FakeFollowersRepository } from './fake-followers.repository';

function settle<T>(operation: () => Promise<T>): Promise<T> {
  return Promise.resolve().then(operation);
}

describe('FollowersService', () => {
  let repository: FakeFollowersRepository;
  let service: FollowersService;

  beforeEach(async () => {
    repository = new FakeFollowersRepository();
    const moduleRef = await Test.createTestingModule({
      providers: [
        FollowersService,
        { provide: FollowersRepository, useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(FollowersService);
  });

  describe('follow', () => {
    it('FR-001: cria a relação e informa criação com a contagem atual', async () => {
      await expect(settle(() => service.follow(1, 1))).resolves.toEqual({
        created: true,
        count: 1,
      });
      expect(repository.isStored(1, 1)).toBe(true);
    });

    it('FR-002: seguir de novo informa que a relação já existia e mantém a contagem', async () => {
      repository.follow(1, 1);
      await expect(settle(() => service.follow(1, 1))).resolves.toEqual({
        created: false,
        count: 1,
      });
      expect(repository.follows.size).toBe(1);
    });

    it('FR-008: a contagem devolvida é numérica e igual ao número real de seguidores', async () => {
      repository.follow(1, 2);
      repository.follow(2, 3);
      await expect(settle(() => service.follow(1, 1))).resolves.toStrictEqual({
        created: true,
        count: 2,
      });
    });

    it('FR-009: criadora inexistente lança CreatorNotFoundError e nada é gravado', async () => {
      await expect(settle(() => service.follow(999, 1))).rejects.toBeInstanceOf(
        CreatorNotFoundError,
      );
      expect(repository.follows.size).toBe(0);
    });

    it('FR-010: usuário inexistente lança UserNotFoundError e nada é gravado', async () => {
      await expect(settle(() => service.follow(1, 999))).rejects.toBeInstanceOf(
        UserNotFoundError,
      );
      expect(repository.follows.size).toBe(0);
    });

    it('FR-011: criadora e usuário inexistentes lança CreatorNotFoundError', async () => {
      await expect(
        settle(() => service.follow(999, 999)),
      ).rejects.toBeInstanceOf(CreatorNotFoundError);
    });

    it('FR-012: usuário removido antes do registro da relação lança UserNotFoundError', async () => {
      repository.beforeInsert = () => {
        repository.users.delete(3);
      };
      await expect(settle(() => service.follow(1, 3))).rejects.toBeInstanceOf(
        UserNotFoundError,
      );
      expect(repository.follows.size).toBe(0);
    });

    it('FR-012: criadora removida entre o registro e a contagem lança CreatorNotFoundError', async () => {
      repository.afterInsert = () => {
        repository.creators.delete(2);
      };
      await expect(settle(() => service.follow(2, 1))).rejects.toBeInstanceOf(
        CreatorNotFoundError,
      );
    });

    it('FR-012: referência ausente no registro com criadora e usuário existentes depois lança CreatorNotFoundError', async () => {
      repository.forcedInsertResult = 'missingReference';
      await expect(settle(() => service.follow(1, 1))).rejects.toBeInstanceOf(
        CreatorNotFoundError,
      );
    });
  });

  describe('unfollow', () => {
    it('FR-003: remove a relação existente e confirma', async () => {
      repository.follow(1, 1);
      repository.follow(1, 2);
      await expect(
        settle(() => service.unfollow(1, 1)),
      ).resolves.toBeUndefined();
      expect(repository.isStored(1, 1)).toBe(false);
      expect(repository.isStored(1, 2)).toBe(true);
    });

    it('FR-004: confirma da mesma forma para quem não seguia e nada muda', async () => {
      repository.follow(1, 2);
      await expect(
        settle(() => service.unfollow(1, 1)),
      ).resolves.toBeUndefined();
      expect([...repository.follows]).toEqual(['1:2']);
    });

    it('FR-009: criadora inexistente lança CreatorNotFoundError', async () => {
      await expect(
        settle(() => service.unfollow(999, 1)),
      ).rejects.toBeInstanceOf(CreatorNotFoundError);
    });

    it('FR-010: usuário inexistente lança UserNotFoundError', async () => {
      await expect(
        settle(() => service.unfollow(1, 999)),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('FR-011: criadora e usuário inexistentes lança CreatorNotFoundError', async () => {
      await expect(
        settle(() => service.unfollow(999, 999)),
      ).rejects.toBeInstanceOf(CreatorNotFoundError);
    });
  });

  describe('getCount', () => {
    it('FR-008: devolve o número real de seguidores da criadora', async () => {
      repository.follow(1, 1);
      repository.follow(1, 2);
      repository.follow(2, 3);
      await expect(settle(() => service.getCount(1))).resolves.toBe(2);
    });

    it('FR-009: contagem nula lança CreatorNotFoundError', async () => {
      await expect(settle(() => service.getCount(999))).rejects.toBeInstanceOf(
        CreatorNotFoundError,
      );
    });
  });

  describe('getStatus', () => {
    it('FR-017: informa que segue para quem segue e que não segue para quem não segue', async () => {
      repository.follow(1, 1);
      await expect(settle(() => service.getStatus(1, 1))).resolves.toBe(true);
      await expect(settle(() => service.getStatus(1, 2))).resolves.toBe(false);
    });

    it('FR-009: criadora inexistente lança CreatorNotFoundError', async () => {
      await expect(
        settle(() => service.getStatus(999, 1)),
      ).rejects.toBeInstanceOf(CreatorNotFoundError);
    });

    it('FR-010: usuário inexistente lança UserNotFoundError', async () => {
      await expect(
        settle(() => service.getStatus(1, 999)),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('FR-011: criadora e usuário inexistentes lança CreatorNotFoundError', async () => {
      await expect(
        settle(() => service.getStatus(999, 999)),
      ).rejects.toBeInstanceOf(CreatorNotFoundError);
    });
  });
});
