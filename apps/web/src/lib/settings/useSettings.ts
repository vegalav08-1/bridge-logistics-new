'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Settings, WarehouseAddress } from './types';
import { fetchSettings, saveSettings, addWarehouse, updateWarehouse, removeWarehouse } from './api';

export function useSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); 
    setError(null);
    try { 
      setData(await fetchSettings()); 
    } catch (e: any) { 
      setError(e?.message ?? 'Ошибка загрузки настроек'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  const save = useCallback(async (patch: Partial<Settings>) => {
    setLoading(true); 
    setError(null);
    try { 
      const s = await saveSettings(patch); 
      setData(s); 
    } catch (e: any) { 
      setError(e?.message ?? 'Ошибка сохранения'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  const wh = {
    add: async (w: Omit<WarehouseAddress, 'id'>) => { 
      const nw = await addWarehouse(w); 
      setData(d => d ? { ...d, warehouses: [nw, ...d.warehouses] } : d); 
    },
    update: async (w: WarehouseAddress) => { 
      const uw = await updateWarehouse(w); 
      setData(d => d ? { ...d, warehouses: d.warehouses.map(x => x.id === uw.id ? uw : x) } : d); 
    },
    remove: async (id: string) => { 
      await removeWarehouse(id); 
      setData(d => d ? { ...d, warehouses: d.warehouses.filter(x => x.id !== id) } : d); 
    },
  };

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load, save, wh };
}


