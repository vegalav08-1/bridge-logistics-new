'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { ReceivingSession, ReceivingItem, PhotoMeta } from './types';

export function useReceiving(orderId: string, actorId: string) {
  const [session, setSession] = useState<ReceivingSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true); setSession(await api.startReceiving(orderId, actorId)); setLoading(false);
  })(); }, [orderId, actorId]);

  async function add(partial: Partial<ReceivingItem>) { if (!session) return; const it = await api.addReceivingItem(session.id, partial); setSession({ ...session, items: [it, ...session.items] }); }
  async function patch(itemId: string, patch: Partial<ReceivingItem>) { if (!session) return; const it = await api.patchReceivingItem(session.id, itemId, patch); setSession({ ...session, items: session.items.map(x => x.id === itemId ? it : x) }); }
  async function photo(itemId: string, file: File) { const key = `rec:${session?.id}:${itemId}`; const meta = await api.uploadPhoto(key, file); return meta as PhotoMeta; }
  async function close() { if (!session) return; await api.closeReceiving(session.id); }

  return { session, loading, add, patch, photo, close };
}

