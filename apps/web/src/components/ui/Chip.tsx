import React from 'react';
import { cx } from '@/lib/cx';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Chip({
  variant = 'default',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ChipProps) {
  const baseClasses = 'inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-muted text-muted-foreground hover:bg-muted/80',
    success: 'bg-success/10 text-success hover:bg-success/20',
    warning: 'bg-warning/10 text-warning hover:bg-warning/20',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    outline: 'border border-border text-text hover:bg-muted',
  };
  
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs rounded-full',
    md: 'h-8 px-3 text-sm rounded-full',
  };
  
  return (
    <div
      className={cx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}


