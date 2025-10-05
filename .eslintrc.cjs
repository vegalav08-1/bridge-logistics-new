// Корневой ESLint конфиг
module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
  env: { node: true, es2022: true, browser: true },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error'
  },
  ignorePatterns: ['dist/', 'build/', '.next/', 'coverage/', 'node_modules/'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'unused-imports'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/strict',
        'prettier'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
      }
    },
    {
      files: ['apps/web/**/*.{ts,tsx,js}'],
      extends: ['next/core-web-vitals']
    }
  ]
};
