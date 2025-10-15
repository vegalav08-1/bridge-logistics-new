import { prisma } from '@yp/db';

/**
 * Получить следующий seq для чата (монолитно/транзакционно)
 * На высокой нагрузке позже заменим на fast-counter (отдельная таблица/redis incr)
 */
export async function nextSeq(chatId: string, tx: any = prisma) {
  // Читаем max(seq) по чату (индекс по chatId,createdAt помогает)
  const last = await tx.message.findFirst({
    where: { chatId },
    orderBy: { seq: 'desc' },
    select: { seq: true }
  });
  return (last?.seq ?? 0) + 1;
}

