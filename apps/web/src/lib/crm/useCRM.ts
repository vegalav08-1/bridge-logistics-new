'use client';
import { useEffect, useState, useCallback } from 'react';
import * as api from './api';
import type { CRMProfile, KPI, TimelineEvent } from './types';

export function useCRM(id: string, kind: 'USER' | 'PARTNER') {
  const [profile, setProfile] = useState<CRMProfile | null>(null);
  const [kpi, setKPI] = useState<KPI | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const p = await api.fetchProfile(id, kind);
    const k = await api.fetchKPI(id);
    const t = await api.fetchTimeline(id);
    setProfile(p); setKPI(k); setTimeline(t); setLoading(false);
  }, [id, kind]);

  useEffect(() => { load(); }, [load]);

  async function save(patch: Partial<CRMProfile>) { if (!profile) return; const res = await api.saveProfile({ ...patch, id: profile.id }); setProfile(res); }
  async function refreshKPI() { if (!profile) return; setKPI(await api.fetchKPI(profile.id)); }

  return { profile, kpi, timeline, loading, reload: load, save, refreshKPI, setTimeline };
}

