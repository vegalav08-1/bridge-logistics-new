'use client';

import React from 'react';
import { cx } from '@/lib/cx';
import { Skeleton } from '@/components/ui/Skeleton';

export interface ChatHeaderSkeletonProps {
  className?: string;
}

export function ChatHeaderSkeleton({ className }: ChatHeaderSkeletonProps) {
  return (
    <div className={cx('sticky top-0 z-40 bg-surface border-b border-border', className)}>
      {/* Top row skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Title skeleton */}
      <div className="px-4 pb-2">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      {/* Progress skeleton */}
      <div className="px-4 pb-3">
        <div className="flex items-center space-x-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
              {i < 5 && <Skeleton className="w-4 h-0.5" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}


