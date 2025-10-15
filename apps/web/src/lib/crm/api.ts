import type { CRMProfile, KPI, TimelineEvent, Task, Tag, SegmentKey } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const PROFILES: Record<string, CRMProfile> = {};
const KPIS: Record<string, KPI> = {};
const TIMELINE: Record<string, TimelineEvent[]> = {};
const TASKS: Record<string, Task[]> = {};

function ensure(id: string, kind: 'USER' | 'PARTNER') {
  if (!PROFILES[id]) {
    PROFILES[id] = {
      id, kind, displayName: kind === 'USER' ? 'User Name' : 'Partner LLC',
      createdAtISO: new Date().toISOString(),
      referredBy: null, contacts: [], addresses: [], tags: []
    };
    KPIS[id] = { ltv: 0, arpu: 0, ordersCount: 0, openShipments: 0 };
    TIMELINE[id] = [];
    TASKS[id] = [];
  }
}

export async function fetchProfile(id: string, kind: 'USER' | 'PARTNER') { await wait(80); ensure(id, kind); return structuredClone(PROFILES[id]); }
export async function saveProfile(p: Partial<CRMProfile> & { id: string }) { await wait(60); PROFILES[p.id] = { ...PROFILES[p.id], ...p } as any; return structuredClone(PROFILES[p.id]); }

export async function addContact(id: string, c: any) { await wait(40); PROFILES[id].contacts.push(c); return c; }
export async function upsertAddress(id: string, a: any) { await wait(40); const arr = PROFILES[id].addresses; const i = arr.findIndex(x => x.id === a.id); if (i < 0) arr.push(a); else arr[i] = a; return a; }
export async function setTags(id: string, tags: Tag[]) { await wait(40); PROFILES[id].tags = tags; return tags; }

export async function fetchKPI(id: string) { await wait(70); return structuredClone(KPIS[id]); }
export async function setKPI(id: string, k: Partial<KPI>) { await wait(40); KPIS[id] = { ...KPIS[id], ...k } as any; return KPIS[id]; }

export async function fetchTimeline(id: string) { await wait(80); return structuredClone(TIMELINE[id]); }
export async function pushEvent(id: string, e: TimelineEvent) { await wait(30); TIMELINE[id] = [e, ...TIMELINE[id]]; return e; }

export async function listTasks(id: string) { await wait(60); return structuredClone(TASKS[id]); }
export async function upsertTask(id: string, t: Task) { await wait(40); const arr = TASKS[id]; const i = arr.findIndex(x => x.id === t.id); if (i < 0) arr.unshift(t); else arr[i] = t; return t; }
export async function toggleTask(id: string, taskId: string, done: boolean) { await wait(30); const arr = TASKS[id]; const i = arr.findIndex(x => x.id === taskId); if (i >= 0) arr[i].done = done; return arr[i]; }

export async function computeSegments(id: string): Promise<SegmentKey[]> {
  await wait(40);
  const kpi = KPIS[id];
  const res: SegmentKey[] = [];
  if (kpi.ordersCount >= 2) res.push('REPEATER');
  if (kpi.ltv > 1000) res.push('VIP');
  if ((kpi as any).debt?.amount > 0) res.push('DEBTOR');
  return res;
}

