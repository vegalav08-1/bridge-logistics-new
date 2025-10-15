'use client';
import { useEffect, useState } from 'react';
import { getClient, listClientShipments } from '@/lib/partners/api';
import ClientCard from './components/ClientCard';
import ClientShipments from './components/ClientShipments';
import { ADMIN_CLIENTS_V2_ENABLED } from '@/lib/flags';

export default function AdminClientPage({ 
  params: { userId } 
}: { 
  params: { userId: string } 
}) {
  const [client, setClient] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { client, summary } = await getClient(userId);
      setClient(client); 
      setSummary(summary);
      setShipments(await listClientShipments(userId));
      setLoading(false);
    })();
  }, [userId]);

  if (!ADMIN_CLIENTS_V2_ENABLED) {
    return (
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">Admin clients feature is disabled</div>
      </div>
    );
  }

  if (loading) return <div className="p-4">Loading…</div>;
  
  return (
    <div className="px-4 py-3 space-y-3">
      <h1 className="text-lg font-semibold">Client</h1>
      <ClientCard client={client} summary={summary} />
      <div className="rounded-2xl border p-3">
        <div className="font-medium mb-2">Shipments</div>
        <ClientShipments items={shipments} />
      </div>
    </div>
  );
}