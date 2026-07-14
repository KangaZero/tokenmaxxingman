import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/cli.ts'],
    },
  },
});
