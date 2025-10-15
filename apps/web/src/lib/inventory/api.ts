import type { Item, Package, Location } from './types';
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function listItems(): Promise<Item[]> {
  await wait(200);
  return [];
}

export async function listLocations(): Promise<Location[]> {
  await wait(150);
  return [];
}

export async function createPackage(payload: any): Promise<Package> {
  await wait(200);
  return { 
    id: 'pkg_' + Math.random().toString(36).slice(2),
    createdAtISO: new Date().toISOString(), 
    status: 'DRAFT', 
    ...payload 
  };
}

export async function updateStock(itemId: string, delta: number): Promise<Item> {
  await wait(120);
  return { 
    id: itemId, 
    sku: 'SKU', 
    name: 'Updated', 
    unit: 'pcs', 
    stock: 100 + delta, 
    reserved: 0 
  };
}

export async function generateLabel(payload: { id: string; format: 'QR' | 'BARCODE' }): Promise<{ url: string }> {
  await wait(100);
  return { url: `/api/mock/label/${payload.id}?fmt=${payload.format}` };
}


