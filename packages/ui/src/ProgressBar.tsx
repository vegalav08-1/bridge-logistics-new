import React from 'react';
import { cn } from './utils/cn';

export interface ProgressBarProps {
  progress: number;
  steps?: Array<{
    label: string;
    status: 'completed' | 'current' | 'pending';
    value: number;
  }>;
  showLabels?: boolean;
  className?: string;
}

const defaultSteps = [
  { label: 'Запрос', status: 'completed' as const, value: 0 },
  { label: 'Приёмка', status: 'pending' as const, value: 20 },
  { label: 'Сверка', status: 'pending' as const, value: 30 },
  { label: 'Упаковка', status: 'pending' as const, value: 40 },
  { label: 'Совмещение', status: 'pending' as const, value: 50 },
  { label: 'В пути', status: 'pending' as const, value: 70 },
  { label: 'К выдаче', status: 'pending' as const, value: 90 },
  { label: 'Выдано', status: 'pending' as const, value: 100 },
];

export function ProgressBar({ 
  progress, 
  steps = defaultSteps, 
  showLabels = true,
  className 
}: ProgressBarProps) {
  // Определяем статус каждого шага на основе прогресса
  const updatedSteps = steps.map(step => {
    if (progress >= step.value) {
      return { ...step, status: 'completed' as const };
    } else if (progress >= step.value - 10) {
      return { ...step, status: 'current' as const };
    } else {
      return { ...step, status: 'pending' as const };
    }
  });

  return (
    <div className={cn('w-full', className)}>
      {/* Прогресс-бар */}
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        
        {/* Шаги */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
          {updatedSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'w-3 h-3 rounded-full border-2 -mt-0.5 transition-all duration-300',
                {
                  'bg-green-500 border-green-500': step.status === 'completed',
                  'bg-blue-500 border-blue-500 animate-pulse': step.status === 'current',
                  'bg-white border-gray-300': step.status === 'pending',
                }
              )}
              style={{ marginLeft: `${step.value}%` }}
            />
          ))}
        </div>
      </div>

      {/* Лейблы шагов */}
      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {updatedSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'text-center transition-colors duration-300',
                {
                  'text-green-600 font-medium': step.status === 'completed',
                  'text-blue-600 font-medium': step.status === 'current',
                  'text-gray-400': step.status === 'pending',
                }
              )}
              style={{ width: `${100 / steps.length}%` }}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
