'use client';
import { useReturns } from '@/lib/wms/useReturns';

export default function ReturnsTab({ orderId }: { orderId: string }) {
  const r = useReturns(orderId);
  return (
    <div className="space-y-2">
      <button className="h-10 px-3 rounded-xl border" onClick={() => r.create({
        reason: 'DEFECT', initiatedBy: 'ADMIN', items: [{ receivingItemId: 'ri_any', qty: { units: 1 } }]
      } as any)}>Create return</button>

      {r.list.map(x => (
        <div key={x.id} className="rounded-2xl border p-2 flex justify-between items-center">
          <div className="text-sm">{x.reason} · {x.status}</div>
          <div className="flex gap-2">
            {x.status !== 'CLOSED' && <button className="h-8 px-2 rounded-lg border text-xs" onClick={() => r.patch(x.id, { status: 'CLOSED' })}>Close</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

