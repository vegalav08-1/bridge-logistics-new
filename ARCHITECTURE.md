# 🚀 Bridge Logistics - Полная архитектура проекта

## 📋 Обзор проекта

Bridge Logistics - это современная система управления логистикой, построенная на Next.js 14 с использованием TypeScript, Prisma ORM и монoreпо структуры.

## 🎯 Основные компоненты

### 1. Frontend (Next.js 14)
```
apps/web/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (auth)/            # Группа маршрутов аутентификации
│   │   ├── api/               # API Routes
│   │   ├── chat/              # Чат отгрузок
│   │   ├── shipments/         # Управление отгрузками
│   │   └── settings/          # Настройки пользователя
│   ├── components/            # React компоненты
│   │   ├── chat/              # Компоненты чата
│   │   ├── shipments/         # Компоненты отгрузок
│   │   └── ui/                # UI компоненты
│   ├── lib/                   # Утилиты и логика
│   │   ├── auth/              # Аутентификация
│   │   ├── chat/              # Логика чата
│   │   ├── forms/             # Формы и валидация
│   │   └── shipments/         # Логика отгрузок
│   └── styles/                # Стили
```

### 2. Backend Packages (Monorepo)
```
packages/
├── api/                       # API сервер
├── db/                        # База данных (Prisma)
├── files/                     # Файловое хранилище
├── observ/                    # Мониторинг
├── realtime/                  # WebSocket сервер
├── realtime-client/           # WebSocket клиент
├── search/                    # Поиск
├── shared/                    # Общие типы
└── ui/                        # UI компоненты
```

## 🗄️ База данных (Prisma + SQLite)

### Схема данных:
```sql
-- Основные модели
User                    # Пользователи
├── id: String (PK)
├── email: String
├── role: Role (SUPER_ADMIN, ADMIN, USER)
└── parentAdminId: String (FK)

Chat                    # Чаты отгрузок
├── id: String (PK)
├── number: String
├── type: ChatType (REQUEST, SHIPMENT)
└── createdById: String (FK)

Shipment               # Отгрузки
├── id: String (PK)
├── chatId: String (FK)
├── status: ShipmentStatus
├── trackingNumber: String
└── notes: Json (данные отгрузки)

Message                # Сообщения
├── id: String (PK)
├── chatId: String (FK)
├── kind: MessageKind
└── content: String
```

## 🔐 Система аутентификации

### Роли пользователей:
- **SUPER_ADMIN** - супер администратор
- **ADMIN** - администратор  
- **USER** - обычный пользователь

### JWT токены:
```typescript
interface JWTPayload {
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}
```

## 📦 Система отгрузок

### Статусы отгрузок:
```typescript
enum ShipmentStatus {
  REQUEST = 'REQUEST',           // Запрос
  NEW = 'NEW',                   // Новая
  RECEIVE = 'RECEIVE',           // Прием
  RECONCILE = 'RECONCILE',       // Сверка
  PACK = 'PACK',                 // Упаковка
  MERGE = 'MERGE',               // Объединение
  IN_TRANSIT = 'IN_TRANSIT',     // В пути
  ON_DELIVERY = 'ON_DELIVERY',   // На доставке
  DELIVERED = 'DELIVERED',       // Доставлено
  ARCHIVED = 'ARCHIVED',         // Архивировано
  CANCELLED = 'CANCELLED'        // Отменено
}
```

### Формат номера отгрузки:
```
BR{YYYYMMDD}_{Sequence}_{BoxCount}({ClientCode})
Пример: BR20251021_19_1000(VEGALAV0)
```

## 💾 Хранение данных

### 1. Локальная база данных (SQLite)
- **Файл**: `packages/db/prisma/dev.db`
- **Схема**: Prisma schema
- **ORM**: Prisma Client

### 2. localStorage (кэш)
**Ключи:**
- `access_token` - JWT токен
- `user_profile` - профиль пользователя
- `bridge_shipments` - отгрузки
- `shipment_statuses` - статусы отгрузок
- `shipment_{chatId}` - данные чата

### 3. Файловое хранилище (MinIO)
- **Endpoint**: `localhost:9000`
- **Bucket**: `bridge-files`
- **Файлы**: изображения, документы

## 🌐 API Endpoints

