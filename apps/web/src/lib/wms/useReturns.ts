'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { ReturnCase } from './types';

export function useReturns(orderId: string) {
  const [list, setList] = useState<ReturnCase[]>([]);
  useEffect(() => { (async () => { setList(await api.listReturns(orderId)); })(); }, [orderId]);
  async function create(data: Omit<ReturnCase, 'id' | 'createdAtISO' | 'status' | 'orderId'>) {
    const rc = await api.createReturn(orderId, data as any); setList(prev => [rc, ...prev]); return rc;
  }
  async function patch(returnId: string, patch: Partial<ReturnCase>) {
    const rc = await api.patchReturn(orderId, returnId, patch); setList(prev => [rc, ...prev.filter(x => x.id !== rc.id)]); return rc;
  }
  return { list, create, patch };
}

