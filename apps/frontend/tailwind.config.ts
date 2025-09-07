import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './src/stories/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: 'var(--pf-color-brand-primary)',
          secondary: 'var(--pf-color-brand-secondary)',
          accent: 'var(--pf-color-brand-accent)',
        },
        // Semantic Colors
        semantic: {
          success: 'var(--pf-color-semantic-success)',
          warning: 'var(--pf-color-semantic-warning)',
          error: 'var(--pf-color-semantic-error)',
          info: 'var(--pf-color-semantic-info)',
        },
        // Neutral Colors
        neutral: {
          50: 'var(--pf-color-neutral-50)',
          100: 'var(--pf-color-neutral-100)',
          200: 'var(--pf-color-neutral-200)',
          300: 'var(--pf-color-neutral-300)',
          400: 'var(--pf-color-neutral-400)',
          500: 'var(--pf-color-neutral-500)',
          600: 'var(--pf-color-neutral-600)',
          700: 'var(--pf-color-neutral-700)',
          800: 'var(--pf-color-neutral-800)',
          900: 'var(--pf-color-neutral-900)',
          950: 'var(--pf-color-neutral-950)',
        },
        // Surface Colors
        surface: {
          background: 'var(--pf-color-surface-background)',
          card: 'var(--pf-color-surface-card)',
          overlay: 'var(--pf-color-surface-overlay)',
          border: 'var(--pf-color-surface-border)',
        },
        // Text Colors
        text: {
          primary: 'var(--pf-color-text-primary)',
          secondary: 'var(--pf-color-text-secondary)',
          disabled: 'var(--pf-color-text-disabled)',
          inverse: 'var(--pf-color-text-inverse)',
        },
      },
      fontFamily: {
        sans: ['var(--pf-font-family-sans)'],
        mono: ['var(--pf-font-family-mono)'],
      },
      fontSize: {
        xs: ['var(--pf-font-size-xs)', { lineHeight: 'var(--pf-line-height-tight)' }],
        sm: ['var(--pf-font-size-sm)', { lineHeight: 'var(--pf-line-height-snug)' }],
        base: ['var(--pf-font-size-base)', { lineHeight: 'var(--pf-line-height-normal)' }],
        lg: ['var(--pf-font-size-lg)', { lineHeight: 'var(--pf-line-height-normal)' }],
        xl: ['var(--pf-font-size-xl)', { lineHeight: 'var(--pf-line-height-snug)' }],
        '2xl': ['var(--pf-font-size-2xl)', { lineHeight: 'var(--pf-line-height-tight)' }],
        '3xl': ['var(--pf-font-size-3xl)', { lineHeight: 'var(--pf-line-height-tight)' }],
        '4xl': ['var(--pf-font-size-4xl)', { lineHeight: 'var(--pf-line-height-tight)' }],
        '5xl': ['var(--pf-font-size-5xl)', { lineHeight: 'var(--pf-line-height-tight)' }],
        '6xl': ['var(--pf-font-size-6xl)', { lineHeight: 'var(--pf-line-height-tight)' }],
      },
      fontWeight: {
        thin: 'var(--pf-font-weight-thin)',
        light: 'var(--pf-font-weight-light)',
        normal: 'var(--pf-font-weight-normal)',
        medium: 'var(--pf-font-weight-medium)',
        semibold: 'var(--pf-font-weight-semibold)',
        bold: 'var(--pf-font-weight-bold)',
        extrabold: 'var(--pf-font-weight-extrabold)',
      },
      lineHeight: {
        tight: 'var(--pf-line-height-tight)',
        snug: 'var(--pf-line-height-snug)',
        normal: 'var(--pf-line-height-normal)',
        relaxed: 'var(--pf-line-height-relaxed)',
        loose: 'var(--pf-line-height-loose)',
      },
      letterSpacing: {
        tighter: 'var(--pf-letter-spacing-tighter)',
        tight: 'var(--pf-letter-spacing-tight)',
        normal: 'var(--pf-letter-spacing-normal)',
        wide: 'var(--pf-letter-spacing-wide)',
        wider: 'var(--pf-letter-spacing-wider)',
      },
      spacing: {
        0: 'var(--pf-spacing-0)',
        1: 'var(--pf-spacing-1)',
        2: 'var(--pf-spacing-2)',
        3: 'var(--pf-spacing-3)',
        4: 'var(--pf-spacing-4)',
        5: 'var(--pf-spacing-5)',
        6: 'var(--pf-spacing-6)',
        8: 'var(--pf-spacing-8)',
        10: 'var(--pf-spacing-10)',
        12: 'var(--pf-spacing-12)',
        16: 'var(--pf-spacing-16)',
        20: 'var(--pf-spacing-20)',
        24: 'var(--pf-spacing-24)',
        32: 'var(--pf-spacing-32)',
        40: 'var(--pf-spacing-40)',
        48: 'var(--pf-spacing-48)',
        56: 'var(--pf-spacing-56)',
        64: 'var(--pf-spacing-64)',
      },
      borderWidth: {
        0: 'var(--pf-border-width-0)',
        1: 'var(--pf-border-width-1)',
        2: 'var(--pf-border-width-2)',
        4: 'var(--pf-border-width-4)',
        8: 'var(--pf-border-width-8)',
      },
      borderRadius: {
        none: 'var(--pf-border-radius-none)',
        sm: 'var(--pf-border-radius-sm)',
        base: 'var(--pf-border-radius-base)',
        md: 'var(--pf-border-radius-md)',
        lg: 'var(--pf-border-radius-lg)',
        xl: 'var(--pf-border-radius-xl)',
        '2xl': 'var(--pf-border-radius-2xl)',
        '3xl': 'var(--pf-border-radius-3xl)',
        full: 'var(--pf-border-radius-full)',
      },
      boxShadow: {
        sm: 'var(--pf-shadow-sm)',
        base: 'var(--pf-shadow-base)',
        md: 'var(--pf-shadow-md)',
        lg: 'var(--pf-shadow-lg)',
        xl: 'var(--pf-shadow-xl)',
        '2xl': 'var(--pf-shadow-2xl)',
        inner: 'var(--pf-shadow-inner)',
        none: 'var(--pf-shadow-none)',
      },
      transitionDuration: {
        75: 'var(--pf-duration-75)',
        100: 'var(--pf-duration-100)',
        150: 'var(--pf-duration-150)',
        200: 'var(--pf-duration-200)',
        300: 'var(--pf-duration-300)',
        500: 'var(--pf-duration-500)',
        700: 'var(--pf-duration-700)',
        1000: 'var(--pf-duration-1000)',
      },
      transitionTimingFunction: {
        linear: 'var(--pf-timing-linear)',
        in: 'var(--pf-timing-in)',
        out: 'var(--pf-timing-out)',
        'in-out': 'var(--pf-timing-in-out)',
      },
      screens: {
        sm: 'var(--pf-breakpoint-sm)',
        md: 'var(--pf-breakpoint-md)',
        lg: 'var(--pf-breakpoint-lg)',
        xl: 'var(--pf-breakpoint-xl)',
        '2xl': 'var(--pf-breakpoint-2xl)',
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config;
