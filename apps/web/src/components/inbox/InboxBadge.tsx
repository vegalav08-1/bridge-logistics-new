'use client';
import { Bell } from 'lucide-react';
import { useInbox } from '@/lib/inbox/context';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { NOTIFICATIONS_V2_ENABLED } from '@/lib/flags';

type Props = { onClick?: () => void; };

export default function InboxBadge({ onClick }: Props) {
  const inbox = useInbox();
  const notifications = useNotifications();
  
  // Используем новую систему уведомлений, если включена, иначе старую Inbox
  const unread = NOTIFICATIONS_V2_ENABLED ? notifications.unread : inbox.unread;
  
  return (
    <button data-testid="inbox-bell" type="button" onClick={onClick}
      className="relative h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)]"
      aria-label="Уведомления">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center px-1">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
