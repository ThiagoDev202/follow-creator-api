import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<{ id: number; name: string }[]> {
    const result = await this.pool.query<{ id: number; name: string }>(
      'SELECT id, name FROM users ORDER BY id',
    );
    return result.rows;
  }
}
