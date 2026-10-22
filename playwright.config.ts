import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!testDatabaseUrl || testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL_TEST must be set and differ from DATABASE_URL.',
  );
}

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  globalSetup: './e2e/global-setup.ts',
  webServer: {
    command: 'npm run build && node dist/main',
    env: { PORT: '3100', DATABASE_URL: testDatabaseUrl },
    reuseExistingServer: false,
    url: 'http://localhost:3100',
    timeout: 120000,
  },
});
