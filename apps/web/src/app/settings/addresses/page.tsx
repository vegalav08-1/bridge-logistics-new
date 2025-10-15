'use client';
import React from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { useSettings } from '@/lib/settings/useSettings';
import { warehouseSchema } from '@/lib/settings/schema';

export default function WarehousesSettings() {
  const s = useSettings();
  const [newWh, setNewWh] = React.useState({ label: '', address: '', phone: '' });

  const add = async () => {
    const z = warehouseSchema.pick({ label: true, address: true, phone: true }).safeParse(newWh);
    if (!z.success) return alert('Заполните склад');
    await s.wh.add(z.data); 
    setNewWh({ label: '', address: '', phone: '' });
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Адреса складов</h1>
      </div>

      <div className="rounded-2xl border p-3 mt-3 space-y-2">
        <div className="grid gap-2">
          <input 
            className="h-11 rounded-xl border px-3" 
            placeholder="Название"   
            value={newWh.label}   
            onChange={e => setNewWh({ ...newWh, label: e.target.value })} 
          />
          <input 
            className="h-11 rounded-xl border px-3" 
            placeholder="Адрес" 
            value={newWh.address} 
            onChange={e => setNewWh({ ...newWh, address: e.target.value })} 
          />
          <input 
            className="h-11 rounded-xl border px-3" 
            placeholder="Телефон"   
            value={newWh.phone}   
            onChange={e => setNewWh({ ...newWh, phone: e.target.value })} 
          />
          <div className="flex justify-end">
            <button 
              className="h-10 px-4 rounded-xl bg-[var(--brand)] text-white" 
              onClick={add}
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="divide-y">
          {s.data?.warehouses.map(w => (
            <div key={w.id} className="py-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{w.label}</div>
                <div className="text-xs text-gray-500">
                  {w.address}{w.phone ? ` · ${w.phone}` : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="h-8 px-3 rounded-lg border" 
                  onClick={() => s.wh.remove(w.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
