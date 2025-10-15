import type { OrderStatus, RACI } from './types';

export const RACI_BY_STATUS: Record<OrderStatus, RACI> = {
  REQUEST: { R: ['USER'], A: ['ADMIN'], C: ['ADMIN'], I: ['USER'] },
  NEW: { R: ['ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  RECEIVE: { R: ['SUPER_ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  RECONCILE: { R: ['SUPER_ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  PACK: { R: ['SUPER_ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  MERGE: { R: ['ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  IN_TRANSIT: { R: ['ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  ON_DELIVERY: { R: ['ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
  DELIVERED: { R: ['ADMIN', 'USER'], A: ['ADMIN'], C: [], I: ['USER'] },
  ARCHIVED: { R: ['ADMIN'], A: ['ADMIN'], C: [], I: ['USER'] },
  CANCELLED: { R: ['ADMIN'], A: ['ADMIN'], C: ['USER'], I: ['USER'] },
};

