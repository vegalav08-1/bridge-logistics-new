import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}', '*.{ts,tsx,js,jsx}'],
    ignores: ['dist/**', 'node_modules/**', '.next/**', '**/*.d.ts', '**/.next/**', '**/.*/**', '**/.*'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        module: 'readonly',
        require: 'readonly',
        React: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        crypto: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
