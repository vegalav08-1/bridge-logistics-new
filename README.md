# 🚀 Bridge Logistics System

Современная система управления логистикой и отгрузками с полноценной системой аутентификации и управления ролями.

## 📋 Содержание

- [Особенности](#-особенности)
- [Технологии](#-технологии)
- [Быстрый старт](#-быстрый-старт)
- [Структура проекта](#-структура-проекта)
- [Система ролей](#-система-ролей)
- [API документация](#-api-документация)
- [Развертывание](#-развертывание)
- [CI/CD](#-cicd)
- [Вклад в проект](#-вклад-в-проект)

## ✨ Особенности

- 🔐 **Полноценная система аутентификации** с JWT токенами
- 👥 **Ролевая система** (SUPER_ADMIN, ADMIN, USER)
- 🛡️ **Защищенные маршруты** с middleware
- 📱 **Адаптивный дизайн** для всех устройств
- 🚀 **Автоматический CI/CD** с GitHub Actions
- 🔒 **Безопасность** с регулярными проверками
- 📊 **Админ панель** для управления системой

## 🛠 Технологии

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Lucide React** - Иконки

### Backend
- **Node.js** - Серверная среда
- **Express.js** - Web фреймворк
- **JWT** - Аутентификация
- **Prisma** - ORM для базы данных

### DevOps
- **pnpm** - Пакетный менеджер
- **GitHub Actions** - CI/CD
- **Docker** - Контейнеризация
- **ESLint** - Линтинг кода

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm 8+
- Git

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/bridge-logistics.git
cd bridge-logistics
```

2. **Установите зависимости:**
```bash
pnpm install
```

3. **Настройте переменные окружения:**
```bash
cp .env.example .env.local
```

4. **Запустите в режиме разработки:**
```bash
pnpm dev
```

5. **Откройте браузер:**
```
http://localhost:3000
```

## 📁 Структура проекта

```
bridge-logistics/
├── apps/
│   └── web/                    # Next.js приложение
│       ├── src/
│       │   ├── app/           # App Router страницы
│       │   ├── components/     # React компоненты
│       │   ├── lib/           # Утилиты и библиотеки
│       │   └── styles/        # CSS стили
│       └── public/            # Статические файлы
├── packages/
│   ├── api/                   # API пакет
│   ├── db/                    # База данных
│   ├── files/                 # Файловый сервис
│   └── shared/                # Общие компоненты
├── .github/
│   └── workflows/             # GitHub Actions
├── package.json               # Корневой package.json
└── pnpm-workspace.yaml        # Конфигурация workspace
```

## 👥 Система ролей

### Роли пользователей

| Роль | Описание | Доступ к админ панели |
|------|----------|---------------------|
| **SUPER_ADMIN** | Супер администратор | ✅ Полный доступ |
| **ADMIN** | Администратор | ❌ Ограниченный доступ |
| **USER** | Пользователь | ❌ Базовый доступ |

### Тестовые аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| vegalav0202@gmail.com | admin123 | SUPER_ADMIN |
| admin@example.com | admin123 | ADMIN |
| user@example.com | user123 | USER |

## 🔌 API документация

### Аутентификация

#### POST `/api/auth/login`
Вход в систему

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "user123"
}
```

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "user-3",
    "email": "user@example.com",
    "role": "USER",
    "name": "Пользователь"
  }
}
```

#### POST `/api/auth/logout`
Выход из системы

#### GET `/api/auth/me`
Получение информации о текущем пользователе

### Защищенные маршруты

- `/admin/*` - Только для SUPER_ADMIN
- `/api/admin/*` - Только для SUPER_ADMIN

## 🚀 Развертывание

### Production

1. **Настройте переменные окружения:**
```bash
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

2. **Соберите приложение:**
```bash
pnpm build
```

3. **Запустите в production:**
```bash
pnpm start
```

### Docker

```bash
# Сборка образа
docker build -t bridge-logistics .

# Запуск контейнера
docker run -p 3000:3000 bridge-logistics
```

## 🔄 CI/CD

Проект использует GitHub Actions для автоматизации:

### Workflows

- **CI/CD Pipeline** - Основной workflow
- **Security Scan** - Проверка безопасности
- **Dependency Update** - Обновление зависимостей

### Автоматические процессы

1. **При push в develop:**
   - ✅ Проверка кода (ESLint, TypeScript)
   - ✅ Запуск тестов
   - ✅ Сборка приложения
   - ✅ Деплой на staging

2. **При push в main:**
   - ✅ Все проверки develop
   - ✅ Деплой на production
   - ✅ Создание релиза

3. **Еженедельно:**
   - ✅ Обновление зависимостей
   - ✅ Проверка безопасности
   - ✅ Создание PR с обновлениями

## 🧪 Тестирование

```bash
# Запуск всех тестов
pnpm test

# Запуск unit тестов
pnpm test:unit

# Запуск integration тестов
pnpm test:integration

# Запуск e2e тестов
pnpm test:e2e
```

## 📊 Мониторинг

- **Health Check:** `/health`
- **Метрики:** `/metrics`
- **Логи:** Структурированные JSON логи

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

### Стандарты кода

- Используйте TypeScript
- Следуйте ESLint правилам
- Покрывайте код тестами
- Документируйте изменения

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

- 📧 Email: support@bridge-logistics.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/bridge-logistics/issues)
- 📖 Документация: [Wiki](https://github.com/your-username/bridge-logistics/wiki)

---

**Bridge Logistics** - Современное решение для управления логистикой 🚀