### Основные маршруты:
```
GET  /api/shipments          # Список отгрузок
POST /api/shipments          # Создание отгрузки
GET  /api/shipments/[id]     # Детали отгрузки
PUT  /api/shipments/[id]     # Обновление отгрузки

GET  /api/chat/[chatId]      # Сообщения чата
POST /api/chat/[chatId]      # Отправка сообщения

GET  /api/attachments/[id]   # Информация о файле
POST /api/attachments       # Загрузка файла
```

## 🔄 Потоки данных

### 1. Создание отгрузки:
```
Пользователь → Форма → API → База данных → Системное сообщение → Чат
```

### 2. Загрузка отгрузок:
```
Frontend → API → База данных → LocalStorage → UI отображение
```

### 3. Синхронизация статусов:
```
WebSocket → Real-time обновления → UI перерисовка
```

## 🧪 Тестирование

### Структура тестов:
```
__tests__/
├── components/              # Тесты компонентов
├── lib/                     # Тесты утилит
├── api/                     # Тесты API
└── e2e/                     # End-to-end тесты
```

## 🚀 Развертывание

### 1. Локальная разработка:
```bash
# Установка зависимостей
pnpm install

# Запуск базы данных
pnpm db:dev

# Запуск приложения
pnpm dev
```

### 2. Docker:
```bash
# Сборка образа
docker build -t bridge-logistics .

# Запуск контейнера
docker run -p 3000:3000 bridge-logistics
```

## 📊 Мониторинг и аналитика

### 1. Логирование:
- **Уровень**: info, warn, error
- **Формат**: JSON
- **Направление**: Console, File

### 2. Метрики:
- **Производительность**: Время ответа API
- **Использование**: Количество пользователей
- **Ошибки**: Частота ошибок

## 🔧 Конфигурация

### Переменные окружения:
```env
# База данных
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key"

# MinIO
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="bridge-files"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"

# WebSocket
WS_URL="wss://localhost:3001"
```

## 🎨 UI/UX

### Технологии:
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Lucide React** - иконки
- **React Hook Form** - формы
- **Zod** - валидация

### Компоненты:
- **Responsive Design** - адаптивный дизайн
- **Dark/Light Mode** - темы
- **Accessibility** - доступность
- **Internationalization** - интернационализация

## 🔒 Безопасность

### 1. Аутентификация:
- JWT токены
- Роли и разрешения
- Защита маршрутов

### 2. Валидация:
- Zod схемы
- Санитизация данных
- CSRF защита

### 3. Хранение:
- Шифрование паролей
- Безопасные сессии
- HTTPS

## 📈 Производительность

### 1. Оптимизация:
- **Code Splitting** - разделение кода
- **Lazy Loading** - ленивая загрузка
- **Caching** - кэширование
- **Compression** - сжатие

### 2. Мониторинг:
- **Bundle Size** - размер бандла
- **Load Time** - время загрузки
- **Memory Usage** - использование памяти

## 🚀 Будущие улучшения

### 1. Масштабирование:
- **Микросервисы** - разделение на сервисы
- **Kubernetes** - оркестрация
- **Load Balancing** - балансировка нагрузки

### 2. Функциональность:
- **Real-time** - WebSocket
- **Push Notifications** - уведомления
- **Mobile App** - мобильное приложение

### 3. Аналитика:
- **Business Intelligence** - бизнес-аналитика
- **Reporting** - отчеты
- **Dashboard** - панель управления

## 📝 Заключение

Bridge Logistics - это современная, масштабируемая система управления логистикой, построенная с использованием лучших практик разработки. Архитектура проекта обеспечивает высокую производительность, безопасность и удобство использования.

### Ключевые особенности:
- ✅ **Монoreпо структура** - удобное управление пакетами
- ✅ **TypeScript** - типобезопасность
- ✅ **Prisma ORM** - современная работа с БД
- ✅ **Next.js 14** - последние возможности React
- ✅ **Компонентная архитектура** - переиспользование кода
- ✅ **Тестирование** - комплексное покрытие тестами
- ✅ **Документация** - подробная документация

---

**Созданы файлы:**
- 📄 **ARCHITECTURE.md** - подробная документация архитектуры
- 🎨 **architecture-diagram.html** - интерактивная диаграмма архитектуры

