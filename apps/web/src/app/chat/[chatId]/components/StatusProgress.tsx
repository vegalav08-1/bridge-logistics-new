'use client';

import React, { useRef, useEffect } from 'react';
import { cx } from '@/lib/cx';
import { ShipmentStatus, STATUS_FLOW, STATUS_LABEL, STATUS_COLOR, getStatusStepIndex, isStatusCompleted, isStatusCurrent, isStatusFuture } from '@/lib/chat/status-map';

export interface StatusProgressProps {
  status: ShipmentStatus;
  className?: string;
}

export function StatusProgress({ status, className }: StatusProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndex = getStatusStepIndex(status);

  // Auto-scroll to current step on mobile (disabled to prevent mini-scroll)
  // useEffect(() => {
  //   if (containerRef.current) {
  //     const currentStep = containerRef.current.querySelector(`[data-step="${currentIndex}"]`);
  //     if (currentStep) {
  //       currentStep.scrollIntoView({ 
  //         behavior: 'smooth', 
  //         block: 'nearest',
  //         inline: 'center'
  //       });
  //     }
  //   }
  // }, [currentIndex]);

  return (
    <div 
      ref={containerRef}
      className={cx(
        'flex items-center justify-between w-full overflow-x-auto scrollbar-hide status-progress pb-1',
        className
      )}
      role="list"
      aria-label="Прогресс статуса"
    >
      {STATUS_FLOW.map((stepStatus, index) => {
        const isCompleted = isStatusCompleted(status, stepStatus);
        const isCurrent = isStatusCurrent(status, stepStatus);
        const isFuture = isStatusFuture(status, stepStatus);
        
        return (
          <React.Fragment key={stepStatus}>
            {/* Step circle */}
            <div
              data-step={index}
              className={cx(
                'flex flex-col items-center min-w-0 flex-shrink-0 flex-1',
                'transition-all duration-200 px-1'
              )}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={cx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  'border-2 transition-all duration-200',
                  isCurrent && STATUS_COLOR[stepStatus],
                  isCompleted && 'bg-brand text-white border-brand',
                  isFuture && 'bg-muted text-muted-foreground border-muted',
                  !isCurrent && !isCompleted && !isFuture && 'bg-surface text-muted-foreground border-border'
                )}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step label */}
              <span
                className={cx(
                  'text-xs font-medium mt-1 text-center max-w-16',
                  'transition-colors duration-200',
                  isCurrent && 'text-brand',
                  isCompleted && 'text-text',
                  isFuture && 'text-muted-foreground'
                )}
              >
                {STATUS_LABEL[stepStatus]}
              </span>
            </div>

            {/* Connector line */}
            {index < STATUS_FLOW.length - 1 && (
              <div
                className={cx(
                  'w-3 h-0.5 transition-colors duration-200 flex-shrink-0',
                  isCompleted ? 'bg-brand' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

