'use client';
import { useOrder } from '@/lib/order/hooks/useOrder';
import { useSLA } from '@/lib/order/hooks/useSLA';
import ResponsibleBadge from '@/components/system/ResponsibleBadge';
import DeadlineBadge from '@/components/system/DeadlineBadge';
import { ORDER_FSM_V1_ENABLED } from '@/lib/flags';

export default function StatusHeader({ orderId, actorRole }: { orderId: string; actorRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN' }) {
  const { order, loading } = useOrder(orderId);
  const sla = useSLA(order);

  if (!ORDER_FSM_V1_ENABLED) return null;

  if (loading || !order) return <div className="p-2">Loading…</div>;

  return (
    <div className="rounded-2xl border p-3 flex flex-wrap gap-2 items-center justify-between">
      <div className="text-sm font-medium">Status: {order.status}</div>
      <div className="flex items-center gap-2">
        <ResponsibleBadge status={order.status} assignedTo={order.assignedTo} />
        <DeadlineBadge sla={sla.active} startedAtISO={order.updatedAtISO} />
      </div>
    </div>
  );
}

