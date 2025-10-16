# 🚀 Bridge ERP - Интеллектуальная система управления логистикой

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=prisma&logoColor=white)](https://prisma.io/)

## 📋 Описание

**Bridge ERP** - это современная система управления логистикой, построенная на основе Next.js 14, TypeScript и Prisma. Система обеспечивает полный цикл управления отгрузками, от создания заявок до доставки, с поддержкой real-time коммуникации, файлового хранилища и продвинутой аналитики.

## ✨ Основные возможности

### 🚚 Управление отгрузками
- **FSM (Finite State Machine)** - четкое управление статусами отгрузок
- **Real-time чаты** - мгновенная коммуникация между участниками
- **QR-коды** - быстрый доступ к информации об отгрузках
- **Merge/Split** - объединение и разделение отгрузок

### 📁 Файловое хранилище
- **S3/MinIO интеграция** - надежное хранение файлов
- **Chunked uploads** - загрузка больших файлов по частям
- **Антивирусная проверка** - безопасность файлов
- **OCR** - автоматическое распознавание текста

### 🔐 Безопасность и доступ
- **JWT аутентификация** - безопасный вход в систему
- **RBAC (Role-Based Access Control)** - гибкая система ролей
- **ACL (Access Control Lists)** - детальный контроль доступа
- **ABAC (Attribute-Based Access Control)** - контекстные права

### 📊 Аналитика и отчеты
- **CRM система** - управление клиентами и партнерами
- **Финансовая аналитика** - отслеживание доходов и расходов
- **WMS (Warehouse Management)** - управление складом
- **Real-time метрики** - мониторинг производительности

## 🏗️ Архитектура

### Frontend
- **Next.js 14** с App Router
- **TypeScript** для типобезопасности
- **Tailwind CSS** для стилизации
- **React Query** для управления состоянием
- **PWA** поддержка для офлайн работы

### Backend
- **Node.js** с Express.js
- **Prisma ORM** для работы с БД
- **JWT** для аутентификации
- **WebSocket** для real-time коммуникации
- **Nodemailer** для email уведомлений

### База данных
- **PostgreSQL** (рекомендуется для production)
- **SQLite** (для разработки)
- **Prisma Migrations** для управления схемой

### Файловое хранилище
- **S3-совместимое хранилище** (MinIO/AWS S3)
- **Presigned URLs** для безопасной загрузки
- **Sharp** для обработки изображений

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+
- pnpm
- PostgreSQL (для production)
- MinIO (для файлового хранилища)

### Установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/bridge-erp.git
cd bridge-erp
```

2. **Установка зависимостей**
```bash
pnpm install
```

3. **Настройка окружения**
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. **Настройка базы данных**
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. **Запуск системы**
```bash
# Запуск MinIO (в отдельном терминале)
cd minio-server && ./start-minio.sh

# Запуск приложения
pnpm dev
```

Система будет доступна по адресу: http://localhost:3001

## 📁 Структура проекта

```
bridge-erp/
├── apps/
│   └── web/                 # Next.js приложение
├── packages/
│   ├── api/                 # Backend API
│   ├── db/                  # Prisma схема и миграции
│   ├── files/               # Файловое хранилище
│   ├── shared/              # Общие утилиты
│   └── ui/                  # UI компоненты
├── audit/                   # Отчеты аудита
├── tests/                   # Тесты
└── docs/                    # Документация
```

## 🔧 Разработка

### Доступные команды

```bash
# Разработка
pnpm dev              # Запуск в режиме разработки
pnpm build            # Сборка для production
pnpm start            # Запуск production версии

# База данных
pnpm db:generate      # Генерация Prisma клиента
pnpm db:migrate       # Применение миграций
pnpm db:seed          # Заполнение тестовыми данными
pnpm db:studio        # Prisma Studio

# Тестирование
pnpm test             # Запуск тестов
pnpm test:e2e         # E2E тесты
pnpm test:coverage    # Покрытие тестами

# Качество кода
pnpm lint             # Линтинг
pnpm typecheck        # Проверка типов
pnpm format           # Форматирование кода

# Безопасность
pnpm audit            # Проверка уязвимостей
pnpm security:check   # Полная проверка безопасности
```

## 📊 Аудит и качество

Система прошла полный технический аудит:

- ✅ **Безопасность**: 0 уязвимостей
- ✅ **Типизация**: 100% корректная
- ✅ **Производительность**: Оптимизирована
- ✅ **Стабильность**: Высокая

Подробные отчеты доступны в папке `audit/`:
- `audit/sprint1-report.md` - Критические исправления
- `audit/sprint2-report.md` - Средние приоритеты
- `audit/final-report.md` - Итоговый отчет

## 🚀 Production развертывание

### Docker
```bash
docker-compose up -d
```

### Ручное развертывание
1. Настройте PostgreSQL
2. Настройте MinIO/S3
3. Установите переменные окружения
4. Запустите миграции
5. Соберите и запустите приложение

## 📈 Мониторинг

- **Health Check**: `/api/health`
- **Метрики**: Real-time метрики производительности
- **Логи**: Структурированное логирование
- **Алерты**: Автоматические уведомления о проблемах

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## 📞 Поддержка

- **Issues**: [GitHub Issues](https://github.com/your-username/bridge-erp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/bridge-erp/discussions)
- **Email**: support@bridge-erp.com

---

**Bridge ERP** - Современная логистика для современного бизнеса! 🚀