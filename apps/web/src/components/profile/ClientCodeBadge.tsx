'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

interface ClientCodeBadgeProps {
  code: string;
  className?: string;
}

export function ClientCodeBadge({ code, className = '' }: ClientCodeBadgeProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!code) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground">Код клиента:</span>
      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
        <code className="text-sm font-mono font-medium">{code}</code>
        <button
          onClick={handleCopy}
          className="h-4 w-4 p-0.5 hover:bg-background rounded transition-colors"
          title="Скопировать код"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
