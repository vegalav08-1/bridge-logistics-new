export type MessageKind = 'text' | 'system' | 'attachment';

export interface AttachmentMini {
  id: string;
  name: string;
  size: number;          // в байтах
  mime: string;          // 'image/png' | 'application/pdf' | ...
  thumbUrl?: string;     // миниатюра (если image/pdf)
}

export type SystemType = 'status_change' | 'finance' | 'offer' | 'qr';

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  chatId: string;
  createdAtISO: string;
  authorId?: string;
  authorName?: string;
  text?: string;                         // kind=text
  systemType?: SystemType;               // kind=system
  systemPayload?: Record<string, any>;
  attachment?: AttachmentMini;           // kind=attachment
  isMine?: boolean;
  pending?: boolean;                     // в outbox
  failed?: boolean;                      // ошибка отправки
}

export interface MessagesPage {
  items: ChatMessage[];
  prevCursor?: string; // пагинация "вверх"
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Заглушка: заменить реальным fetch */
export async function listMessages(chatId: string, prevCursor?: string): Promise<MessagesPage> {
  await wait(250);
  const base = prevCursor ? parseInt(prevCursor, 10) : 0;

  const mk = (i: number): ChatMessage => {
    const idx = base + i;
    if (idx % 7 === 0) {
      return {
        id: `sys_${idx}`,
        kind: 'system',
        chatId,
        createdAtISO: new Date(Date.now() - idx * 60000).toISOString(),
        systemType: 'status_change',
        systemPayload: { from: 'RECEIVE', to: 'RECONCILE' },
      };
    }
    if (idx % 5 === 0) {
      return {
        id: `att_${idx}`,
        kind: 'attachment',
        chatId,
        createdAtISO: new Date(Date.now() - idx * 60000).toISOString(),
        authorId: 'u2',
        authorName: 'Operator',
        isMine: false,
        attachment: {
          id: `file_${idx}`,
          name: idx % 10 === 0 ? `invoice-${idx}.pdf` : `photo-${idx}.jpg`,
          size: 180_000,
          mime: idx % 10 === 0 ? 'application/pdf' : 'image/jpeg',
        },
      };
    }
    return {
      id: `msg_${idx}`,
      kind: 'text',
      chatId,
      createdAtISO: new Date(Date.now() - idx * 60000).toISOString(),
      authorId: idx % 2 ? 'me' : 'u2',
      authorName: idx % 2 ? 'Me' : 'Operator',
      isMine: !!(idx % 2),
      text: idx % 9 === 0 ? `@Марьяна проверьте, пожалуйста, позицию #${idx}` : `Сообщение ${idx}`,
    };
  };

  const pageSize = 30;
  const items = Array.from({ length: pageSize }).map((_, i) => mk(i));
  const next = base + pageSize >= 300 ? undefined : String(base + pageSize);
  return { items, prevCursor: next };
}


