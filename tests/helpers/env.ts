import { config } from 'dotenv';

config({ quiet: true });

function databaseName(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

const testUrl = process.env.DATABASE_URL_TEST;

if (!testUrl) {
  throw new Error('DATABASE_URL_TEST is missing.');
}

if (!databaseName(testUrl).endsWith('_test')) {
  throw new Error(
    'DATABASE_URL_TEST must point to a database whose name ends with _test.',
  );
}

if (process.env.TEST_DATABASE_URL_APPLIED !== testUrl) {
  if (testUrl === process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL_TEST must differ from DATABASE_URL.');
  }
  process.env.DATABASE_URL = testUrl;
  process.env.TEST_DATABASE_URL_APPLIED = testUrl;
}
