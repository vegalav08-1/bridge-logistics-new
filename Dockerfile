# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

# Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем приложение
RUN pnpm build

# Production образ
FROM base AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем собранное приложение
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
