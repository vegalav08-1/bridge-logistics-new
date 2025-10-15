import { prisma } from '@yp/db';
import { FLAGS } from '@yp/shared';
import { getNotificationWebSocket } from './websocket';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  chatId?: string;
  messageId?: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHoursFrom?: number;
  quietHoursTo?: number;
  preferredLang?: string;
}

/**
 * Создает уведомление для пользователя
 */
export async function createNotification(data: CreateNotificationData): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  try {
    // Проверяем настройки пользователя
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: data.userId }
    });

    // Если уведомления отключены, не создаем
    if (userSettings && !userSettings.pushEnabled && !userSettings.emailEnabled) {
      return;
    }

    // Проверяем тихие часы
    if (userSettings && userSettings.quietHoursFrom !== null && userSettings.quietHoursTo !== null) {
      const now = new Date();
      const currentHour = now.getHours();
      const from = userSettings.quietHoursFrom;
      const to = userSettings.quietHoursTo;

      // Проверяем, находимся ли мы в тихих часах
      if (from !== null && to !== null) {
        if (from <= to) {
          // Обычный случай: 22:00 - 08:00
          if (currentHour >= from || currentHour < to) {
            return;
          }
        } else {
          // Переход через полночь: 22:00 - 08:00
          if (currentHour >= from || currentHour < to) {
            return;
          }
        }
      }
    }

    // Создаем уведомление
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ? JSON.stringify(data.data) : null,
        chatId: data.chatId,
        messageId: data.messageId
      }
    });

    // Отправляем real-time уведомление через WebSocket
    const wsService = getNotificationWebSocket();
    if (wsService) {
      wsService.sendNotificationToUser(data.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body || undefined,
        data: data.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        chatId: notification.chatId || undefined,
        messageId: notification.messageId || undefined
      });
    }

    console.log(`Notification created for user ${data.userId}: ${data.title}`);
  } catch (error) {
    console.error('Error creating notification:', error);
    // Не прерываем основной поток при ошибке создания уведомления
  }
}

/**
 * Создает уведомления для всех участников чата (кроме автора)
 */
export async function createChatNotifications(
  chatId: string,
  authorId: string,
  type: string,
  title: string,
  body?: string,
  data?: any,
  messageId?: string
): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  try {
    // Получаем всех участников чата
    const chatMembers = await prisma.chatMember.findMany({
      where: { chatId },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    // Создаем уведомления для всех участников, кроме автора
    const notifications = chatMembers
      .filter(member => member.userId !== authorId)
      .map(member => createNotification({
        userId: member.userId,
        type,
        title,
        body,
        data,
        chatId,
        messageId
      }));

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating chat notifications:', error);
  }
}

/**
 * Создает уведомление о новом сообщении в чате
 */
export async function createMessageNotification(
  chatId: string,
  authorId: string,
  messageId: string,
  messageKind: string,
  messagePayload: any
): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  try {
    // Получаем информацию о чате
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        request: {
          include: {
            createdBy: { select: { email: true } }
          }
        },
        shipment: {
          include: {
            createdBy: { select: { email: true } }
          }
        }
      }
    });

    if (!chat) return;

    // Определяем тип чата и создаем соответствующий заголовок
    let title = '';
    let body = '';

    if (chat.type === 'REQUEST') {
      title = `Новое сообщение в запросе #${chat.number}`;
    } else if (chat.type === 'SHIPMENT') {
      title = `Новое сообщение в отгрузке #${chat.number}`;
    } else {
      title = `Новое сообщение в чате #${chat.number}`;
    }

    // Формируем тело уведомления в зависимости от типа сообщения
    if (messageKind === 'text' && messagePayload?.text) {
      body = messagePayload.text;
    } else if (messageKind === 'file') {
      body = '📎 Файл';
    } else if (messageKind === 'image') {
      body = '🖼️ Изображение';
    } else if (messageKind === 'video') {
      body = '🎥 Видео';
    } else if (messageKind === 'system') {
      body = '🔔 Системное сообщение';
    } else {
      body = 'Новое сообщение';
    }

    // Создаем уведомления для всех участников чата
    await createChatNotifications(
      chatId,
      authorId,
      'chat_message',
      title,
      body,
      { messageKind, messagePayload },
      messageId
    );
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
}

/**
 * Создает уведомление об изменении статуса отгрузки
 */
export async function createStatusChangeNotification(
  chatId: string,
  userId: string,
  oldStatus: string,
  newStatus: string,
  shipmentNumber: string
): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  await createNotification({
    userId,
    type: 'status_change',
    title: `Статус отгрузки #${shipmentNumber} изменен`,
    body: `${oldStatus} → ${newStatus}`,
    data: { oldStatus, newStatus, shipmentNumber },
    chatId
  });
}

/**
 * Создает уведомление о новом оффере
 */
export async function createOfferNotification(
  chatId: string,
  userId: string,
  offerId: string,
  requestNumber: string
): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  await createNotification({
    userId,
    type: 'offer_created',
    title: `Новый оффер по запросу #${requestNumber}`,
    body: 'Получен новый оффер от партнера',
    data: { offerId, requestNumber },
    chatId
  });
}

/**
 * Создает уведомление о финансовой операции
 */
export async function createFinanceNotification(
  chatId: string,
  userId: string,
  operationType: string,
  amount: number,
  currency: string = 'USD'
): Promise<void> {
  if (!FLAGS.NOTIFICATIONS_V2_ENABLED) {
    return;
  }

  await createNotification({
    userId,
    type: 'finance_op',
    title: `Финансовая операция: ${operationType}`,
    body: `${amount} ${currency}`,
    data: { operationType, amount, currency },
    chatId
  });
}
