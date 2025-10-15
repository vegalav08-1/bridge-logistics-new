'use client';
import { usePacking } from '@/lib/inventory/usePacking';
import IfCan from '@/lib/acl/IfCan';
import PackageCard from './PackageCard';

export default function PackingPanel({ shipmentId }: { shipmentId: string }) {
  const p = usePacking(shipmentId);

  return (
    <div className="rounded-2xl border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Упаковка</div>
        <IfCan resource="packing" action="create">
          <button 
            className="h-10 px-3 rounded-xl border" 
            onClick={() => p.pack([{ itemId: 'i1', qty: 1 }])}
          >
            Создать упаковку
          </button>
        </IfCan>
      </div>
      {p.packages.map(x => (
        <PackageCard key={x.id} pkg={x} onLabel={p.label} />
      ))}
    </div>
  );
}


