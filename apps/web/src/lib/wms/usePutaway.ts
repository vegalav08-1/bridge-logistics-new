'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { Bin, PutawayMove } from './types';

export function usePutaway(orderId: string, actorId: string) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [moves, setMoves] = useState<PutawayMove[]>([]);
  useEffect(() => { (async () => { setBins(await api.listBins()); setMoves(await api.listMoves(orderId)); })(); }, [orderId]);
  async function move(recItemId: string, binCode: string, qty: { units: number }) {
    const m: PutawayMove = { id: `mv_${Math.random().toString(36).slice(2)}`, receivingItemId: recItemId, binCode, qty: { units: qty.units }, movedAtISO: new Date().toISOString(), by: actorId };
    const res = await api.putaway(orderId, m); setMoves(prev => [res, ...prev]); return res;
  }
  return { bins, moves, move };
}

