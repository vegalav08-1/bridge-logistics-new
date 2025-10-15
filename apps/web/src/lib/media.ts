/**
 * Media queries and safe area utilities
 */

// Breakpoints (mobile-first)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// Safe area utilities for iOS
export const safeArea = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)',
} as const;

// Media query helpers
export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
} as const;

// Container utilities
export const container = {
  maxWidth: '1200px',
  padding: '1rem',
  center: true,
} as const;

// Navigation heights
export const navHeights = {
  header: '56px',
  bottomNav: '72px',
} as const;


