import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens via CSS variables
        brand: {
          DEFAULT: 'var(--brand)',
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          500: 'var(--brand)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          foreground: 'var(--danger-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          muted: 'var(--border-muted)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
} satisfies Config;
