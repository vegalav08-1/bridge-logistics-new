import React from 'react';
import { cx } from '@/lib/cx';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-semibold text-text">
        {title}
      </h3>
      
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {cta && (
        <div className="flex flex-col items-center space-y-2">
          {cta}
        </div>
      )}
    </div>
  );
}


