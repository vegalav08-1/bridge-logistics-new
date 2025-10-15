import type { Settings, WarehouseAddress } from './types';
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

let MEMORY: Settings = {
  profile: {}, 
  warehouses: [],
  defaultCity: undefined, 
  shippingType: undefined, 
  receiptAddress: undefined
};

export async function fetchSettings(): Promise<Settings> {
  await wait(150);
  return structuredClone(MEMORY);
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  await wait(150);
  MEMORY = { ...MEMORY, ...patch, warehouses: patch.warehouses ?? MEMORY.warehouses };
  return structuredClone(MEMORY);
}

// Warehouses CRUD
export async function addWarehouse(w: Omit<WarehouseAddress, 'id'>): Promise<WarehouseAddress> {
  await wait(120);
  const nw = { ...w, id: 'wh_' + Math.random().toString(36).slice(2) };
  MEMORY.warehouses = [nw, ...MEMORY.warehouses];
  return nw;
}

export async function updateWarehouse(w: WarehouseAddress): Promise<WarehouseAddress> {
  await wait(120);
  MEMORY.warehouses = MEMORY.warehouses.map(x => x.id === w.id ? w : x);
  return w;
}

export async function removeWarehouse(id: string): Promise<void> {
  await wait(100);
  MEMORY.warehouses = MEMORY.warehouses.filter(x => x.id !== id);
}


