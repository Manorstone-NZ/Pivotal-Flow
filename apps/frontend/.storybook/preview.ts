import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../src/lib/theme/ThemeProvider';
import '../src/styles/globals.css';
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [
    (Story) => React.createElement(ThemeProvider, { defaultTheme: 'light' },
      React.createElement('div', { style: { padding: '2rem' } },
        React.createElement(Story)
      )
    ),
  ],
};

export default preview;
