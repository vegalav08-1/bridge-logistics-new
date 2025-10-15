'use client';
import { PACK_TYPES, PackType } from '@/lib/forms/types';

type Props = {
  value?: PackType;
  onChange?: (v: PackType) => void;
  error?: string;
};

export default function PackTypeSelect({ value, onChange, error }: Props) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PACK_TYPES.map(p => {
          const active = p.value === value;
          return (
            <button
              type="button"
              key={p.value}
              onClick={() => onChange?.(p.value)}
              className={`text-left rounded-xl border px-3 py-2 ${active ? 'border-[var(--brand)] bg-[var(--muted)]' : ''}`}
            >
              <div className="text-sm font-medium">{p.label}</div>
              {p.hint && <div className="text-[11px] text-[var(--text-secondary)]">{p.hint}</div>}
            </button>
          );
        })}
      </div>
      {error && <div className="text-[12px] text-red-600 mt-1">{error}</div>}
    </div>
  );
}


