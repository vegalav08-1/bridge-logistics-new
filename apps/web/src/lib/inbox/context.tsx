'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { NotificationItem } from './types';
import { listNotifications, markAsRead } from './api';
import { attachInboxRealtime, registerInboxPush, unregisterInboxPush } from './rt-bridge';

type Ctx = {
  items: NotificationItem[];
  unread: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const InboxCtx = createContext<Ctx | null>(null);

export function useInbox() { const ctx = useContext(InboxCtx); if (!ctx) throw new Error('InboxProvider missing'); return ctx; }

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const unread = items.filter(i => !i.read).length;

  const refresh = useCallback(async () => { setItems(await listNotifications()); }, []);
  const markRead = useCallback(async (id: string) => {
    await markAsRead(id);
    setItems(prev => prev.map(x => x.id === id ? { ...x, read: true } : x));
  }, []);

  // начальная загрузка + периодический пуллинг
  useEffect(() => { refresh(); const t = setInterval(refresh, 30_000); return () => clearInterval(t); }, [refresh]);

  // real-time интеграция
  useEffect(() => {
    registerInboxPush((n) => setItems(prev => [n, ...prev]));
    const detach = attachInboxRealtime();
    return () => { unregisterInboxPush(); detach(); };
  }, []);

  return <InboxCtx.Provider value={{ items, unread, refresh, markRead }}>{children}</InboxCtx.Provider>;
}
