import React from 'react';
import { cn } from './utils/cn';

export interface ActionButtonProps {
  action: string;
  label: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

const variantConfig = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
};

const sizeConfig = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function ActionButton({
  action,
  label,
  description,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className
}: ActionButtonProps) {
  const variantClass = variantConfig[variant];
  const sizeClass = sizeConfig[size];

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClass,
        sizeClass,
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
          'focus:ring-blue-500': variant === 'primary',
          'focus:ring-gray-500': variant === 'secondary',
          'focus:ring-red-500': variant === 'danger',
          'focus:ring-green-500': variant === 'success',
        },
        className
      )}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      <div className="text-left">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs opacity-90 mt-0.5">{description}</div>
        )}
      </div>
    </button>
  );
}
