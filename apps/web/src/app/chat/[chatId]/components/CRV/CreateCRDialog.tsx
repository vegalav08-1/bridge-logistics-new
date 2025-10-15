'use client';
import { useState } from 'react';
import { useCRV } from '@/lib/crv/useCRV';

export default function CreateCRDialog({ orderId, baseVersion, open, onClose }: {
  orderId: string; baseVersion: number; open: boolean; onClose: () => void;
}) {
  const crv = useCRV(orderId);
  const [fields, setFields] = useState<any[]>([]);
  const [rationale, setRationale] = useState('');
  const add = (f: any) => setFields(prev => [...prev, f]);

  if (!open) return null;
  const save = async () => {
    await crv.create({ orderId, baseVersion, rationale, fields });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-2xl p-4 w-[620px] max-w-[95vw] space-y-3">
        <div className="text-lg font-semibold">Запросить изменение</div>

        {/* простые пресеты полей — на реальном проекте заменить на полноценные формы */}
        <div className="grid gap-2">
          <button className="h-10 rounded-xl border px-3" onClick={() => add({ key: 'delivery.address', next: '' })}>+ Адрес доставки</button>
          <button className="h-10 rounded-xl border px-3" onClick={() => add({ key: 'delivery.date', next: new Date().toISOString() })}>+ Дата доставки</button>
          <button className="h-10 rounded-xl border px-3" onClick={() => add({ key: 'pricing.total', next: 0, currency: 'USD' })}>+ Стоимость</button>
          <button className="h-10 rounded-xl border px-3" onClick={() => add({ key: 'items.add', next: [] })}>+ Добавить позиции</button>
          <button className="h-10 rounded-xl border px-3" onClick={() => add({ key: 'items.remove', next: [] })}>+ Удалить позиции</button>
        </div>

        <textarea className="w-full rounded-xl border p-2" rows={3} placeholder="Обоснование" value={rationale} onChange={e => setRationale(e.target.value)} />

        <div className="flex justify-end gap-2">
          <button className="h-10 px-3 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-10 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={save} disabled={!fields.length || !rationale}>Отправить</button>
        </div>
      </div>
    </div>
  );
}

