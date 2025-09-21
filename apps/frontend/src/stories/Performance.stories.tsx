import type { Meta, StoryObj } from '@storybook/react-vite';
import { PerformanceOptimizer } from '../components/performance/PerformanceOptimizer';
import { BundleAnalyzer } from '../components/performance/BundleAnalyzer';
import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';
import { useState } from 'react';

// Error component for testing ErrorBoundary
const ErrorComponent = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('This is a test error for the ErrorBoundary');
  }
  return <div>This component works fine!</div>;
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Performance/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Error boundary component for catching and handling React errors gracefully.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Error Boundary Demo</h3>
        <p className="text-text-secondary mb-4">
          This content is wrapped in an ErrorBoundary. If an error occurs, it will be caught and displayed gracefully.
        </p>
        <ErrorComponent shouldError={false} />
      </Card>
    </ErrorBoundary>
  ),
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Error Boundary with Error</h3>
        <p className="text-text-secondary mb-4">
          This will trigger an error to demonstrate the ErrorBoundary in action.
        </p>
        <ErrorComponent shouldError={true} />
      </Card>
    </ErrorBoundary>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(false);
    
    return (
      <ErrorBoundary>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interactive Error Boundary</h3>
          <div className="space-y-4">
            <Button onClick={() => setShouldError(!shouldError)}>
              {shouldError ? 'Fix Error' : 'Trigger Error'}
            </Button>
            <ErrorComponent shouldError={shouldError} />
          </div>
        </Card>
      </ErrorBoundary>
    );
  },
};

// PerformanceMonitor Stories
const PerformanceMonitorMeta: Meta<typeof PerformanceMonitor> = {
  title: 'Performance/PerformanceMonitor',
  component: PerformanceMonitor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real-time performance monitoring component for tracking Core Web Vitals and other metrics.',
      },
    },
  },
  tags: ['autodocs'],
};

export const PerformanceMonitorStory: StoryObj<typeof PerformanceMonitor> = {
  render: () => (
    <div className="space-y-4">
      <PerformanceMonitor />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Monitor Demo</h3>
        <p className="text-text-secondary mb-4">
          The PerformanceMonitor component tracks Core Web Vitals and other performance metrics in real-time.
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-surface-card rounded border">
            <strong>LCP (Largest Contentful Paint):</strong> Measures loading performance
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <strong>FID (First Input Delay):</strong> Measures interactivity
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <strong>CLS (Cumulative Layout Shift):</strong> Measures visual stability
          </div>
        </div>
      </Card>
    </div>
  ),
};

// PerformanceOptimizer Stories
const PerformanceOptimizerMeta: Meta<typeof PerformanceOptimizer> = {
  title: 'Performance/PerformanceOptimizer',
  component: PerformanceOptimizer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Performance optimization component that provides recommendations and implements optimizations.',
      },
    },
  },
  tags: ['autodocs'],
};

export const PerformanceOptimizerStory: StoryObj<typeof PerformanceOptimizer> = {
  render: () => (
    <div className="space-y-4">
      <PerformanceOptimizer />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Optimizer</h3>
        <p className="text-text-secondary mb-4">
          This component analyzes performance and provides optimization recommendations.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800">✅ Optimizations Applied</h4>
            <ul className="text-sm text-green-700 mt-1">
              <li>• Code splitting enabled</li>
              <li>• Lazy loading implemented</li>
              <li>• Image optimization active</li>
            </ul>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800">⚠️ Recommendations</h4>
            <ul className="text-sm text-yellow-700 mt-1">
              <li>• Consider enabling service worker caching</li>
              <li>• Optimize bundle size further</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  ),
};

// RoutePrefetch Stories
const RoutePrefetchMeta: Meta<typeof RoutePrefetch> = {
  title: 'Performance/RoutePrefetch',
  component: RoutePrefetch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Route prefetching component for optimizing navigation performance.',
      },
    },
  },
  tags: ['autodocs'],
};

export const RoutePrefetchStory: StoryObj<typeof RoutePrefetch> = {
  render: () => (
    <div className="space-y-4">
      <RoutePrefetch />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Route Prefetch Demo</h3>
        <p className="text-text-secondary mb-4">
          RoutePrefetch component optimizes navigation by prefetching route components.
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-surface-card rounded border">
            <strong>Prefetch Strategy:</strong> Hover-based prefetching
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <strong>Routes Prefetched:</strong> Dashboard, Quotes, Projects, Settings
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <strong>Performance Impact:</strong> Faster navigation, reduced loading times
          </div>
        </div>
      </Card>
    </div>
  ),
};

// BundleAnalyzer Stories
const BundleAnalyzerMeta: Meta<typeof BundleAnalyzer> = {
  title: 'Performance/BundleAnalyzer',
  component: BundleAnalyzer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Bundle analyzer component for monitoring and optimizing JavaScript bundle sizes.',
      },
    },
  },
  tags: ['autodocs'],
};

export const BundleAnalyzerStory: StoryObj<typeof BundleAnalyzer> = {
  render: () => (
    <div className="space-y-4">
      <BundleAnalyzer />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bundle Analysis</h3>
        <p className="text-text-secondary mb-4">
          BundleAnalyzer provides insights into your JavaScript bundle composition and size.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-surface-card rounded border">
            <div className="flex justify-between items-center">
              <span>Total Bundle Size</span>
              <span className="font-mono">196.4 KB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-brand-primary h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <div className="flex justify-between items-center">
              <span>Vendor Bundle</span>
              <span className="font-mono">141.3 KB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-surface-card rounded border">
            <div className="flex justify-between items-center">
              <span>App Bundle</span>
              <span className="font-mono">55.1 KB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ),
};

// Combined Performance Dashboard
export const PerformanceDashboard: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Performance Dashboard</h2>
        <p className="text-text-secondary mb-6">
          Comprehensive performance monitoring and optimization tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Real-time Monitoring</h3>
            <PerformanceMonitor />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Optimization Tools</h3>
            <PerformanceOptimizer />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Route Optimization</h3>
            <RoutePrefetch />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Bundle Analysis</h3>
            <BundleAnalyzer />
          </div>
        </div>
      </Card>
    </div>
  ),
};