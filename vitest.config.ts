import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    reporters: 'default',
    // The demo-store tests share a scratch file; keep them in one worker.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
