'use client';
import { useEffect, useMemo, useState } from 'react';
import * as api from './api';
import type { Notif } from './types';

export function useNotifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);      // состояние шторки
  const [loading, setLoading] = useState(false);

  const unread = useMemo(() => items.filter(n => !n.read).length, [items]);

  const load = async () => {
    setLoading(true);
    const list = await api.fetchNotifs();
    setItems(list.sort((a, b) => +new Date(b.createdAtISO) - +new Date(a.createdAtISO)));
    setLoading(false);
  };

  const mark = async (ids: string[]) => {
    await api.markRead(ids);
    setItems(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
  };
  
  const markAll = async () => { 
    await api.markAll(); 
    setItems(prev => prev.map(n => ({ ...n, read: true }))); 
  };

  useEffect(() => { load(); }, []);

  return { items, unread, open, setOpen, load, mark, markAll, loading };
}

