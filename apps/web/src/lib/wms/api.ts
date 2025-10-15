import type {
  ReceivingSession, ReceivingItem, ReconcileDiff, QAIssue, PutawayMove,
  Bin, ReturnCase, PhotoMeta
} from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

let REC: Record<string, ReceivingSession> = {};
let DIFFS: Record<string, ReconcileDiff[]> = {};
let QAS: Record<string, QAIssue[]> = {};
let MOVES: Record<string, PutawayMove[]> = {};
let BINS: Bin[] = [
  { code: 'A-01-01-01', area: 'A', rack: '01', shelf: '01', cell: '01' },
  { code: 'A-01-01-02', area: 'A', rack: '01', shelf: '01', cell: '02' },
];
let RETS: Record<string, ReturnCase[]> = {};
let PHOTOS: Record<string, PhotoMeta[]> = {};

export async function startReceiving(orderId: string, actorId: string): Promise<ReceivingSession> {
  await wait(80);
  const id = `rec_${orderId}`;
  if (!REC[id]) REC[id] = { id, orderId, startedAtISO: new Date().toISOString(), actorId, items: [] };
  return structuredClone(REC[id]);
}
export async function addReceivingItem(recId: string, item: Partial<ReceivingItem>): Promise<ReceivingItem> {
  await wait(60);
  const sess = REC[recId]; if (!sess) throw new Error('REC_NOT_FOUND');
  const it: ReceivingItem = {
    id: `ri_${Math.random().toString(36).slice(2)}`,
    expected: { units: 0 }, received: { units: 0 }, damage: 'NONE', photos: [], ...item
  };
  sess.items.push(it);
  return structuredClone(it);
}
export async function patchReceivingItem(recId: string, itemId: string, patch: Partial<ReceivingItem>): Promise<ReceivingItem> {
  await wait(60);
  const sess = REC[recId]; if (!sess) throw new Error('REC_NOT_FOUND');
  const idx = sess.items.findIndex(x => x.id === itemId); if (idx < 0) throw new Error('ITEM_NOT_FOUND');
  const merged = { ...sess.items[idx], ...patch };
  sess.items[idx] = merged;
  return structuredClone(merged);
}
export async function closeReceiving(recId: string) { await wait(60); const s = REC[recId]; if (s) s.closedAtISO = new Date().toISOString(); return { ok: true }; }

export async function listDiffs(orderId: string) { await wait(40); return structuredClone(DIFFS[orderId] ?? []); }
export async function upsertDiff(orderId: string, diff: ReconcileDiff) { await wait(40); DIFFS[orderId] = [diff, ...(DIFFS[orderId] ?? [])]; return diff; }

export async function listQA(orderId: string) { await wait(40); return structuredClone(QAS[orderId] ?? []); }
export async function upsertQA(orderId: string, issue: QAIssue) { await wait(40); QAS[orderId] = [issue, ...(QAS[orderId] ?? [])]; return issue; }

export async function listBins() { await wait(40); return structuredClone(BINS); }
export async function putaway(orderId: string, move: PutawayMove) { await wait(60); MOVES[orderId] = [move, ...(MOVES[orderId] ?? [])]; return move; }
export async function listMoves(orderId: string) { await wait(40); return structuredClone(MOVES[orderId] ?? []); }

export async function uploadPhoto(entityKey: string, file: File): Promise<PhotoMeta> {
  await wait(120);
  const meta: PhotoMeta = { id: `ph_${Math.random().toString(36).slice(2)}`, createdAtISO: new Date().toISOString(), url: URL.createObjectURL(file) };
  PHOTOS[entityKey] = [meta, ...(PHOTOS[entityKey] ?? [])];
  return meta;
}
export async function listPhotos(entityKey: string): Promise<PhotoMeta[]> { await wait(40); return structuredClone(PHOTOS[entityKey] ?? []); }

export async function listReturns(orderId: string) { await wait(40); return structuredClone(RETS[orderId] ?? []); }
export async function createReturn(orderId: string, data: Omit<ReturnCase, 'id' | 'createdAtISO' | 'status'>) {
  await wait(80);
  const rc: ReturnCase = { ...data, id: `ret_${Math.random().toString(36).slice(2)}`, orderId, createdAtISO: new Date().toISOString(), status: 'OPEN' };
  RETS[orderId] = [rc, ...(RETS[orderId] ?? [])];
  return rc;
}
export async function patchReturn(orderId: string, returnId: string, patch: Partial<ReturnCase>) {
  await wait(60);
  const list = RETS[orderId] ?? []; const idx = list.findIndex(x => x.id === returnId); if (idx < 0) throw new Error('RET_NOT_FOUND');
  list[idx] = { ...list[idx], ...patch }; return list[idx];
}

