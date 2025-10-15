'use client';
import Link from 'next/link';

export default function ClientShipments({ items }: { items: any[] }) {
  return (
    <div className="space-y-2">
      {items.map(x => (
        <Link 
          key={x.id} 
          href={x.link} 
          className="block rounded-xl border p-2 hover:bg-[var(--muted)]"
        >
          <div className="text-sm font-medium">{x.title}</div>
          <div className="text-xs text-gray-500">
            {x.status} {x.unread > 0 ? `· unread ${x.unread}` : ''}
          </div>
        </Link>
      ))}
    </div>
  );
}

