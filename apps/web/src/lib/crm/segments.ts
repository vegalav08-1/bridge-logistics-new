import type { CRMProfile, SegmentKey } from './types';
import * as api from './api';

export async function resolveSegments(profile: CRMProfile): Promise<SegmentKey[]> {
  // базово делегируем на API; позже добавим правила по времени неактивности и рефералам
  const base = await api.computeSegments(profile.id);
  if (profile.referredBy?.kind === 'PARTNER') base.push('REF_ADMIN');
  if (profile.referredBy?.kind === 'USER') base.push('REF_USER');
  return Array.from(new Set(base));
}

