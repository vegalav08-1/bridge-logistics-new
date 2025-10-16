import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    reporters: ['default', ['junit', { outputFile: 'artifacts/junit-unit.xml' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', ['json', { file: 'artifacts/coverage-unit.json' }], ['html', { subdir: 'artifacts/coverage-unit' }]],
      statements: 85,
      branches: 75,
      functions: 85,
      lines: 85
    },
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/integration/**', 'tests/e2e/**']
  }
});







