import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
