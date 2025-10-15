'use client';
import { useReconcile } from '@/lib/wms/useReconcile';

export default function ReconcileTab({ orderId }: { orderId: string }) {
  const rec = useReconcile(orderId);
  if (rec.loading) return <div className="p-2">Loading…</div>;
  return (
    <div className="space-y-2">
      <button className="h-10 px-3 rounded-xl border" onClick={() => rec.upsert({
        id: crypto.randomUUID(), receivingItemId: 'ri_any', type: 'SHORT', deltaUnits: -1, comment: 'missing 1'
      } as any)}>+ Diff SHORT</button>

      {rec.diffs.map(d => (
        <div key={d.id} className="rounded-2xl border p-2 flex justify-between">
          <div className="text-sm">{d.type} {d.deltaUnits} · {d.comment}</div>
          <div className="text-xs text-gray-600">{d.resolved ? 'resolved' : 'open'}</div>
        </div>
      ))}
    </div>
  );
}

