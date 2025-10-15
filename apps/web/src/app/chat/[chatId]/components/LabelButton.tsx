'use client';
import { useState } from 'react';

export default function LabelButton({ 
  id, 
  onLabel 
}: { 
  id: string; 
  onLabel: (id: string, fmt: 'QR' | 'BARCODE') => Promise<any> 
}) {
  const [fmt, setFmt] = useState<'QR' | 'BARCODE'>('QR');
  
  const click = async () => { 
    const res = await onLabel(id, fmt); 
    window.open(res.url, '_blank'); 
  };
  
  return (
    <div className="flex gap-2">
      <select 
        className="h-8 rounded-lg border text-xs" 
        value={fmt} 
        onChange={e => setFmt(e.target.value as any)}
      >
        <option>QR</option>
        <option>BARCODE</option>
      </select>
      <button 
        className="h-8 px-3 rounded-lg border text-xs" 
        onClick={click}
      >
        Печать
      </button>
    </div>
  );
}


