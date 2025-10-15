import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./client/test-setup.ts'],
    globals: true,
    silent: false,
  },
});
