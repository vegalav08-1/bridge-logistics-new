import type { ACLContext, Resource, Action } from './types';
import { buildAbility } from './ability';
import { explainDeny } from './explain';

export function ensureAccess(ctx: ACLContext, res: Resource, act: Action) {
  const ability = buildAbility(ctx);
  if (!ability.can(res, act)) {
    return { ok:false, reason: explainDeny(res, act, ctx) };
  }
  return { ok:true, reason:null };
}


