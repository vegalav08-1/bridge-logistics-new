'use client';
import * as api from './api';
import { crCreateSchema, crDecisionSchema, rollbackSchema } from './schema';
import type { ChangeRequest } from './types';

export function useCRV(orderId: string) {
  async function list() { return api.listCR(orderId); }
  async function info() { return api.summary(orderId); }
  async function create(input: any) {
    const z = crCreateSchema.safeParse(input); if (!z.success) throw new Error('INVALID_CR');
    return api.createCR({ ...z.data, createdBy: 'user-123' });
  }
  async function decide(input: any, actor: { id: string; role: any }) {
    const z = crDecisionSchema.safeParse(input); if (!z.success) throw new Error('INVALID_DECISION');
    return api.decideCR(z.data.crId, orderId, z.data.decision, actor, z.data.comment);
  }
  async function versions() { return api.listVersions(orderId); }
  async function doRollback(input: any, actorId: string) {
    const z = rollbackSchema.safeParse(input); if (!z.success) throw new Error('INVALID_ROLLBACK');
    return api.rollback(z.data.orderId, z.data.targetVersion, z.data.reason, actorId);
  }
  return { list, info, create, decide, versions, doRollback };
}
