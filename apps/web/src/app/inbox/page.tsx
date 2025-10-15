'use client';
import { useInbox } from '@/lib/inbox/context';
import Link from 'next/link';

export default function InboxPage() {
  const { items } = useInbox();
  return (
    <div className="px-4 py-3 space-y-3">
      <h1 className="text-lg font-semibold">Уведомления</h1>
      {items.length === 0 && <div className="text-sm text-gray-500">Нет уведомлений</div>}
      <ul className="divide-y">
        {items.map(n => (
          <li key={n.id}>
            <Link href={n.link ?? '#'} className={`block py-2 ${!n.read ? 'font-medium' : ''}`}>
              <div>{n.title}</div>
              {n.body && <div className="text-sm text-[var(--text-secondary)]">{n.body}</div>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


