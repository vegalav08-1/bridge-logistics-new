import { prisma } from '@yp/db';
import { nextSeq } from './seq';

export type CreateMessagePayload = {
  clientId?: string;
  kind: 'text' | 'system';
  text?: string;
  payload?: Record<string, any>;
};

/**
 * Создать сообщение в чате с идемпотентностью
 */
export async function createMessage(opts: {
  chatId: string;
  authorId?: string;
  payload: CreateMessagePayload;
  tx?: typeof prisma;
}) {
  const p = opts.tx ?? prisma;
  const { clientId, kind, text, payload: messagePayload } = opts.payload;

  // Проверяем идемпотентность по clientId
  if (clientId) {
    const existing = await p.message.findUnique({
      where: { clientId },
      select: { id: true, chatId: true, seq: true, kind: true, payload: true, createdAt: true }
    });
    
    if (existing) {
      return existing; // Возвращаем существующее сообщение
    }
  }

  return await p.$transaction(async (t) => {
    // Получаем следующий seq
    const seq = await nextSeq(opts.chatId, t);
    
    // Создаем сообщение
    const message = await t.message.create({
      data: {
        chatId: opts.chatId,
        authorId: opts.authorId,
        kind,
        seq,
        clientId,
        payload: JSON.stringify(messagePayload || { text })
      }
    });

    // Обновляем updatedAt чата
    await t.chat.update({
      where: { id: opts.chatId },
      data: { updatedAt: new Date() }
    });

    return message;
  });
}





