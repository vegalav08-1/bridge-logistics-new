'use client';
import React from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { useSettings } from '@/lib/settings/useSettings';
import { citySchema } from '@/lib/settings/schema';

export default function CitySettings() {
  const s = useSettings();
  const [city, setCity] = React.useState('');

  React.useEffect(() => { 
    if (s.data?.defaultCity) setCity(s.data.defaultCity); 
  }, [s.data]);

  const save = async () => {
    const z = citySchema.safeParse({ defaultCity: city });
    if (!z.success) return alert('Укажите город');
    await s.save({ defaultCity: z.data.defaultCity });
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Город</h1>
      </div>
      <div className="mt-3 grid gap-2">
        <input 
          className="h-11 rounded-xl border px-3" 
          placeholder="Город" 
          value={city} 
          onChange={e => setCity(e.target.value)} 
        />
        <div className="flex justify-end">
          <button 
            className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white" 
            onClick={save} 
            disabled={s.loading}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
