export function auditFinance(e: { 
  type: 'offer' | 'invoice' | 'payment' | 'refund', 
  chatId: string; 
  id?: string; 
  amount?: number; 
  currency?: string; 
  ok: boolean 
}) {
  try { 
    navigator.sendBeacon?.('/api/audit/ui/finance', JSON.stringify({ ...e, atISO: new Date().toISOString() })); 
  } catch {}
}


