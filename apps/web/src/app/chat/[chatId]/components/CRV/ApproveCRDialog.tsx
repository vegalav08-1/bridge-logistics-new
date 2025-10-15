'use client';
import { useState, useEffect } from 'react';
import { useCRV } from '@/lib/crv/useCRV';
import DiffViewer from '@/app/chat/[chatId]/components/CRV/DiffViewer';

export default function ApproveCRDialog({ orderId, crId, open, onClose, actor }: {
  orderId: string; crId: string; open: boolean; onClose: () => void; actor: { id: string; role: any };
}) {
  const crv = useCRV(orderId);
  const [cr, setCr] = useState<any>(null);
  useEffect(() => { (async () => { if (open) { const list = await crv.list(); setCr(list.find((x: any) => x.id === crId)); } })(); }, [open, crId]);

  if (!open || !cr) return null;

  const act = async (decision: 'APPROVE' | 'REJECT', comment?: string) => {
    await crv.decide({ crId, decision, comment }, actor);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-2xl p-4 w-[720px] max-w-[98vw] space-y-3">
        <div className="text-lg font-semibold">Согласование изменения</div>
        <div className="text-sm text-gray-600">Обоснование: {cr.rationale}</div>
        <DiffViewer fields={cr.fields} />
        <div className="flex justify-end gap-2">
          <button className="h-10 px-3 rounded-xl border" onClick={() => onClose()}>Закрыть</button>
          <button className="h-10 px-3 rounded-xl border" onClick={() => act('REJECT', 'Недопустимо')}>Отклонить</button>
          <button className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={() => act('APPROVE')}>Согласовать и применить</button>
        </div>
      </div>
    </div>
  );
}
