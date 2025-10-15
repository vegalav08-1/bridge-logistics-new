export function auditSearch(e:{ q:string; markers?:string[]; count:number }) {
  try {
    navigator.sendBeacon?.('/api/audit/ui/search', JSON.stringify({ ...e, atISO: new Date().toISOString() }));
  } catch {}
}

export function auditScan(e:{ raw:string; kind:string }) {
  try { 
    navigator.sendBeacon?.('/api/audit/ui/scan', JSON.stringify({ ...e, atISO: new Date().toISOString() })); 
  } catch {}
}

export function auditOCR(e:{ ok:boolean; ms:number; fields?:any }) {
  try { 
    navigator.sendBeacon?.('/api/audit/ui/ocr', JSON.stringify({ ...e, atISO: new Date().toISOString() })); 
  } catch {}
}


