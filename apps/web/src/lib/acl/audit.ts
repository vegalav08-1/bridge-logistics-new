type AccessDeniedEvent = {
  resource: string;
  action: string;
  ctx: any;
  reason: string;
  whenISO?: string;
};

export function sendAccessDenied(e: AccessDeniedEvent) {
  const payload = JSON.stringify({ ...e, whenISO: new Date().toISOString() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/audit/ui/access-denied', payload);
    } else {
      fetch('/api/audit/ui/access-denied', { method: 'POST', body: payload, keepalive: true, headers: {'Content-Type':'application/json'} });
    }
  } catch {}
  if (process.env.NODE_ENV !== 'production') console.warn('[ACL] access_denied', e);
}


