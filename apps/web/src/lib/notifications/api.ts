import type { Notif } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
let MEMORY: Notif[] = [];

export async function fetchNotifs(): Promise<Notif[]> { 
  await wait(120); 
  return structuredClone(MEMORY); 
}

export async function markRead(ids: string[]): Promise<void> { 
  await wait(80); 
  MEMORY = MEMORY.map(n => ids.includes(n.id) ? { ...n, read: true } : n); 
}

export async function markAll(): Promise<void> { 
  await wait(80); 
  MEMORY = MEMORY.map(n => ({ ...n, read: true })); 
}

export async function seedNotifs(list: Notif[]) { 
  MEMORY = list; 
} // dev helper

