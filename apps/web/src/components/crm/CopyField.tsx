'use client';
import { useState } from 'react';

export default function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-mono">{value}</span>
      <button
        className="h-6 w-6 rounded border grid place-items-center text-xs"
        onClick={copy}
      >
        {copied ? '✓' : '📋'}
      </button>
    </div>
  );
}

