'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';
import { useAbility } from '@/lib/acl/useAbility';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ability } = useAbility();
  
  const handleItemClick = (item: BottomNavItem) => {
    if (!item.disabled) {
      router.push(item.href);
    }
  };
  
  return (
    <nav
      className={cx(
        'fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom',
        'hidden md:hidden', // Hidden on desktop
        className
      )}
    >
      <div className="flex h-18 items-center justify-around">
        {items.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          // ACL проверки для навигации
          const canAccess = (() => {
            if (item.href.includes('/admin')) {
              return ability.can('admin_area', 'manage');
            }
            if (item.href.includes('/finance')) {
              return ability.can('finance', 'view');
            }
            if (item.href.includes('/partners')) {
              return ability.can('partner', 'manage');
            }
            return true; // по умолчанию разрешено
          })();
          
          if (!canAccess) return null;
          
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cx(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 min-h-[44px] min-w-[44px]',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'text-brand'
                  : 'text-muted-foreground hover:text-text'
              )}
              aria-label={item.label}
            >
              <div className={cx(
                'transition-colors',
                isActive ? 'text-brand' : 'text-muted-foreground'
              )}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
