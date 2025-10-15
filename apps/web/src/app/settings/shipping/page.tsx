'use client';
import React from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { useSettings } from '@/lib/settings/useSettings';
import { shippingSchema } from '@/lib/settings/schema';

const opts = ['AIR', 'SEA', 'TRUCK', 'RAIL', 'COURIER'] as const;

export default function ShippingSettings() {
  const s = useSettings();
  const [val, setVal] = React.useState<typeof opts[number]>('AIR');

  React.useEffect(() => { 
    if (s.data?.shippingType) setVal(s.data.shippingType as any); 
  }, [s.data]);

  const save = async () => {
    const z = shippingSchema.safeParse({ shippingType: val });
    if (!z.success) return;
    await s.save(z.data);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Тип отгрузки</h1>
      </div>
      <div className="mt-3 grid gap-2">
        <select 
          className="h-11 rounded-xl border px-3" 
          value={val} 
          onChange={e => setVal(e.target.value as any)}
        >
          <option value="AIR">Воздух</option>
          <option value="SEA">Море</option>
          <option value="TRUCK">Грузовик</option>
          <option value="RAIL">Железная дорога</option>
          <option value="COURIER">Курьер</option>
        </select>
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
