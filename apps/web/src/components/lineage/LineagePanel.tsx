'use client';
import { useEffect, useState } from 'react';

type Node = { id:string; label:string; kind:'chat'|'line'; parentIds:string[]; qty?:number };
export default function LineagePanel({ chatId, open, onClose }:{ chatId:string; open:boolean; onClose:()=>void }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  useEffect(()=>{ if(open){ /* fetch lineage graph by chatId */ setNodes([]); } },[open, chatId]);
  if (!open) return null;
  return (
    <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] bg-white border-l z-50">
      <div className="h-12 flex items-center justify-between px-3 border-b">
        <div className="font-medium">История происхождения</div>
        <button className="h-9 px-3 rounded-lg border" onClick={onClose}>Закрыть</button>
      </div>
      <div className="p-3 space-y-2 overflow-auto">
        {nodes.map(n=>(
        <div key={n.id} className="rounded-xl border p-2">
          <div className="text-sm font-medium">{n.label}</div>
          {n.qty!=null && <div className="text-xs text-gray-500">qty: {n.qty}</div>}
          {n.parentIds.length>0 && <div className="text-xs text-gray-500">from: {n.parentIds.join(', ')}</div>}
        </div>
      ))}
      </div>
    </div>
  );
}


