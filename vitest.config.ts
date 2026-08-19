import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // Both are process entry points: they parse argv or bind stdio on import,
      // so they are exercised by the CLI smoke tests rather than unit coverage.
      exclude: ['src/cli.ts', 'src/mcp/bin.ts'],
    },
  },
});
