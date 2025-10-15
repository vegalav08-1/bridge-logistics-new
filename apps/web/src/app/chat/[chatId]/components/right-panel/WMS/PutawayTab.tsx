'use client';
import { usePutaway } from '@/lib/wms/usePutaway';

export default function PutawayTab({ orderId, actorId }: { orderId: string; actorId: string }) {
  const p = usePutaway(orderId, actorId);
  return (
    <div className="space-y-2">
      <div className="rounded-2xl border p-2">
        <div className="text-sm font-medium mb-1">Bins</div>
        <div className="flex flex-wrap gap-2">
          {p.bins.map(b => <span key={b.code} className="h-7 px-2 rounded-full border text-xs">{b.code}</span>)}
        </div>
      </div>

      <button className="h-10 px-3 rounded-xl border" onClick={() => p.move('ri_any', 'A-01-01-01', { units: 1 })}>Move 1 to A-01-01-01</button>

      <div className="rounded-2xl border p-2">
        {p.moves.map(m => (
          <div key={m.id} className="text-sm">{m.receivingItemId} → {m.binCode} · {m.qty.units}u · {new Date(m.movedAtISO).toLocaleString()}</div>
        ))}
      </div>
    </div>
  );
}

