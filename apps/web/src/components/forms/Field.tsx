'use client';
import { ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
};

export default function Field({ label, children, hint, error, required }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && !error && <div className="text-[11px] text-[var(--text-secondary)]">{hint}</div>}
      {error && <div className="text-[12px] text-red-600">{error}</div>}
    </div>
  );
}


