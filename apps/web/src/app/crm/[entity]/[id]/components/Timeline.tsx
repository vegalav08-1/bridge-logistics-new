'use client';
export default function Timeline({ items }: { items: any[] }) {
  return (
    <div className="rounded-2xl border p-3 space-y-2 max-h-[60vh] overflow-auto">
      {items.map((r, i) => (
        <div key={i} className="flex justify-between text-sm">
          <div>{r.title}<div className="text-xs text-gray-600">{r.sub}</div></div>
          <div className="text-xs text-gray-500">{r.at}</div>
        </div>
      ))}
    </div>
  );
}

