import baseConfig from '../../eslint.config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...baseConfig[1]?.languageOptions?.globals,
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        NodeJS: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(DISCONNECTED|CONNECTING|CONNECTED|RECONNECTING|FAILED|data)$'
      }],
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(DISCONNECTED|CONNECTING|CONNECTED|RECONNECTING|FAILED|data)$'
      }],
    },
  },
];
