import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class CreatorsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(id: number): Promise<{ id: number; name: string } | null> {
    const result = await this.pool.query<{ id: number; name: string }>(
      'SELECT id, name FROM creators WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }
}
