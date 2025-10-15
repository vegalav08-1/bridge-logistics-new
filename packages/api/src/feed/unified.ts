import { prisma } from '@yp/db';
import { encodeCursor, createCursorFilter } from './cursor';
import { getStatusInfo, getAccentColor } from './status';
import { UserRole } from '../chat/rbac';

// UserRole импортируется из rbac.ts

export interface FeedItem {
  chatId: string;
  number: string;
  type: 'REQUEST' | 'SHIPMENT';
  status: string;
  updatedAt: string;
  preview: {
    title: string;
    subtitle: string;
    labels: string[];
  };
  badges: string[];
  accent: 'green' | 'default';
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface FeedParams {
  userId: string;
  role: UserRole;
  q?: string;
  status?: string;
  type?: 'REQUEST' | 'SHIPMENT';
  cursor?: string;
  limit?: number;
}

/**
 * Получить универсальную ленту отгрузок/заявок
 */
export async function getUnifiedFeed(params: FeedParams): Promise<FeedResponse> {
  const { userId, role, q, status, type, cursor, limit = 20 } = params;
  
  // 1) Собираем chatIds по RBAC
  const chatIds = new Set<string>();
  
  if (role === 'USER') {
    const rows = await prisma.chatMember.findMany({
      where: { userId },
      select: { chatId: true }
    });
    rows.forEach(r => chatIds.add(r.chatId));
  }
  
  if (role === 'ADMIN') {
    // Чаты где админ участник
    const cm = await prisma.chatMember.findMany({
      where: { userId },
      select: { chatId: true }
    });
    cm.forEach(r => chatIds.add(r.chatId));
    
    // Чаты пользователей его ветки
    const rs = await prisma.request.findMany({
      where: { partnerAdminId: userId },
      select: { chatId: true }
    });
    rs.forEach(r => chatIds.add(r.chatId));
    
    const sh = await prisma.shipment.findMany({
      where: { partnerAdminId: userId },
      select: { chatId: true }
    });
    sh.forEach(r => chatIds.add(r.chatId));
  }
  
  // 2) Поиск q → сужаем chatIds
  if (q) {
    
    // По номеру чата
    const byChatNumber = await prisma.chat.findMany({
      where: { number: { contains: q } },
      select: { id: true }
    });
    byChatNumber.forEach(r => chatIds.add(r.id));
    
    // По заявкам
    const byReq = await prisma.request.findMany({
      where: {
        OR: [
          { oldTrackNumber: { contains: q } },
          { description: { contains: q } }
        ]
      },
      select: { chatId: true }
    });
    byReq.forEach(r => chatIds.add(r.chatId));
    
    // По отгрузкам
    const byShip = await prisma.shipment.findMany({
      where: {
        OR: [
          { trackingNumber: { contains: q } },
          { notes: { contains: q } }
        ]
      },
      select: { chatId: true }
    });
    byShip.forEach(r => chatIds.add(r.chatId));
  }
  
  // 3) Базовый where для Chat
  let whereChat: Record<string, unknown> = {};
  
  if (role !== 'SUPER_ADMIN') {
    whereChat.id = { in: Array.from(chatIds) };
  }
  
  if (type) {
    whereChat.type = type;
  }
  
  if (status) {
    whereChat.status = { in: status.split(',') };
  }
  
  // 4) Курсор
  const cursorFilter = createCursorFilter(cursor || null);
  if (Object.keys(cursorFilter).length > 0) {
    whereChat = { ...whereChat, ...cursorFilter };
  }
  
  // 5) Фетч чатов
  const chats = await prisma.chat.findMany({
    where: whereChat,
    orderBy: [
      { updatedAt: 'desc' },
      { id: 'desc' }
    ],
    take: limit + 1,
    select: {
      id: true,
      number: true,
      type: true,
      status: true,
      updatedAt: true,
      request: {
        select: {
          description: true,
          oldTrackNumber: true,
          weightKg: true,
          boxPcs: true,
          volumeM3: true
        }
      },
      shipment: {
        select: {
          trackingNumber: true,
          notes: true
        }
      }
    }
  });
  
  const hasMore = chats.length > limit;
  const slice = chats.slice(0, limit);
  
  // 6) Маппинг в карточки
  const items: FeedItem[] = slice.map((c) => {
    const isReq = c.type === 'REQUEST';
    const statusInfo = getStatusInfo(c.status, c.type as 'REQUEST' | 'SHIPMENT');
    
    const preview = isReq
      ? {
          title: c.request?.description ?? 'Запрос',
          subtitle: [
            c.request?.weightKg ? `Вес: ${c.request.weightKg} кг` : null,
            c.request?.boxPcs ? `${c.request.boxPcs} кор.` : null,
            c.request?.volumeM3 ? `${c.request.volumeM3} м³` : null
          ].filter(Boolean).join(' • '),
          labels: c.request?.oldTrackNumber ? [`oldTrack: ${c.request.oldTrackNumber}`] : []
        }
      : {
          title: c.shipment?.notes ?? 'Отгрузка',
          subtitle: c.shipment?.trackingNumber ? `Трек: ${c.shipment.trackingNumber}` : '',
          labels: []
        };
    
    return {
      chatId: c.id,
      number: c.number,
      type: c.type as 'REQUEST' | 'SHIPMENT',
      status: c.status,
      updatedAt: c.updatedAt.toISOString(),
      preview,
      badges: [statusInfo.label],
      accent: getAccentColor(c.type as 'REQUEST' | 'SHIPMENT')
    };
  });
  
  const nextCursor = hasMore && slice.length > 0 
    ? encodeCursor({
        updatedAt: slice[slice.length - 1].updatedAt.toISOString(),
        id: slice[slice.length - 1].id
      })
    : null;
  
  return { items, nextCursor };
}
