'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from './api';
import type { PartnersPayload, Partner } from './types';

export function usePartners() {
  const [payload, setPayload] = useState<PartnersPayload | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setPayload(await api.fetchPartners());
    setLoading(false);
  }, []);

  const search = useCallback(async (value: string) => {
    setQ(value);
    setLoading(true);
    setPayload(await api.searchPartners(value));
    setLoading(false);
  }, []);

  const meRole = payload?.meRole ?? 'USER';
  const partners: Partner[] = payload?.partners ?? [];

  const counters = useMemo(() => ({
    total: partners.length,
    unread: partners.reduce((a, p) => a + (p.unread || 0), 0)
  }), [partners]);

  useEffect(() => { load(); }, [load]);

  return { meRole, partners, q, search, load, loading, counters };
}

