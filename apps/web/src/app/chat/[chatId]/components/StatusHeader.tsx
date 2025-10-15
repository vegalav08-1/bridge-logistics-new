'use client';

import { StatusProgress } from './StatusProgress';
import { ShipmentStatus } from '@/lib/chat/status-map';

interface StatusHeaderProps {
  status: ShipmentStatus;
  orderId: string;
}

export default function StatusHeader({ status, orderId }: StatusHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <StatusProgress status={status} />
    </div>
  );
}