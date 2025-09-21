// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [js.configs.recommended, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    globals: {
      // Browser globals
      document: 'readonly',
      window: 'readonly',
      console: 'readonly',
      JSX: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      fetch: 'readonly',
      alert: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      requestIdleCallback: 'readonly',
      performance: 'readonly',
      navigator: 'readonly',
      URL: 'readonly',
      URLSearchParams: 'readonly',
      Blob: 'readonly',
      
      // DOM types
      HTMLElement: 'readonly',
      HTMLDivElement: 'readonly',
      HTMLInputElement: 'readonly',
      HTMLSelectElement: 'readonly',
      HTMLTextAreaElement: 'readonly',
      HTMLButtonElement: 'readonly',
      KeyboardEvent: 'readonly',
      FocusEvent: 'readonly',
      PerformanceObserver: 'readonly',
      PerformanceNavigationTiming: 'readonly',
      
      // Node.js globals
      process: 'readonly',
      NodeJS: 'readonly',
      global: 'readonly',
      
      // React globals
      React: 'readonly',
      
      // Test globals
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      vi: 'readonly'
    }
  },
  plugins: {
    '@typescript-eslint': typescript
  },
  rules: {
    ...typescript.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}, ...storybook.configs["flat/recommended"]];
