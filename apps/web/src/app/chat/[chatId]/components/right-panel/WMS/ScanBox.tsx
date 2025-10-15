'use client';
import { useEffect } from 'react';
import { useScanner } from '@/lib/wms/scan/useScanner';

export default function ScanBox({ onValue }: { onValue: (v: string) => void }) {
  const s = useScanner();
  useEffect(() => { if (s.value) onValue(s.value); }, [s.value, onValue]);
  return (
    <div className="rounded-2xl border p-2 space-y-2">
      <div className="text-sm font-medium">Scanner</div>
      <div className="aspect-video bg-black/80 rounded-xl grid place-items-center text-white text-xs">Camera preview</div>
      <div className="flex justify-between">
        <button className="h-9 px-3 rounded-xl border" onClick={() => s.setActive(v => !v)}>{s.active ? 'Stop' : 'Start'}</button>
        <div className="text-xs text-gray-600 truncate max-w-[60%]">{s.value || '—'}</div>
      </div>
    </div>
  );
}

