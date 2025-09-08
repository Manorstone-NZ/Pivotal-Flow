import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LandingPage } from './Landing';
import { Hero } from './sections/Hero';
import { FeatureGrid } from './sections/FeatureGrid';
import { LiveStatus } from './sections/LiveStatus';
import { Footer } from './sections/Footer';

// Mock the auth hook
const mockUseAuth = (isAuthenticated: boolean = false, user: any = null) => ({
  isAuthenticated,
  user,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  checkAuthStatus: async () => {},
  clearError: () => {},
});

// Mock react-router-dom
// const mockNavigate = () => {};

// Story wrapper component
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main landing page for Pivotal Flow, serving both authenticated and unauthenticated users.',
      },
    },
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default landing page for unauthenticated users.',
      },
    },
  },
};

export const Authenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Landing page for authenticated users showing dashboard shortcuts.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock authenticated state
      const originalModule = require('../../../features/auth');
      vi.spyOn(originalModule, 'useAuth').mockReturnValue(
        mockUseAuth(true, { email: 'user@example.com' })
      );
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

// Hero Stories
// const heroMeta: Meta<typeof Hero> = {
//   title: 'Pages/Landing/Hero',
//   component: Hero,
//   parameters: {
//     layout: 'fullscreen',
//     docs: {
//       description: {
//         component: 'Hero section with headline, subheadline, and dynamic CTAs based on authentication state.',
//       },
//     },
//   },
//   decorators: [
//     (Story) => (
//       <StoryWrapper>
//         <Story />
//       </StoryWrapper>
//     ),
//   ],
// };

type HeroStory = StoryObj<typeof Hero>;

export const HeroUnauthenticated: HeroStory = {
  parameters: {
    docs: {
      description: {
        story: 'Hero section for unauthenticated users showing Sign In CTA.',
      },
    },
  },
};

export const HeroAuthenticated: HeroStory = {
  parameters: {
    docs: {
      description: {
        story: 'Hero section for authenticated users showing Continue to Dashboard and Explore Quotes CTAs.',
      },
    },
  },
  decorators: [
    (Story) => {
      const originalModule = require('../../../features/auth');
      vi.spyOn(originalModule, 'useAuth').mockReturnValue(
        mockUseAuth(true, { email: 'user@example.com' })
      );
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

// FeatureGrid Stories
// const featureGridMeta: Meta<typeof FeatureGrid> = {
//   title: 'Pages/Landing/FeatureGrid',
//   component: FeatureGrid,
//   parameters: {
//     layout: 'fullscreen',
//     docs: {
//       description: {
//         component: 'Grid of 5 feature cards showcasing Quotes, Rate Cards, Invoices, Time & Approvals, and Users.',
//       },
//     },
//   },
//   decorators: [
//     (Story) => (
//       <StoryWrapper>
//         <Story />
//       </StoryWrapper>
//     ),
//   ],
// };

type FeatureGridStory = StoryObj<typeof FeatureGrid>;

export const FeatureGridUnauthenticated: FeatureGridStory = {
  parameters: {
    docs: {
      description: {
        story: 'Feature grid for unauthenticated users with Sign In Required CTAs.',
      },
    },
  },
};

export const FeatureGridAuthenticated: FeatureGridStory = {
  parameters: {
    docs: {
      description: {
        story: 'Feature grid for authenticated users with Get Started CTAs.',
      },
    },
  },
  decorators: [
    (Story) => {
      const originalModule = require('../../../features/auth');
      vi.spyOn(originalModule, 'useAuth').mockReturnValue(
        mockUseAuth(true, { email: 'user@example.com' })
      );
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

// LiveStatus Stories
// const liveStatusMeta: Meta<typeof LiveStatus> = {
//   title: 'Pages/Landing/LiveStatus',
//   component: LiveStatus,
//   parameters: {
//     layout: 'fullscreen',
//     docs: {
//       description: {
//         component: 'Live system status widget showing backend health information.',
//       },
//     },
//   },
//   decorators: [
//     (Story) => (
//       <StoryWrapper>
//         <Story />
//       </StoryWrapper>
//     ),
//   ],
// };

type LiveStatusStory = StoryObj<typeof LiveStatus>;

export const LiveStatusHealthy: LiveStatusStory = {
  parameters: {
    docs: {
      description: {
        story: 'Live status widget showing all systems operational.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock successful health check
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          timestamp: '2024-01-01T00:00:00Z',
          uptime: 3600,
          version: '1.0.0',
          checks: {
            database: { status: 'ok', message: 'Database connection successful', timestamp: '2024-01-01T00:00:00Z' },
            redis: { status: 'ok', message: 'Redis connection successful', timestamp: '2024-01-01T00:00:00Z' },
            metrics: { status: 'ok', message: 'Metrics service operational', timestamp: '2024-01-01T00:00:00Z' },
          },
        }),
      });
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

export const LiveStatusDegraded: LiveStatusStory = {
  parameters: {
    docs: {
      description: {
        story: 'Live status widget showing degraded service status.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock degraded health check
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'error',
          timestamp: '2024-01-01T00:00:00Z',
          uptime: 3600,
          version: '1.0.0',
          checks: {
            database: { status: 'ok', message: 'Database connection successful', timestamp: '2024-01-01T00:00:00Z' },
            redis: { status: 'error', message: 'Redis connection failed', timestamp: '2024-01-01T00:00:00Z' },
            metrics: { status: 'ok', message: 'Metrics service operational', timestamp: '2024-01-01T00:00:00Z' },
          },
        }),
      });
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

export const LiveStatusError: LiveStatusStory = {
  parameters: {
    docs: {
      description: {
        story: 'Live status widget showing error state when health check fails.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock failed health check
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

// Footer Stories
// const footerMeta: Meta<typeof Footer> = {
//   title: 'Pages/Landing/Footer',
//   component: Footer,
//   parameters: {
//     layout: 'fullscreen',
//     docs: {
//       description: {
//         component: 'Footer with version information, links, and copyright.',
//       },
//     },
//   },
//   decorators: [
//     (Story) => (
//       <StoryWrapper>
//         <Story />
//       </StoryWrapper>
//     ),
//   ],
// };

type FooterStory = StoryObj<typeof Footer>;

export const FooterDefault: FooterStory = {
  parameters: {
    docs: {
      description: {
        story: 'Default footer with version information and links.',
      },
    },
  },
};
