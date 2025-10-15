import React from 'react';
import { cx } from '@/lib/cx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'elevated' | 'outline';
  children?: React.ReactNode;
}

export function Card({ variant = 'elevated', className, children, ...props }: CardProps) {
  const baseClasses = 'rounded-lg bg-surface';
  
  const variantClasses = {
    flat: 'border-0 shadow-none',
    elevated: 'shadow-sm border border-border',
    outline: 'border border-border shadow-none',
  };
  
  return (
    <div
      className={cx(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cx('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cx('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div
      className={cx('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cx('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

