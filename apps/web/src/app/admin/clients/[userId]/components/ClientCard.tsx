'use client';
import type { Client, ClientSummary } from '@/lib/partners/types';

export default function ClientCard({ 
  client, 
  summary 
}: { 
  client: Client; 
  summary: ClientSummary; 
}) {
  return (
    <div className="rounded-2xl border p-3 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{client.name}</div>
        <div className="text-xs text-gray-500">
          {client.email || '—'} · joined {new Date(client.joinedAtISO).toLocaleDateString()}
        </div>
      </div>
      <div className="text-xs text-right">
        <div>Shipments: {summary.shipments}</div>
        <div>Unread: {summary.unread}</div>
        <div className={`${summary.debt > 0 ? 'text-red-600' : 'text-gray-600'}`}>
          Debt: {summary.debt}
        </div>
      </div>
    </div>
  );
}

