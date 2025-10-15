import { chatBus, emitAck } from './bus';
import type { ChatMessagePayload, ChatAckPayload } from '@/lib/realtime/types';

export function attachChatRealtime() {
  const on = (e: Event) => {
    const ev = (e as CustomEvent).detail as { type: string; data: any };
    if (ev.type === 'chat.message') {
      const d = ev.data as ChatMessagePayload;
      // Превращаем в локальный формат и рассылаем
      chatBus.dispatchEvent(new CustomEvent('remote-message', { detail: d }));
      // Тост — если пользователь НЕ в этом чате
      const isSameChat = location.pathname.startsWith('/chat/') && location.pathname.includes(d.chatId);
      if (!isSameChat) {
        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { title: `Новое сообщение`, description: d.text ?? d.attachment?.name, actionHref: `/chat/${d.chatId}` }
        }));
      }
    }
    if (ev.type === 'chat.ack') {
      const d = ev.data as ChatAckPayload;
      emitAck({ chatId: d.chatId, tempId: d.tempId, serverId: d.serverId });
    }
  };
  window.addEventListener('rt:event', on);
  return () => window.removeEventListener('rt:event', on);
}


