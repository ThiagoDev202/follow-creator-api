import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  setupFiles: ['<rootDir>/tests/helpers/env.ts'],
  globalSetup: '<rootDir>/tests/helpers/global-setup.ts',
};

export default config;
