import React from 'react';
import { cx } from '@/lib/cx';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Что-то пошло не так',
  message,
  onRetry,
  retryLabel = 'Повторить',
  className,
}: ErrorStateProps) {
  return (
    <div className={cx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 text-danger">
        <AlertCircle className="h-12 w-12" />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-text">
        {title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message}
      </p>
      
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}


