// Сервер шлёт обёртку с типом события и полезной нагрузкой
export type RTEvent =
  | { type: 'notification.new'; data: NotificationPayload }
  | { type: 'chat.message'; data: ChatMessagePayload }
  | { type: 'chat.ack'; data: ChatAckPayload }
  | { type: 'shipment.status'; data: ShipmentStatusPayload }
  | { type: 'presence.typing'; data: TypingPayload }
  | { type: 'pong'; data?: {} }; // ответ на ping

export type NotificationPayload = {
  id: string;
  title: string;
  body?: string;
  link?: string;
  createdAtISO: string;
};

export type ChatMessagePayload = {
  id: string;           // serverId
  chatId: string;
  authorId: string;
  authorName?: string;
  kind: 'text'|'attachment'|'system';
  text?: string;
  attachment?: { id: string; name: string; size: number; mime: string; thumbUrl?: string; };
  createdAtISO: string;
};

export type ChatAckPayload = {
  tempId: string;
  chatId: string;
  serverId: string;
};

export type ShipmentStatusPayload = {
  chatId: string;
  from: string;
  to: string;
  atISO: string;
};

export type TypingPayload = {
  chatId: string;
  userId: string;
  userName?: string;
  untilISO: string; // когда гасить индикатор
};

// --- клиент отправляет такие сообщения серверу:
export type RTClientMessage =
  | { type: 'ping' }
  | { type: 'typing'; data: { chatId: string; isTyping: boolean } }
  | { type: 'subscribe'; data: { topic: string; id?: string } }      // напр. topic="chat", id=chatId
  | { type: 'unsubscribe'; data: { topic: string; id?: string } };


