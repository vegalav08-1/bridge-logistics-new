'use client';
import { useReceiving } from '@/lib/wms/useReceiving';
import PhotoStrip from './PhotoStrip';

export default function ReceivingTab({ orderId, actorId }: { orderId: string; actorId: string }) {
  const r = useReceiving(orderId, actorId);
  if (r.loading || !r.session) return <div className="p-2">Loading…</div>;
  return (
    <div className="space-y-3">
      <div className="text-sm">Session: {r.session.id} · Started {new Date(r.session.startedAtISO).toLocaleString()}</div>

      <button className="h-10 px-3 rounded-xl border" onClick={() => r.add({ name: 'Box', expected: { units: 1 }, received: { units: 1 } })}>
        + Add item
      </button>

      <div className="space-y-2">
        {r.session.items.map(it => (
          <div key={it.id} className="rounded-2xl border p-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{it.name || it.sku || it.id}</div>
              <div className="text-xs text-gray-600">exp {it.expected?.units ?? 0} · rec {it.received?.units ?? 0}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="h-8 px-2 rounded-lg border" onClick={() => r.patch(it.id, { received: { units: (it.received?.units ?? 0) + 1 } })}>+1 unit</button>
              <button className="h-8 px-2 rounded-lg border" onClick={() => r.patch(it.id, { damage: 'MINOR' })}>Mark damage</button>
            </div>
            <div className="mt-2">
              <PhotoStrip items={it.photos ?? []} onPick={(file) => r.photo(it.id, file)} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={() => r.close()}>Close receiving</button>
      </div>
    </div>
  );
}

