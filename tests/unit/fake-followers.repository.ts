import {
  FollowersRepository,
  InsertFollowResult,
} from '../../src/followers/followers.repository';

type RepositoryContract = Pick<
  FollowersRepository,
  | 'insertFollow'
  | 'deleteFollow'
  | 'findExistence'
  | 'countFollowers'
  | 'isFollowing'
>;

export class FakeFollowersRepository implements RepositoryContract {
  readonly creators = new Set<number>([1, 2]);
  readonly users = new Set<number>([1, 2, 3]);
  readonly follows = new Set<string>();
  forcedInsertResult: InsertFollowResult | null = null;
  beforeInsert: () => void = () => undefined;
  afterInsert: () => void = () => undefined;

  static key(creatorId: number, userId: number): string {
    return `${creatorId}:${userId}`;
  }

  follow(creatorId: number, userId: number): void {
    this.follows.add(FakeFollowersRepository.key(creatorId, userId));
  }

  isStored(creatorId: number, userId: number): boolean {
    return this.follows.has(FakeFollowersRepository.key(creatorId, userId));
  }

  insertFollow(creatorId: number, userId: number): Promise<InsertFollowResult> {
    this.beforeInsert();
    const result =
      this.forcedInsertResult ?? this.applyInsert(creatorId, userId);
    this.afterInsert();
    return Promise.resolve(result);
  }

  deleteFollow(creatorId: number, userId: number): Promise<void> {
    this.follows.delete(FakeFollowersRepository.key(creatorId, userId));
    return Promise.resolve();
  }

  findExistence(
    creatorId: number,
    userId: number,
  ): Promise<{ creatorExists: boolean; userExists: boolean }> {
    return Promise.resolve({
      creatorExists: this.creators.has(creatorId),
      userExists: this.users.has(userId),
    });
  }

  countFollowers(creatorId: number): Promise<number | null> {
    if (!this.creators.has(creatorId)) {
      return Promise.resolve(null);
    }
    const prefix = `${creatorId}:`;
    const total = [...this.follows].filter((key) =>
      key.startsWith(prefix),
    ).length;
    return Promise.resolve(total);
  }

  isFollowing(creatorId: number, userId: number): Promise<boolean> {
    return Promise.resolve(this.isStored(creatorId, userId));
  }

  private applyInsert(creatorId: number, userId: number): InsertFollowResult {
    if (!this.creators.has(creatorId) || !this.users.has(userId)) {
      return 'missingReference';
    }
    const key = FakeFollowersRepository.key(creatorId, userId);
    if (this.follows.has(key)) {
      return 'existing';
    }
    this.follows.add(key);
    return 'created';
  }
}
