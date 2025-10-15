'use client';

export default function PriceInput({ 
  value, 
  onChange, 
  suffix 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  suffix?: string 
}) {
  return (
    <div className="h-10 rounded-xl border px-3 flex items-center gap-2">
      <input 
        className="flex-1 outline-none" 
        inputMode="decimal" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
      {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
    </div>
  );
}


