'use client';

export default function SearchBar({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void; 
}) {
  return (
    <div className="h-11 rounded-xl border flex items-center gap-2 px-3">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/>
      </svg>
      <input 
        className="flex-1 outline-none" 
        placeholder="Search" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}

