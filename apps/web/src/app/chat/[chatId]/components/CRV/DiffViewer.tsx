'use client';
export default function DiffViewer({ fields }: { fields: any[] }) {
  return (
    <div className="rounded-xl border p-2 text-sm space-y-1">
      {fields.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-gray-500 w-44">{f.key}</span>
          {'old' in f && f.old !== undefined && <span className="line-through opacity-60">{String(f.old)}</span>}
          <span className="font-medium">→ {String(f.next)}</span>
        </div>
      ))}
    </div>
  );
}

