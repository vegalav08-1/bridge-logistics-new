export function auditInventory(e: { 
  type: 'move' | 'pack' | 'unpack' | 'restock' | 'adjust'; 
  id: string; 
  qty?: number; 
  ok: boolean 
}) {
  try { 
    navigator.sendBeacon?.('/api/audit/ui/inventory', JSON.stringify({ ...e, atISO: new Date().toISOString() })); 
  } catch {}
}


