'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchResult } from './types';
import { searchApi } from './api';
import { extractMarkers, normalize } from './tokenize';
import { auditSearch } from './audit';

export function useGlobalSearch() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string|undefined>(undefined);
  const [error, setError] = useState<string|undefined>(undefined);
  const debTimer = useRef<any>(null);

  const canSearch = useMemo(() => normalize(q).length >= 2, [q]);

  const run = useCallback(async (reset=true) => {
    if (!canSearch) { setItems([]); setCursor(undefined); return; }
    setLoading(true); setError(undefined);
    try {
      const res = await searchApi(q, 20);
      setItems(reset ? (res.items as any) : [...items, ...(res.items as any)]);
      setCursor(res.nextCursor);
      auditSearch({ q, markers: extractMarkers(q), count: res.items.length });
    } catch (e:any) { setError(e?.message ?? 'Ошибка поиска'); }
    finally { setLoading(false); }
  }, [q, items, canSearch]);

  const runDebounced = useCallback((value: string) => {
    setQ(value);
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => run(true), 250);
  }, [run]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    await run(false);
  }, [cursor, loading, run]);

  useEffect(() => () => clearTimeout(debTimer.current), []);

  return { q, setQ, run, runDebounced, items, loading, loadMore, error, canSearch };
}


