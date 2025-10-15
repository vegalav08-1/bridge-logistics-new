'use client';
const STATUS = ['REQUEST', 'NEW', 'RECEIVE', 'RECONCILE', 'PACK', 'MERGE', 'IN_TRANSIT', 'ON_DELIVERY', 'DELIVERED', 'ARCHIVED'] as const;

export default function FilterBar({ q, onQ, status, onStatus, onCreateShipment, onCreateRequest, can }: {
  q: string; onQ: (v: string) => void;
  status: string[]; onStatus: (s: string[]) => void;
  onCreateShipment: () => void; onCreateRequest: () => void;
  can: { createShipment: boolean; createRequest: boolean };
}) {
  const toggle = (s: string) => onStatus(status.includes(s) ? status.filter(x => x !== s) : [...status, s]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 h-11 rounded-xl border px-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" /></svg>
          <input className="flex-1 outline-none" value={q} onChange={e => onQ(e.target.value)} placeholder="Search by number or title" />
        </div>
        {can.createShipment && <button className="h-11 px-3 rounded-xl border" onClick={onCreateShipment}>Create shipment</button>}
        {can.createRequest && <button className="h-11 px-3 rounded-xl border" onClick={onCreateRequest}>Create request</button>}
      </div>
      <div className="flex flex-wrap gap-1">
        {STATUS.map(s => (
          <button key={s}
            className={`h-8 px-2 rounded-full border text-xs ${status.includes(s) ? 'bg-[var(--brand)] text-white' : 'bg-white'}`}
            onClick={() => toggle(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

