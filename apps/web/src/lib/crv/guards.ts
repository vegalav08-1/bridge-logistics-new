import type { Role } from '@/lib/order/types';
import type { ChangeRequest } from './types';
import { RACI_BY_STATUS } from '@/lib/order/raci';

export function canCreateCR(orderStatus: string, actorRole: Role) {
  // CR запрещён в ARCHIVED/CANCELLED
  if (['ARCHIVED', 'CANCELLED'].includes(orderStatus)) return { ok: false, reason: 'ORDER_READONLY' };
  // Создавать CR могут USER и ADMIN в большинстве статусов
  if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(actorRole)) return { ok: false, reason: 'FORBIDDEN' };
  return { ok: true };
}

export function canApproveCR(orderStatus: string, actorRole: Role) {
  const raci = RACI_BY_STATUS[orderStatus as keyof typeof RACI_BY_STATUS];
  const approvers = new Set([...(raci?.A ?? []), 'SUPER']);
  return approvers.has(actorRole) ? { ok: true } : { ok: false, reason: 'RACI_DENY' };
}

export function canRollback(actorRole: Role) {
  return (actorRole === 'ADMIN' || actorRole === 'SUPER') ? { ok: true } : { ok: false, reason: 'FORBIDDEN' };
}

