'use client';
import AvatarBadge from '@/components/crm/AvatarBadge';

export default function HeaderCard({ name, id, kind, segments }: {
  name: string; id: string; kind: 'USER' | 'PARTNER'; segments: string[];
}) {
  return (
    <div className="rounded-2xl border p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AvatarBadge name={name} />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-gray-600">{kind} · ID {id}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {segments.map(s => <span key={s} className="h-7 px-2 rounded-full border text-xs">{s}</span>)}
      </div>
    </div>
  );
}

