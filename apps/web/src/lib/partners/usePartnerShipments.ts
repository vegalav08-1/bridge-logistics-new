'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ensureReferralRelation, getPartnerInfo, listPartnerShipments } from './api';
import type { PartnerInfo, ShipmentListItem } from './types';

export function usePartnerShipments(partnerId: string) {
  const [guard, setGuard] = useState<{ ok: true; relation: any; meRole: any } | null>(null);
  const [info, setInfo] = useState<PartnerInfo | null>(null);
  const [items, setItems] = useState<ShipmentListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    if (reset) { setCursor(null); setItems([]); setHasMore(true); }
    if (!hasMore && !reset) return;
    setLoading(true);
    if (!guard) { setGuard(await ensureReferralRelation(partnerId)); }
    if (!info) { setInfo(await getPartnerInfo(partnerId)); }
    const { items: chunk, nextCursor } = await listPartnerShipments(partnerId, { q, status, cursor: reset ? null : cursor, limit: 20 });
    setItems(prev => reset ? chunk : [...prev, ...chunk]);
    setCursor(nextCursor);
    setHasMore(Boolean(nextCursor));
    setLoading(false);
  }, [partnerId, q, status, cursor, hasMore, guard, info]);

  useEffect(() => { load(true); }, [q, status, partnerId]); // при смене фильтров — полный рефреш

  const can = useMemo(() => ({
    // быстрые права действий: ADMIN может «создать отгрузку», USER — «создать запрос»
    createShipment: guard?.meRole === 'ADMIN' || guard?.meRole === 'SUPER',
    createRequest: guard?.meRole === 'USER',
  }), [guard]);

  return { guard, info, items, loading, hasMore, load, q, setQ, status, setStatus, can };
}

