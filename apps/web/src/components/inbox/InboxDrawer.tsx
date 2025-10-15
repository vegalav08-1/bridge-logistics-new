'use client';
import { useInbox } from '@/lib/inbox/context';
import { useNotifications } from '@/lib/notifications/useNotifications';
import Link from 'next/link';
import { X, Check, ExternalLink } from 'lucide-react';
import { markAllAsRead } from '@/lib/inbox/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NOTIFICATIONS_V2_ENABLED } from '@/lib/flags';

type Props = { open: boolean; onClose: () => void; };

export default function InboxDrawer({ open, onClose }: Props) {
  const inbox = useInbox();
  const notifications = useNotifications();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  
  // Используем новую систему уведомлений, если включена, иначе старую Inbox
  const items = NOTIFICATIONS_V2_ENABLED ? notifications.items : inbox.items;
  const unread = NOTIFICATIONS_V2_ENABLED ? notifications.unread : inbox.unread;
  
  const handleMarkRead = async (id: string) => {
    if (NOTIFICATIONS_V2_ENABLED) {
      await notifications.mark([id]);
    } else {
      await inbox.markRead(id);
    }
  };
  
  const handleMarkAll = async () => {
    setBusy(true);
    if (NOTIFICATIONS_V2_ENABLED) {
      await notifications.markAll();
    } else {
      await markAllAsRead();
      await inbox.refresh();
    }
    setBusy(false);
  };
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div data-testid="inbox-drawer" className="w-[360px] max-w-[90vw] bg-white h-full flex flex-col">
        <div className="h-12 flex items-center justify-between px-3 border-b">
          <div className="font-medium">Уведомления</div>
          <div className="flex items-center gap-1">
            <button data-testid="inbox-markall" className="h-9 w-9 rounded-lg grid place-items-center hover:bg-[var(--muted)]"
              title="Отметить все как прочитанные"
              disabled={busy}
              onClick={handleMarkAll}>
              <Check className="h-4 w-4" />
            </button>
            <button 
              className="h-9 w-9 rounded-lg grid place-items-center hover:bg-[var(--muted)]"
              title="Открыть страницу уведомлений"
              onClick={() => { onClose(); router.push('/notifications'); }}
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-lg grid place-items-center hover:bg-[var(--muted)]"
              aria-label="Закрыть" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto divide-y">
          {items.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Нет уведомлений</div>
          )}
          {items.map(n => (
            <Link key={n.id} href={n.link ?? '#'}
              onClick={async () => { await handleMarkRead(n.id); onClose(); }}
              className={`block px-3 py-3 hover:bg-[var(--muted)] ${!n.read ? 'bg-[var(--muted)]/50' : ''}`}>
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <div className="text-[12px] text-[var(--text-secondary)]">{n.body}</div>}
              <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                {new Date(n.createdAtISO).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
