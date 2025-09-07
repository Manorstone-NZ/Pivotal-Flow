import type { Meta, StoryObj } from '@storybook/react';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard 
} from '../../components/ui/Skeleton';
import { useState } from 'react';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A skeleton component for displaying loading states with various shapes and animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['text', 'circular', 'rectangular', 'rounded'],
    },
    animation: {
      control: { type: 'select' },
      options: ['pulse', 'wave', 'none'],
    },
    width: {
      control: { type: 'text' },
    },
    height: {
      control: { type: 'text' },
    },
    lines: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: '200px',
    height: '20px',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="text" width="200px" height="20px" />
        <span className="text-sm text-gray-600">Text</span>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <span className="text-sm text-gray-600">Circular</span>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width="200px" height="100px" />
        <span className="text-sm text-gray-600">Rectangular</span>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" width="200px" height="100px" />
        <span className="text-sm text-gray-600">Rounded</span>
      </div>
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton animation="pulse" width="200px" height="20px" />
        <span className="text-sm text-gray-600">Pulse</span>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton animation="wave" width="200px" height="20px" />
        <span className="text-sm text-gray-600">Wave</span>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton animation="none" width="200px" height="20px" />
        <span className="text-sm text-gray-600">None</span>
      </div>
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Single Line</h3>
        <SkeletonText lines={1} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Three Lines</h3>
        <SkeletonText lines={3} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Five Lines</h3>
        <SkeletonText lines={5} />
      </div>
    </div>
  ),
};

export const PresetComponents: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Skeleton Text</h3>
        <SkeletonText lines={3} />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Skeleton Avatar</h3>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Skeleton Button</h3>
        <div className="flex items-center gap-4">
          <SkeletonButton size="sm" />
          <SkeletonButton size="md" />
          <SkeletonButton size="lg" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Skeleton Card</h3>
        <SkeletonCard />
      </div>
    </div>
  ),
};

export const UserProfileSkeleton: Story = {
  render: () => (
    <div className="max-w-sm">
      <div className="flex items-center space-x-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <SkeletonText lines={1} className="mb-2" />
          <SkeletonText lines={1} className="w-2/3" />
        </div>
      </div>
      <SkeletonText lines={3} className="mb-4" />
      <div className="flex space-x-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="max-w-sm">
      <Skeleton variant="rectangular" width="100%" height="200px" className="mb-4" />
      <SkeletonText lines={1} className="mb-2" />
      <SkeletonText lines={2} className="mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton width="80px" height="20px" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  ),
};

export const TableSkeleton: Story = {
  render: () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonAvatar size="sm" />
          <div className="flex-1">
            <SkeletonText lines={1} className="mb-1" />
            <SkeletonText lines={1} className="w-1/2" />
          </div>
          <Skeleton width="60px" height="20px" />
        </div>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(true);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsLoading(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Show Loading
          </button>
          <button
            onClick={() => setIsLoading(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Show Content
          </button>
        </div>
        
        {isLoading ? (
          <div className="max-w-sm">
            <div className="flex items-center space-x-4 mb-4">
              <SkeletonAvatar />
              <div className="flex-1">
                <SkeletonText lines={1} className="mb-2" />
                <SkeletonText lines={1} className="w-2/3" />
              </div>
            </div>
            <SkeletonText lines={3} />
          </div>
        ) : (
          <div className="max-w-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">JD</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-gray-600">Software Engineer</p>
              </div>
            </div>
            <p className="text-gray-600">
              This is the actual content that would be displayed when loading is complete.
            </p>
          </div>
        )}
      </div>
    );
  },
};
