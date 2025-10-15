'use client';
import Link from 'next/link';

export default function PartnerShipmentsList({ items, onLoadMore, hasMore, loading }: {
  items: any[]; onLoadMore: () => void; hasMore: boolean; loading: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map(it => (
        <Link key={it.id} href={`/chat/${it.id}`} className="block rounded-2xl border p-2 hover:bg-[var(--muted)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{it.number}</div>
              <div className="text-xs text-gray-500">{it.status} · {new Date(it.updatedAtISO).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              {it.debt > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-red-50 border border-red-300 text-red-600">debt</span>}
              {it.unread > 0 && <span className="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center text-white text-[11px]">{it.unread}</span>}
            </div>
          </div>
        </Link>
      ))}
      {hasMore && (
        <div className="flex justify-center">
          <button className="h-10 px-4 rounded-xl border" onClick={onLoadMore} disabled={loading}>{loading ? 'Loading…' : 'Load more'}</button>
        </div>
      )}
      {!items.length && !loading && <div className="text-sm text-gray-500">No shipments yet</div>}
    </div>
  );
}

