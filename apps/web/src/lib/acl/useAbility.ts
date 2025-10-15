'use client';
import type { Action, Resource } from './types';
import { useACL } from './context';
import { sendAccessDenied } from './audit';

export function useAbility() {
  const { ctx, ability } = useACL();
  const guard = (res: Resource, act: Action, onDenied?: () => void) => {
    const ok = ability.can(res, act);
    if (!ok) {
      sendAccessDenied({ resource: res, action: act, ctx, reason: ability.reason(res, act) || 'denied' });
      onDenied?.();
    }
    return ok;
  };
  return { ctx, ability, guard };
}


