'use client';
import Money from '@/components/finance/Money';

export default function ItemCard({ i }: { i: any }) {
  return (
    <div className="rounded-xl border p-2 flex justify-between items-center">
      <div>
        <div className="font-medium text-sm">{i.name}</div>
        <div className="text-xs text-gray-500">SKU {i.sku}</div>
      </div>
      <div className="text-xs">На складе: {i.stock} {i.unit}</div>
    </div>
  );
}


