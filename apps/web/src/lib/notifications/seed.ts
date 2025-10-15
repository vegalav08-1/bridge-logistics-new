import { seedNotifs } from './api';
import type { Notif } from './types';

// Тестовые уведомления для демонстрации
const testNotifications: Notif[] = [
  {
    id: 'notif_1',
    type: 'status',
    title: 'Отгрузка BR-000101 изменила статус',
    body: 'Статус изменен с "PACK" на "SHIPPED"',
    createdAtISO: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 минут назад
    read: false,
    link: '/chat/shp_101'
  },
  {
    id: 'notif_2',
    type: 'finance',
    title: 'Новый оффер создан',
    body: 'Оффер на сумму 15,000 RUB для отгрузки BR-000102',
    createdAtISO: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
    read: false,
    link: '/chat/shp_102'
  },
  {
    id: 'notif_3',
    type: 'message',
    title: 'Новое сообщение в чате',
    body: 'Администратор отправил сообщение в отгрузке BR-000103',
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 час назад
    read: true,
    link: '/chat/shp_103'
  },
  {
    id: 'notif_4',
    type: 'system',
    title: 'Система обновлена',
    body: 'Доступны новые функции управления складом',
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
    read: true,
    link: '/settings'
  },
  {
    id: 'notif_5',
    type: 'status',
    title: 'Отгрузка BR-000104 доставлена',
    body: 'Отгрузка успешно доставлена получателю',
    createdAtISO: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 часа назад
    read: false,
    link: '/chat/shp_104'
  }
];

// Функция для инициализации тестовых данных
export function initTestNotifications() {
  seedNotifs(testNotifications);
}

// Автоматически инициализируем тестовые данные в development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Небольшая задержка, чтобы убедиться, что все модули загружены
  setTimeout(() => {
    initTestNotifications();
  }, 1000);
}

