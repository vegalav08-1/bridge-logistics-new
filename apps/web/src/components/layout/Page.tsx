import React from 'react';
import { cx } from '@/lib/cx';

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  withHeader?: boolean;
  withBottomNav?: boolean;
  className?: string;
}

export function Page({
  children,
  header,
  footer,
  withHeader = false,
  withBottomNav = false,
  className,
  ...props
}: PageProps) {
  const paddingClasses = cx(
    withHeader && 'pt-nav-header',
    withBottomNav && 'pb-nav-bottom'
  );
  
  return (
    <div
      className={cx(
        'min-h-screen bg-surface',
        paddingClasses,
        className
      )}
      {...props}
    >
      {header && (
        <header className="sticky top-0 z-50 bg-surface border-b border-border">
          {header}
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {footer && (
        <footer className="bg-surface border-t border-border">
          {footer}
        </footer>
      )}
    </div>
  );
}


