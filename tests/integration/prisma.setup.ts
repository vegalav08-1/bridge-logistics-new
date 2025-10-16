import 'dotenv/config';
import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';

beforeAll(async () => {
  // миграции на тестовую БД
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
});

afterAll(async () => {
  // noop: БД гасим через db:test:down
});







