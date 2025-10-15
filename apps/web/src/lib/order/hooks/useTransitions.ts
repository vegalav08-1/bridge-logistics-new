'use client';
import { canTransition } from '../guard';
import * as api from '../api';
import type { Order, Role, TransitionKey } from '../types';

export function useTransitions(order: Order | null, actorRole: Role) {
  async function transition(key: TransitionKey, payload?: any) {
    if (!order) throw new Error('ORDER_NOT_LOADED');
    const gates = await api.fetchGates(order.id);
    const guard = canTransition(order, key, actorRole, gates);
    if (!guard.ok) throw Object.assign(new Error(guard.reason), guard);
    const next = await api.postTransition(order.id, key, { ...payload, to: guard.to });
    await api.appendJournal({ id: crypto.randomUUID(), atISO: new Date().toISOString(), type: 'transition', payload: { key, from: order.status, to: next.status } });
    return next;
  }
  return { transition };
}

