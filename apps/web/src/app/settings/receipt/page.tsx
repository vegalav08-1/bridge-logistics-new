'use client';
import React from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { useSettings } from '@/lib/settings/useSettings';
import { receiptSchema } from '@/lib/settings/schema';

export default function ReceiptSettings() {
  const s = useSettings();
  const [addr, setAddr] = React.useState('');

  React.useEffect(() => { 
    if (s.data?.receiptAddress) setAddr(s.data.receiptAddress); 
  }, [s.data]);

  const save = async () => {
    const z = receiptSchema.safeParse({ receiptAddress: addr });
    if (!z.success) return alert('Укажите адрес');
    await s.save(z.data);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Адрес получения</h1>
      </div>
      <div className="mt-3 grid gap-2">
        <textarea 
          rows={4} 
          className="rounded-xl border px-3 py-2" 
          placeholder="Адрес" 
          value={addr} 
          onChange={e => setAddr(e.target.value)} 
        />
        <div className="flex justify-end">
          <button 
            className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white" 
            onClick={save}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
