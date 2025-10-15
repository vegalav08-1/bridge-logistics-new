import { TRANSITIONS } from './fsm';
import type { Order, Role, TransitionKey } from './types';

export function canTransition(order: Order, key: TransitionKey, actorRole: Role, gates: Record<string, boolean> = {}) {
  const t = TRANSITIONS.find(t => t.key === key && t.from.includes(order.status));
  if (!t) return { ok: false, reason: 'INVALID_TRANSITION' };
  if (!t.allowedRoles.includes(actorRole)) return { ok: false, reason: 'FORBIDDEN' };
  if (t.requires?.length) {
    const missing = t.requires.filter(g => !gates[g]);
    if (missing.length) return { ok: false, reason: 'GATE_REQUIRED', missing };
  }
  return { ok: true, to: t.to };
}

