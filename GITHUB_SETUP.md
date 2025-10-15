# 🚀 GitHub Repository Setup Guide

## 📋 Пошаговая инструкция по настройке GitHub репозитория

### 1. **Создание репозитория на GitHub**

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите **"New repository"** (зеленая кнопка)
3. Заполните форму:
   - **Repository name**: `bridge-logistics`
   - **Description**: `🚀 Bridge Logistics System - Modern logistics management with full authentication, role-based access control, and automated CI/CD pipeline`
   - **Visibility**: `Public` (или `Private` если нужно)
   - **Initialize**: НЕ ставьте галочки (у нас уже есть код)

### 2. **Подключение локального репозитория к GitHub**

```bash
# Добавляем remote origin
git remote add origin https://github.com/YOUR_USERNAME/bridge-logistics.git

# Переименовываем ветку в main (если нужно)
git branch -M main

# Пушим код в GitHub
git push -u origin main
```

### 3. **Настройка GitHub Secrets**

Перейдите в **Settings** → **Secrets and variables** → **Actions** и добавьте:

#### **Обязательные секреты:**

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-here` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `your-nextauth-secret-here` |
| `NEXTAUTH_URL` | Application URL | `https://your-domain.com` |

#### **Дополнительные секреты:**

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin123` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |
| `SENTRY_DSN` | Sentry error tracking | `https://...@sentry.io/...` |

### 4. **Настройка Environments**

В **Settings** → **Environments** создайте:

#### **Staging Environment:**
- Name: `staging`
- Protection rules: `Required reviewers: 1`
- Environment secrets: добавьте все секреты для staging

#### **Production Environment:**
- Name: `production`
- Protection rules: `Required reviewers: 2`
- Environment secrets: добавьте все секреты для production

### 5. **Настройка Branch Protection**

В **Settings** → **Branches**:

1. **Add rule** для `main` ветки:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

2. **Add rule** для `develop` ветки:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging

### 6. **Настройка уведомлений**

#### **Slack Integration:**

1. Создайте Slack App: https://api.slack.com/apps
2. Добавьте Webhook URL в GitHub Secrets как `SLACK_WEBHOOK_URL`
3. Обновите workflow файлы с вашим Slack каналом

#### **Discord Integration:**

1. Создайте Discord Webhook в настройках сервера
2. Добавьте Webhook URL в GitHub Secrets как `DISCORD_WEBHOOK_URL`

#### **Email Notifications:**

1. Настройте SMTP в GitHub Secrets
2. GitHub автоматически будет отправлять уведомления

### 7. **Проверка CI/CD Pipeline**

После настройки:

1. Создайте Pull Request
2. Проверьте, что все проверки проходят:
   - ✅ Lint & Type Check
   - ✅ Tests
   - ✅ Build
   - ✅ Security Scan

3. При merge в `main`:
   - ✅ Автоматический деплой на production
   - ✅ Создание релиза
   - ✅ Уведомления команде

### 8. **Мониторинг и аналитика**

#### **GitHub Insights:**
- **Pulse**: активность репозитория
- **Contributors**: статистика участников
- **Traffic**: просмотры и клоны
- **Community**: health score

#### **Actions Monitoring:**
- **Actions** → **All workflows**: статус всех запусков
- **Actions** → **Usage**: использование минут
- **Settings** → **Billing**: управление лимитами

### 9. **Дополнительные настройки**

#### **GitHub Pages (для документации):**
1. **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` или `main` / `docs` folder

#### **Dependabot (автообновления):**
1. **Settings** → **Security** → **Dependabot alerts**
2. **Settings** → **Security** → **Dependabot security updates**

#### **Code Scanning:**
1. **Security** → **Code scanning**
2. Включите **CodeQL analysis**

### 10. **Команды для работы с репозиторием**

```bash
# Клонирование
git clone https://github.com/YOUR_USERNAME/bridge-logistics.git
cd bridge-logistics

# Установка зависимостей
pnpm install

# Запуск в development
pnpm dev

# Запуск тестов
pnpm test

# Сборка
pnpm build

# Деплой
./scripts/deploy.sh staging
./scripts/deploy.sh production

# Мониторинг
./scripts/monitor.sh continuous
```

## 🎯 **Результат**

После настройки у вас будет:

- ✅ **Автоматический CI/CD** при каждом push
- ✅ **Проверки безопасности** еженедельно
- ✅ **Автообновления зависимостей** с PR
- ✅ **Уведомления** в Slack/Discord/Email
- ✅ **Мониторинг** состояния системы
- ✅ **Защищенные ветки** с review процессом

## 📞 **Поддержка**

Если возникли проблемы:

1. Проверьте **Actions** → **All workflows** на ошибки
2. Посмотрите логи в **Actions** → **Failed workflows**
3. Проверьте настройки **Secrets** и **Environments**
4. Убедитесь, что все зависимости установлены

**Bridge Logistics готов к production! 🚀**
