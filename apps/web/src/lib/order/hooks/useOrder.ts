'use client';
import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import type { Order } from '../types';

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setOrder(await api.fetchOrder(id)); setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { order, loading, reload: load, setOrder };
}

