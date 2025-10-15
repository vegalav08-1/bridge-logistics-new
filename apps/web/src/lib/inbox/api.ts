import type { NotificationItem } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function listNotifications(): Promise<NotificationItem[]> {
  await wait(300);
  return [
    { id: 'n1', kind: 'chat_message', title: 'Новое сообщение в чате #REQ-1032', link: '/chat/req_1032',
      createdAtISO: new Date(Date.now() - 60_000).toISOString(), read: false },
    { id: 'n2', kind: 'shipment_status', title: 'Отгрузка SHP-442 доставлена', link: '/shipments/SHP-442',
      createdAtISO: new Date(Date.now() - 3600_000).toISOString(), read: true },
    { id: 'n3', kind: 'promo', title: '🎁 20% скидка на упаковку', createdAtISO: new Date(Date.now() - 86400000).toISOString(), read: true },
  ];
}

export async function markAsRead(id: string) { await wait(100); return true; }
export async function markAllAsRead() { await wait(200); return true; }


