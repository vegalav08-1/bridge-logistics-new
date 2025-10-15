import { prisma } from '@yp/db';
import dayjs from 'dayjs';

export type SummaryPayload = {
  kind: 'summary';
  entity: 'request' | 'shipment';
  data: Record<string, any>;  // поля формы (без чувствительного)
};

function generateChatNumber(prefix: 'RQ' | 'SH'): string {
  // BRYYYYMMDD_0001 — можно унифицировать в @yp/shared
  const d = dayjs().format('YYYYMMDD');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${d}_${rand}`;
}

export async function createChatWithSummary(opts: {
  entity: 'request' | 'shipment';
  authorUserId: string;
  adminId: string;
  summary: SummaryPayload;
  status: 'REQUEST' | 'NEW'; // REQUEST для запросов, NEW для отгрузки созданной напрямую
  tx?: any;                  // транзакция для встраивания
  prismaClient?: any;        // Prisma клиент для использования
}) {
  const number = generateChatNumber(opts.entity === 'request' ? 'RQ' : 'SH');

  // Если передана транзакция, используем её напрямую
  if (opts.tx) {
    const chat = await opts.tx.chat.create({
      data: { 
        number, 
        type: opts.entity === 'request' ? 'REQUEST' : 'SHIPMENT', 
        status: opts.status 
      }
    });
    
    // участники - создаем по одному, чтобы избежать дубликатов
    try {
      await opts.tx.chatMember.create({
        data: { chatId: chat.id, userId: opts.authorUserId, role: 'USER' }
      });
    } catch (error) {
      // Игнорируем ошибку дубликата
    }
    
    try {
      await opts.tx.chatMember.create({
        data: { chatId: chat.id, userId: opts.adminId, role: 'ADMIN' }
      });
    } catch (error) {
      // Игнорируем ошибку дубликата
    }
    
    // первое системное сообщение
    const seq = 1;
    await opts.tx.message.create({
      data: {
        chatId: chat.id,
        kind: 'system',
        seq,
        payload: JSON.stringify(opts.summary)
      }
    });

    return chat;
  }

  // Если транзакция не передана, создаём свою
  const client = opts.prismaClient || prisma;
  return await client.$transaction(async (t: any) => {
    const chat = await t.chat.create({
      data: { 
        number, 
        type: opts.entity === 'request' ? 'REQUEST' : 'SHIPMENT', 
        status: opts.status 
      }
    });
    
    // участники - создаем по одному, чтобы избежать дубликатов
    try {
      await t.chatMember.create({
        data: { chatId: chat.id, userId: opts.authorUserId, role: 'USER' }
      });
    } catch (error) {
      // Игнорируем ошибку дубликата
    }
    
    try {
      await t.chatMember.create({
        data: { chatId: chat.id, userId: opts.adminId, role: 'ADMIN' }
      });
    } catch (error) {
      // Игнорируем ошибку дубликата
    }
    
    // первое системное сообщение
    const seq = 1;
    await t.message.create({
      data: {
        chatId: chat.id,
        kind: 'system',
        seq,
        payload: JSON.stringify(opts.summary)
      }
    });

    return chat;
  });
}

