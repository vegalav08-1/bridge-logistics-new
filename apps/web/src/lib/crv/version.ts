import type { OrderVersion, ChangeRequest } from './types';
import { applyFields } from './diff';

export function nextVersion(prev: OrderVersion, cr: ChangeRequest, actorId: string): OrderVersion {
  return {
    orderId: prev.orderId,
    version: prev.version + 1,
    atISO: new Date().toISOString(),
    actorId,
    snapshot: applyFields(prev.snapshot, cr.fields),
    crId: cr.id,
    comment: 'CR applied',
  };
}

