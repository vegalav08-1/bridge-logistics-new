'use client';
export default function LineageBadge({ count, onClick }:{ count:number; onClick:()=>void }) {
  return (
    <button className="h-9 px-3 rounded-xl border inline-flex items-center gap-2" onClick={onClick} title="История происхождения">
      <span>Lineage</span>
      {count>0 && <span className="text-xs bg-gray-800 text-white rounded-full px-2 py-0.5">{count}</span>}
    </button>
  );
}


