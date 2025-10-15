import React from 'react';
import { cx } from '@/lib/cx';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Container({
  children,
  maxWidth = '6xl',
  padding = 'md',
  className,
  ...props
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };
  
  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };
  
  return (
    <div
      className={cx(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


