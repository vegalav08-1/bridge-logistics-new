import React from 'react';
import { cx } from '@/lib/cx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const errorClasses = error ? 'border-danger focus-visible:ring-danger' : '';
  const iconClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <div className={cx('space-y-2', widthClasses)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={cx(
            baseClasses,
            errorClasses,
            iconClasses,
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}


