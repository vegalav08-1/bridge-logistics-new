'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { ReconcileDiff } from './types';

export function useReconcile(orderId: string) {
  const [diffs, setDiffs] = useState<ReconcileDiff[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { setLoading(true); setDiffs(await api.listDiffs(orderId)); setLoading(false); })(); }, [orderId]);
  async function upsert(d: ReconcileDiff) { const res = await api.upsertDiff(orderId, d); setDiffs(prev => [res, ...prev.filter(x => x.id !== res.id)]); }
  return { diffs, loading, upsert };
}

