'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className={`h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors ${className}`}
      aria-label="Назад"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}


