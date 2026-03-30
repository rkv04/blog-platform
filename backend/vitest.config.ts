import { defineConfig } from 'vitest/config';


export default defineConfig({
  test: {
    environment: 'node',
    env: {
      JWT_ACCESS_SECRET: 'test-secret',
    },
  },
});