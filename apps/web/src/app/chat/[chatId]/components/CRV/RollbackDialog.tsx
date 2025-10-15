'use client';
import { useEffect, useState } from 'react';
import { useCRV } from '@/lib/crv/useCRV';

export default function RollbackDialog({ orderId, open, onClose, actorId }: {
  orderId: string; open: boolean; onClose: () => void; actorId: string;
}) {
  const crv = useCRV(orderId);
  const [versions, setVersions] = useState<any[]>([]);
  const [target, setTarget] = useState<number | undefined>();
  const [reason, setReason] = useState('');

  useEffect(() => { (async () => { if (open) { setVersions(await crv.versions()); } })(); }, [open]);

  if (!open) return null;

  const go = async () => {
    if (!target) return;
    await crv.doRollback({ orderId, targetVersion: target, reason }, actorId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-2xl p-4 w-[620px] max-w-[95vw] space-y-3">
        <div className="text-lg font-semibold">Откат заказа к версии</div>
        <select className="h-11 rounded-xl border px-3 w-full" value={target ?? ''} onChange={e => setTarget(Number(e.target.value))}>
          <option value="" disabled>Выберите версию</option>
          {versions.map(v => <option key={v.version} value={v.version}>v{v.version} — {new Date(v.atISO).toLocaleString()}</option>)}
        </select>
        <textarea className="w-full rounded-xl border p-2" rows={3} placeholder="Причина отката" value={reason} onChange={e => setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="h-10 px-3 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-10 px-3 rounded-xl bg-red-600 text-white" onClick={go} disabled={!target || reason.length < 4}>Откатить</button>
        </div>
      </div>
    </div>
  );
}

