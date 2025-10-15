import baseConfig from '../../eslint.config.js';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.js'],
  },
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...baseConfig[1]?.languageOptions?.globals,
        Buffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        NodeJS: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },
];
