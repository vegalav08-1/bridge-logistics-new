'use client';
import { useCallback, useEffect, useState } from 'react';
import { listItems, listLocations, updateStock } from './api';
import type { Item, Location } from './types';

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [locs, setLocs] = useState<Location[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => { 
    setBusy(true);
    const [it, lc] = await Promise.all([listItems(), listLocations()]);
    setItems(it); 
    setLocs(lc); 
    setBusy(false);
  }, []);

  const adjust = useCallback(async (id: string, delta: number) => {
    const upd = await updateStock(id, delta);
    setItems(x => x.map(i => i.id === id ? upd : i));
  }, []);

  useEffect(() => { load(); }, [load]);
  return { items, locs, load, adjust, busy };
}


