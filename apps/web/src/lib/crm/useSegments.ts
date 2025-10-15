'use client';
import { useEffect, useState } from 'react';
import { resolveSegments } from './segments';
import type { CRMProfile, SegmentKey } from './types';

export function useSegments(profile: CRMProfile | null) {
  const [segments, setSegments] = useState<SegmentKey[]>([]);
  useEffect(() => { (async () => { if (profile) setSegments(await resolveSegments(profile)); })(); }, [profile]);
  return { segments };
}

