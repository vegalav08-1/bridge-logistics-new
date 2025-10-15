'use client';
import Link from 'next/link';

export default function Tile({ href, icon, label, onClick }: {
  href?: string; 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
}) {
  const body = (
    <div className="rounded-2xl border shadow-sm hover:shadow-md active:scale-[0.98] transition p-4 md:p-5 flex flex-col items-center gap-2 min-h-[100px] md:min-h-[120px]">
      <div className="text-2xl md:text-3xl">{icon}</div>
      <div className="text-sm md:text-[17px] font-semibold text-[var(--brand)] text-center">{label}</div>
    </div>
  );
  
  return href
    ? <Link href={href} aria-label={label} className="block">{body}</Link>
    : <button aria-label={label} className="w-full" onClick={onClick}>{body}</button>;
}


