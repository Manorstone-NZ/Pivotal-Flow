// Modern Design System for Pivotal Flow
// Inspired by Jira/Google Material Design principles

export const designTokens = {
  // Spacing Scale (8px base unit)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
    '6xl': '8rem',    // 128px
  },

  // Typography Scale
  typography: {
    // Headings
    h1: {
      fontSize: '2.5rem',      // 40px
      lineHeight: '3rem',      // 48px
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',        // 32px
      lineHeight: '2.5rem',    // 40px
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',      // 24px
      lineHeight: '2rem',      // 32px
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',     // 20px
      lineHeight: '1.75rem',   // 28px
      fontWeight: '600',
    },
    h5: {
      fontSize: '1.125rem',    // 18px
      lineHeight: '1.5rem',    // 24px
      fontWeight: '600',
    },
    h6: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.5rem',    // 24px
      fontWeight: '600',
    },
    // Body text
    body: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.5rem',    // 24px
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: '400',
    },
    caption: {
      fontSize: '0.75rem',     // 12px
      lineHeight: '1rem',      // 16px
      fontWeight: '400',
    },
  },

  // Color System (Modern, accessible)
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Neutral Colors (Modern grays)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Semantic Colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
  },

  // Shadows (Subtle, modern)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Border Radius
  radius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // Icon Sizes (Properly sized)
  iconSizes: {
    xs: '0.75rem',    // 12px
    sm: '1rem',       // 16px
    md: '1.25rem',    // 20px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
  },
};

// CSS Custom Properties for Tailwind
export const cssVariables = `
  :root {
    /* Spacing */
    --spacing-xs: ${designTokens.spacing.xs};
    --spacing-sm: ${designTokens.spacing.sm};
    --spacing-md: ${designTokens.spacing.md};
    --spacing-lg: ${designTokens.spacing.lg};
    --spacing-xl: ${designTokens.spacing.xl};
    --spacing-2xl: ${designTokens.spacing['2xl']};
    --spacing-3xl: ${designTokens.spacing['3xl']};
    --spacing-4xl: ${designTokens.spacing['4xl']};
    --spacing-5xl: ${designTokens.spacing['5xl']};
    --spacing-6xl: ${designTokens.spacing['6xl']};

    /* Colors */
    --color-primary-50: ${designTokens.colors.primary[50]};
    --color-primary-100: ${designTokens.colors.primary[100]};
    --color-primary-200: ${designTokens.colors.primary[200]};
    --color-primary-300: ${designTokens.colors.primary[300]};
    --color-primary-400: ${designTokens.colors.primary[400]};
    --color-primary-500: ${designTokens.colors.primary[500]};
    --color-primary-600: ${designTokens.colors.primary[600]};
    --color-primary-700: ${designTokens.colors.primary[700]};
    --color-primary-800: ${designTokens.colors.primary[800]};
    --color-primary-900: ${designTokens.colors.primary[900]};

    --color-neutral-50: ${designTokens.colors.neutral[50]};
    --color-neutral-100: ${designTokens.colors.neutral[100]};
    --color-neutral-200: ${designTokens.colors.neutral[200]};
    --color-neutral-300: ${designTokens.colors.neutral[300]};
    --color-neutral-400: ${designTokens.colors.neutral[400]};
    --color-neutral-500: ${designTokens.colors.neutral[500]};
    --color-neutral-600: ${designTokens.colors.neutral[600]};
    --color-neutral-700: ${designTokens.colors.neutral[700]};
    --color-neutral-800: ${designTokens.colors.neutral[800]};
    --color-neutral-900: ${designTokens.colors.neutral[900]};

    /* Shadows */
    --shadow-sm: ${designTokens.shadows.sm};
    --shadow-md: ${designTokens.shadows.md};
    --shadow-lg: ${designTokens.shadows.lg};
    --shadow-xl: ${designTokens.shadows.xl};

    /* Border Radius */
    --radius-sm: ${designTokens.radius.sm};
    --radius-md: ${designTokens.radius.md};
    --radius-lg: ${designTokens.radius.lg};
    --radius-xl: ${designTokens.radius.xl};
    --radius-2xl: ${designTokens.radius['2xl']};
  }
`;

// Modern Component Styles
export const modernStyles = {
  // Card Styles (Clean, minimal)
  card: {
    base: 'bg-white rounded-lg border border-neutral-200 shadow-sm transition-all duration-200',
    hover: 'hover:shadow-md hover:border-neutral-300',
    padding: 'p-6',
    paddingSm: 'p-4',
    paddingLg: 'p-8',
  },

  // Button Styles (Modern, accessible)
  button: {
    base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
    outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    },
  },

  // Typography Styles
  typography: {
    h1: 'text-4xl font-bold text-neutral-900 tracking-tight',
    h2: 'text-3xl font-semibold text-neutral-900 tracking-tight',
    h3: 'text-2xl font-semibold text-neutral-900 tracking-tight',
    h4: 'text-xl font-semibold text-neutral-900',
    h5: 'text-lg font-semibold text-neutral-900',
    h6: 'text-base font-semibold text-neutral-900',
    body: 'text-base text-neutral-700',
    bodySmall: 'text-sm text-neutral-600',
    caption: 'text-xs text-neutral-500',
  },

  // Layout Styles
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-16 sm:py-20 lg:py-24',
    grid: 'grid gap-6 lg:gap-8',
    gridCols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    },
  },
};

export default designTokens;

