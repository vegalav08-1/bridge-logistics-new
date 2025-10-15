import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['tests/integration/prisma.setup.ts'],
    reporters: ['default', ['junit', { outputFile: 'artifacts/junit-int.xml' }]],
    hookTimeout: 60000,
    testTimeout: 60000
  }
});




