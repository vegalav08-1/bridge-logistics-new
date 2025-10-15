'use client';
import { useQA } from '@/lib/wms/useQA';

export default function QATab({ orderId }: { orderId: string }) {
  const qa = useQA(orderId);
  return (
    <div className="space-y-2">
      <button className="h-10 px-3 rounded-xl border" onClick={() => qa.upsert({
        id: crypto.randomUUID(), receivingItemId: 'ri_any', severity: 'MEDIUM', kind: 'PACKAGING', comment: 'weak box'
      } as any)}>+ QA issue</button>

      {qa.issues.map(i => (
        <div key={i.id} className="rounded-2xl border p-2 flex justify-between">
          <div className="text-sm">{i.kind} · {i.severity} — {i.comment}</div>
          <div className="text-xs text-gray-600">{i.resolved ? 'resolved' : 'open'}</div>
        </div>
      ))}
    </div>
  );
}

