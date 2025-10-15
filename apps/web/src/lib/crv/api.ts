import type { ChangeRequest, OrderVersion, CRVSummary } from './types';
import { nextVersion } from './version';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const MEM_CR: Record<string, ChangeRequest[]> = {};       // по orderId
const MEM_VER: Record<string, OrderVersion[]> = {};       // по orderId

function ensureBase(orderId: string) {
  if (!MEM_VER[orderId]) {
    MEM_VER[orderId] = [{
      orderId, version: 0, atISO: new Date().toISOString(), actorId: 'system',
      snapshot: { delivery: {}, pricing: {}, items: [], meta: {} },
      comment: 'init',
    }];
  }
}

export async function listCR(orderId: string): Promise<ChangeRequest[]> {
  await wait(60); return structuredClone(MEM_CR[orderId] ?? []);
}

export async function summary(orderId: string): Promise<CRVSummary> {
  ensureBase(orderId); await wait(40);
  const arr = MEM_CR[orderId] ?? [];
  return { currentVersion: MEM_VER[orderId].at(-1)!.version, hasPending: arr.some(x => x.status === 'PENDING'), lastChangeAt: arr.at(-1)?.createdAtISO };
}

export async function createCR(data: Omit<ChangeRequest, 'id' | 'status' | 'createdAtISO' | 'approvals' | 'appliedAtISO' | 'rejectedAtISO'>): Promise<ChangeRequest> {
  ensureBase(data.orderId);
  await wait(80);
  const cr: ChangeRequest = { ...data, id: 'cr_' + Math.random().toString(36).slice(2), status: 'PENDING', approvals: [], createdAtISO: new Date().toISOString() };
  MEM_CR[data.orderId] = [cr, ...(MEM_CR[data.orderId] ?? [])];
  return structuredClone(cr);
}

export async function decideCR(crId: string, orderId: string, decision: 'APPROVE' | 'REJECT', actor: { id: string; role: string }, comment?: string) {
  await wait(80);
  const list = MEM_CR[orderId] ?? [];
  const idx = list.findIndex(x => x.id === crId); if (idx < 0) throw new Error('CR_NOT_FOUND');
  const cr = list[idx];
  cr.approvals.push({ by: actor.id, role: actor.role as any, atISO: new Date().toISOString(), decision, comment });

  if (decision === 'REJECT') { cr.status = 'REJECTED'; cr.rejectedAtISO = new Date().toISOString(); return structuredClone(cr); }
  // APPROVE → APPLY
  const base = MEM_VER[orderId].find(v => v.version === cr.baseVersion) ?? MEM_VER[orderId][0];
  const nv = nextVersion(base, cr, actor.id);
  MEM_VER[orderId].push(nv);
  cr.status = 'APPLIED'; cr.appliedAtISO = nv.atISO;
  return structuredClone(cr);
}

export async function listVersions(orderId: string): Promise<OrderVersion[]> { ensureBase(orderId); await wait(60); return structuredClone(MEM_VER[orderId]); }

export async function rollback(orderId: string, targetVersion: number, reason: string, actorId: string) {
  ensureBase(orderId); await wait(120);
  const list = MEM_VER[orderId]; const target = list.find(v => v.version === targetVersion);
  if (!target) throw new Error('VERSION_NOT_FOUND');
  const tip = list.at(-1)!;
  const rb: OrderVersion = { orderId, version: tip.version + 1, atISO: new Date().toISOString(), actorId, snapshot: target.snapshot, comment: `rollback: ${reason}` };
  list.push(rb);
  return rb;
}

