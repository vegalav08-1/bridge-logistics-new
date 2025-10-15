import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining class names with Tailwind CSS
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class utility
 */
export function cn(condition: boolean, trueClass: string, falseClass = '') {
  return condition ? trueClass : falseClass;
}


