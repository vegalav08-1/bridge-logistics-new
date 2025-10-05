import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#059669', // emerald-600
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
