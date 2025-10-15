import { NotificationItem } from './types';

// простая in-memory очередь; в реале используйте ваш стейт-менеджер контекста Inbox
let _push: ((n: NotificationItem)=>void) | null = null;
export function registerInboxPush(cb:(n:NotificationItem)=>void){ _push = cb; }
export function unregisterInboxPush(){ _push = null; }

// Глобальный слушатель событий realtime
export function attachInboxRealtime() {
  const on = (e: Event) => {
    const ev = (e as CustomEvent).detail as { type: string; data: any };
    if (ev.type === 'notification.new' && _push) {
      const d = ev.data;
      const n: NotificationItem = {
        id: d.id, kind: 'system_event', title: d.title, body: d.body, link: d.link,
        createdAtISO: d.createdAtISO, read: false
      };
      _push(n);
      // Тост: глобальный кастомный event (см. ниже)
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { title: d.title, description: d.body, actionHref: d.link }
      }));
    }
  };
  window.addEventListener('rt:event', on);
  return () => window.removeEventListener('rt:event', on);
}


