import './env';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool, QueryResultRow } from 'pg';

const seed = readFileSync(
  join(__dirname, '..', '..', 'db', 'seed.sql'),
  'utf8',
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

export async function resetDatabase(): Promise<void> {
  await pool.query(
    'TRUNCATE follows, users, creators RESTART IDENTITY CASCADE',
  );
  await pool.query(seed);
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function countFollowRows(): Promise<number> {
  const rows = await query<{ total: number }>(
    'SELECT COUNT(*)::int AS total FROM follows',
  );
  return rows[0].total;
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
