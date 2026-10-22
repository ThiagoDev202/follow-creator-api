import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import pg from 'pg';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = args[0];
const useTest = args.includes('--test');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function databaseName(url) {
  try {
    return new URL(url).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

function resolveTestUrl() {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    fail('DATABASE_URL_TEST is missing.');
  }
  if (testUrl === process.env.DATABASE_URL) {
    fail('DATABASE_URL_TEST must differ from DATABASE_URL.');
  }
  if (!databaseName(testUrl).endsWith('_test')) {
    fail('DATABASE_URL_TEST must point to a database whose name ends with _test.');
  }
  return testUrl;
}

async function run(connectionString, dropFirst) {
  const schema = readFileSync(join(root, 'db', 'schema.sql'), 'utf8');
  const seed = readFileSync(join(root, 'db', 'seed.sql'), 'utf8');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    if (dropFirst) {
      await client.query('DROP TABLE IF EXISTS follows, users, creators;');
    }
    await client.query(schema);
    await client.query(seed);
  } finally {
    await client.end();
  }
}

if (command === 'setup') {
  const url = useTest ? resolveTestUrl() : process.env.DATABASE_URL;
  if (!url) {
    fail('DATABASE_URL is missing.');
  }
  await run(url, false);
  console.log('Database setup complete.');
} else if (command === 'rebuild') {
  if (!useTest) {
    fail('rebuild requires the --test flag.');
  }
  await run(resolveTestUrl(), true);
  console.log('Test database rebuilt.');
} else {
  fail('Usage: node scripts/db.mjs <setup|rebuild> [--test]');
}
