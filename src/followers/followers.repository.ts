import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

export type InsertFollowResult = 'created' | 'existing' | 'missingReference';

const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class FollowersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async insertFollow(
    creatorId: number,
    userId: number,
  ): Promise<InsertFollowResult> {
    try {
      const result = await this.pool.query(
        'INSERT INTO follows (creator_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1',
        [creatorId, userId],
      );
      return result.rowCount === 1 ? 'created' : 'existing';
    } catch (error) {
      if ((error as { code?: string }).code === FOREIGN_KEY_VIOLATION) {
        return 'missingReference';
      }
      throw error;
    }
  }

  async deleteFollow(creatorId: number, userId: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM follows WHERE creator_id = $1 AND user_id = $2',
      [creatorId, userId],
    );
  }

  async findExistence(
    creatorId: number,
    userId: number,
  ): Promise<{ creatorExists: boolean; userExists: boolean }> {
    const result = await this.pool.query<{
      creator_exists: boolean;
      user_exists: boolean;
    }>(
      'SELECT EXISTS(SELECT 1 FROM creators WHERE id = $1) AS creator_exists, EXISTS(SELECT 1 FROM users WHERE id = $2) AS user_exists',
      [creatorId, userId],
    );
    return {
      creatorExists: result.rows[0].creator_exists,
      userExists: result.rows[0].user_exists,
    };
  }

  async countFollowers(creatorId: number): Promise<number | null> {
    const result = await this.pool.query<{ id: number; count: number }>(
      'SELECT c.id, (SELECT COUNT(*)::int FROM follows f WHERE f.creator_id = c.id) AS count FROM creators c WHERE c.id = $1',
      [creatorId],
    );
    return result.rows.length === 0 ? null : result.rows[0].count;
  }

  async isFollowing(creatorId: number, userId: number): Promise<boolean> {
    const result = await this.pool.query<{ following: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM follows WHERE creator_id = $1 AND user_id = $2) AS following',
      [creatorId, userId],
    );
    return result.rows[0].following;
  }
}
