import { test as base } from '@playwright/test';

interface TestDatabase {
  reset: () => Promise<void>;
  close: () => Promise<void>;
}

const testDatabase: TestDatabase = {
  reset: async () =>
    (await import('../tests/helpers/database.js')).resetDatabase(),
  close: async () =>
    (await import('../tests/helpers/database.js')).closeDatabase(),
};

export const test = base.extend<
  { freshDatabase: void },
  { database: TestDatabase; databaseConnection: void }
>({
  database: [testDatabase, { scope: 'worker' }],
  databaseConnection: [
    async ({ database }, use) => {
      await use();
      await database.close();
    },
    { scope: 'worker', auto: true },
  ],
  freshDatabase: [
    async ({ database }, use) => {
      await database.reset();
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
