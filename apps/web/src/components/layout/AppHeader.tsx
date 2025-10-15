'use client';
import React, { useState } from 'react';
import { cx } from '@/lib/cx';
import { INBOX_V2_ENABLED, SEARCH_V2_ENABLED, SCANNER_V2_ENABLED, NOTIFICATIONS_V2_ENABLED } from '@/lib/flags';
import InboxBadge from '@/components/inbox/InboxBadge';
import InboxDrawer from '@/components/inbox/InboxDrawer';
import GlobalSearchButton from '@/components/header/GlobalSearchButton';
import ScannerButton from '@/components/header/ScannerButton';

export interface AppHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function AppHeader({ title, left, right, className }: AppHeaderProps) {
  const [inboxOpen, setInboxOpen] = useState(false);

  return (
    <>
      <header
        className={cx(
          'flex h-14 items-center justify-between px-4 bg-surface border-b border-border safe-area-top',
          className
        )}
      >
        {/* Left section */}
        <div className="flex items-center space-x-2">
          {left}
        </div>
        
        {/* Center title */}
        {title && (
          <h1 className="flex-1 text-center text-lg font-semibold text-text truncate">
            {title}
          </h1>
        )}
        
        {/* Right section */}
        <div className="flex items-center space-x-2">
          {SEARCH_V2_ENABLED && <GlobalSearchButton />}
          {SCANNER_V2_ENABLED && <ScannerButton />}
          {(INBOX_V2_ENABLED || NOTIFICATIONS_V2_ENABLED) && (
            <InboxBadge onClick={() => setInboxOpen(true)} />
          )}
          {right}
        </div>
      </header>
      {(INBOX_V2_ENABLED || NOTIFICATIONS_V2_ENABLED) && (
        <InboxDrawer open={inboxOpen} onClose={() => setInboxOpen(false)} />
      )}
    </>
  );
}
