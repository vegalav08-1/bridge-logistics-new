# YP ERP — Monorepo (S0 completed)

Этот репозиторий — каркас ERP с чатами-журналами. Мы идём по спринтам S0 → S13.

## Минимальные требования

- Node 20 LTS, pnpm 9

## Быстрый старт

```bash
pnpm install
pnpm dev # запускает apps/web
```

## Структура

- apps/web — Next.js приложение
- packages/shared — константы, статусы, фиче-флаги
- packages/ui — общие UI-компоненты
- packages/{api,db,realtime,files,observ} — будут наполняться в следующих спринтах

## Качество

- ESLint (strict), Prettier, TypeScript strict
- Husky + lint-staged на pre-commit
- GitHub Actions: lint → typecheck → test → build

## Фиче-флаги (env)

- AUTH_V2_ENABLED, ENFORCE_PARENT_ADMIN, AUTO_ADD_CHAT_MEMBERS,
  CHAT_SUMMARY_ON_CREATE, WS_ENABLED, NEW_FEED_UI, STRICT_STATE_MACHINE

## Дальше

- S1: Prisma схема, роли и индексы
- S2: Auth V2 и страница логина
- ...
