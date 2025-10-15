import type { Action, ACLContext, Resource } from './types';
import { buildPolicy, type PolicyRule } from './policy';

const RULES: PolicyRule[] = buildPolicy();

export type Ability = {
  can: (res: Resource, act: Action) => boolean;
  soft: (res: Resource, act: Action) => boolean;   // есть soft-правило
  reason: (res: Resource, act: Action) => string | null;
};

function key(res: Resource, act: Action, ctx: ACLContext) {
  const flags = JSON.stringify(ctx.tenantFlags || {});
  return `${ctx.role}|${res}|${act}|${ctx.userId}|${ctx.ownerId}|${ctx.shipmentStatus}|${flags}`;
}

export function buildAbility(ctx: ACLContext): Ability {
  const cache = new Map<string, boolean>();
  const softCache = new Map<string, boolean>();

  const can = (res: Resource, act: Action) => {
    const k = key(res, act, ctx);
    if (cache.has(k)) return cache.get(k)!;
    const rules = RULES.filter(r => r.res === res && r.act === act && r.roles.includes(ctx.role));
    if (rules.length === 0) { cache.set(k,false); return false; }
    const ok = rules.some(r => r.when ? r.when(ctx) : true);
    cache.set(k, ok);
    softCache.set(k, rules.some(r => !!r.soft));
    return ok;
  };

  const soft = (res: Resource, act: Action) => softCache.get(key(res,act,ctx)) || false;

  // reason() будет делегировать в explain.ts
  return { can, soft, reason: () => null };
}


