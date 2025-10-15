'use client';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { useInbox } from '@/lib/inbox/context';
import { NOTIFICATIONS_V2_ENABLED, INBOX_V2_ENABLED } from '@/lib/flags';
import Link from 'next/link';

export default function NotificationsPage() {
  const notifications = useNotifications();
  const inbox = useInbox();
  
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
    if (NOTIFICATIONS_V2_ENABLED) {
      await notifications.markAll();
    } else {
      await inbox.refresh();
    }
  };
  
  if (!NOTIFICATIONS_V2_ENABLED && !INBOX_V2_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Notifications feature is disabled</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h1 className="text-lg font-semibold">Уведомления</h1>
      <div className="mt-2 flex gap-2">
        <button 
          className="h-9 px-3 rounded-lg border" 
          onClick={handleMarkAll}
        >
          Отметить все как прочитанные
        </button>
        <div className="text-sm text-gray-600">Непрочитанных: {unread}</div>
      </div>
      <div className="mt-3 space-y-2">
        {items.map(x => (
          <div key={x.id} className={`rounded-2xl border p-3 ${x.read ? 'opacity-70' : ''}`}>
            <div className="text-sm font-medium">{x.title}</div>
            {x.body && <div className="text-xs text-gray-600">{x.body}</div>}
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(x.createdAtISO).toLocaleString()}
            </div>
            <div className="mt-2 flex gap-2">
              {x.link && (
                <Link 
                  className="text-xs underline" 
                  href={x.link} 
                  onClick={() => handleMarkRead(x.id)}
                >
                  Открыть
                </Link>
              )}
              {!x.read && (
                <button 
                  className="text-xs" 
                  onClick={() => handleMarkRead(x.id)}
                >
                  Отметить как прочитанное
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


