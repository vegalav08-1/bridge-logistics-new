'use client';
import { RACI_BY_STATUS } from '@/lib/order/raci';
export default function ResponsibleBadge({ status, assignedTo }: { status: any; assignedTo?: string }) {
  const raci = RACI_BY_STATUS[status];
  return (
    <div className="h-7 rounded-full border px-2 text-xs grid place-items-center">
      R: {assignedTo ? `@${assignedTo}` : raci?.R?.join(',') || '—'}
    </div>
  );
}

