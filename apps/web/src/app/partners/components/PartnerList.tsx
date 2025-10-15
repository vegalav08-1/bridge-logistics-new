'use client';
import PartnerRow from './PartnerRow';
import type { Partner } from '@/lib/partners/types';

export default function PartnerList({ items }: { items: Partner[] }) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-500 px-1">No partners yet</div>
    );
  }
  
  return (
    <div className="space-y-2">
      {items.map(p => (
        <PartnerRow key={p.id} p={p} />
      ))}
    </div>
  );
}

