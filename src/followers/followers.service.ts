import { Injectable } from '@nestjs/common';
import { CreatorNotFoundError } from '../common/errors/creator-not-found.error';
import { UserNotFoundError } from '../common/errors/user-not-found.error';
import { FollowersRepository } from './followers.repository';

@Injectable()
export class FollowersService {
  constructor(private readonly followersRepository: FollowersRepository) {}

  async follow(
    creatorId: number,
    userId: number,
  ): Promise<{ created: boolean; count: number }> {
    const result = await this.followersRepository.insertFollow(
      creatorId,
      userId,
    );
    if (result === 'missingReference') {
      await this.assertExists(creatorId, userId);
      throw new CreatorNotFoundError();
    }
    const count = await this.followersRepository.countFollowers(creatorId);
    if (count === null) {
      throw new CreatorNotFoundError();
    }
    return { created: result === 'created', count };
  }

  async unfollow(creatorId: number, userId: number): Promise<void> {
    await this.followersRepository.deleteFollow(creatorId, userId);
    await this.assertExists(creatorId, userId);
  }

  async getCount(creatorId: number): Promise<number> {
    const count = await this.followersRepository.countFollowers(creatorId);
    if (count === null) {
      throw new CreatorNotFoundError();
    }
    return count;
  }

  async getStatus(creatorId: number, userId: number): Promise<boolean> {
    await this.assertExists(creatorId, userId);
    return this.followersRepository.isFollowing(creatorId, userId);
  }

  private async assertExists(creatorId: number, userId: number): Promise<void> {
    const { creatorExists, userExists } =
      await this.followersRepository.findExistence(creatorId, userId);
    if (!creatorExists) {
      throw new CreatorNotFoundError();
    }
    if (!userExists) {
      throw new UserNotFoundError();
    }
  }
}
