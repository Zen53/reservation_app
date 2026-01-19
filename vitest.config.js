import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/__tests__/**/*.test.*', 'src/**/?(*.)(test|spec).{js,jsx}']
  }
});
