'use client';
export default function DeadlineBadge({ sla, startedAtISO }: { sla: any; startedAtISO: string }) {
  if (!sla) return null;
  const started = new Date(startedAtISO).getTime();
  const target = started + sla.targetHours * 3600 * 1000;
  const leftMs = target - Date.now();
  const hours = Math.ceil(leftMs / 3600_000);
  const danger = leftMs < 0;
  return (
    <div className={`h-7 rounded-full px-2 text-xs grid place-items-center border ${danger ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'}`}>
      {danger ? `SLA -${Math.abs(hours)}h` : `SLA ${hours}h`}
    </div>
  );
}

