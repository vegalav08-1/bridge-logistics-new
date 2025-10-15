'use client';
import { createContext, useContext, useMemo } from 'react';
import type { ACLContext } from './types';
import { buildAbility } from './ability';
import { explainDeny } from './explain';

export const ACLCtx = createContext<{ ctx: ACLContext; ability: ReturnType<typeof buildAbility> } | null>(null);

export function ACLProvider({ ctx, children }: { ctx: ACLContext; children: React.ReactNode }) {
  const ability = useMemo(() => {
    const a = buildAbility(ctx);
    return { ...a, reason: (res, act) => explainDeny(res, act, ctx) };
  }, [ctx.role, ctx.userId, ctx.ownerId, JSON.stringify(ctx.tenantFlags), ctx.shipmentStatus, ctx.locale]);

  return <ACLCtx.Provider value={{ ctx, ability }}>{children}</ACLCtx.Provider>;
}

export function useACL() {
  const v = useContext(ACLCtx);
  if (!v) throw new Error('ACLProvider missing');
  return v;
}


