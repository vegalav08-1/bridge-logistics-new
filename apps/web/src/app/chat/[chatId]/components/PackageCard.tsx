'use client';
import LabelButton from './LabelButton';

export default function PackageCard({ 
  pkg, 
  onLabel 
}: { 
  pkg: any; 
  onLabel: (id: string, f: 'QR' | 'BARCODE') => Promise<any> 
}) {
  return (
    <div className="rounded-xl border p-2 flex justify-between items-center">
      <div>
        <div className="text-sm">Упаковка {pkg.id.slice(-6)} · {pkg.status}</div>
        <div className="text-xs text-gray-500">{pkg.items.length} позиций</div>
      </div>
      <LabelButton id={pkg.id} onLabel={onLabel} />
    </div>
  );
}


