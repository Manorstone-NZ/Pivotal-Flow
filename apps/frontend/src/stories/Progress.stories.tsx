import type { Meta, StoryObj } from '@storybook/react-vite';
import { 
  Progress, 
  CircularProgress, 
  StepProgress 
} from '../../components/ui/Progress';
import { useState } from 'react';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Progress components for displaying loading states and completion status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
    max: {
      control: { type: 'number', min: 1, max: 200 },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    showLabel: {
      control: { type: 'boolean' },
    },
    showPercentage: {
      control: { type: 'boolean' },
    },
    animated: {
      control: { type: 'boolean' },
    },
    striped: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 75,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress value={75} variant="default" />
      <Progress value={75} variant="success" />
      <Progress value={75} variant="warning" />
      <Progress value={75} variant="error" />
      <Progress value={75} variant="info" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <Progress value={75} size="sm" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Medium</h3>
        <Progress value={75} size="md" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <Progress value={75} size="lg" />
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress value={75} showLabel showPercentage />
      <Progress value={50} showLabel showPercentage variant="success" />
      <Progress value={25} showLabel showPercentage variant="warning" />
    </div>
  ),
};

export const Animated: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Pulse Animation</h3>
        <Progress value={75} animated />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Striped</h3>
        <Progress value={75} striped />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Both</h3>
        <Progress value={75} animated striped />
      </div>
    </div>
  ),
};

export const CircularProgressStory: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Sizes</h3>
        <div className="flex items-center gap-6">
          <CircularProgress value={75} size="sm" />
          <CircularProgress value={75} size="md" />
          <CircularProgress value={75} size="lg" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Variants</h3>
        <div className="flex items-center gap-6">
          <CircularProgress value={75} variant="default" />
          <CircularProgress value={75} variant="success" />
          <CircularProgress value={75} variant="warning" />
          <CircularProgress value={75} variant="error" />
          <CircularProgress value={75} variant="info" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Without Percentage</h3>
        <div className="flex items-center gap-6">
          <CircularProgress value={75} showPercentage={false} />
          <CircularProgress value={50} showPercentage={false} variant="success" />
          <CircularProgress value={25} showPercentage={false} variant="warning" />
        </div>
      </div>
    </div>
  ),
};

export const StepProgressStory: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Default Steps</h3>
        <StepProgress
          steps={['Start', 'Process', 'Review', 'Complete']}
          currentStep={2}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Without Labels</h3>
        <StepProgress
          steps={['Start', 'Process', 'Review', 'Complete']}
          currentStep={1}
          showLabels={false}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Different Variants</h3>
        <div className="space-y-4">
          <StepProgress
            steps={['Step 1', 'Step 2', 'Step 3']}
            currentStep={2}
            variant="success"
          />
          <StepProgress
            steps={['Step 1', 'Step 2', 'Step 3']}
            currentStep={1}
            variant="warning"
          />
          <StepProgress
            steps={['Step 1', 'Step 2', 'Step 3']}
            currentStep={0}
            variant="error"
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setValue(Math.max(0, value - 10))}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            -10
          </button>
          <button
            onClick={() => setValue(Math.min(100, value + 10))}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            +10
          </button>
          <span className="text-sm text-gray-600">
            Value: {value}%
          </span>
        </div>
        
        <div className="space-y-4">
          <Progress value={value} showLabel showPercentage />
          <CircularProgress value={value} />
        </div>
      </div>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">File Upload</h3>
        <Progress value={65} showLabel showPercentage variant="info" />
        <p className="text-xs text-gray-600 mt-1">Uploading document.pdf...</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Installation Progress</h3>
        <StepProgress
          steps={['Download', 'Install', 'Configure', 'Complete']}
          currentStep={2}
          variant="success"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Storage Usage</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used: 7.5 GB</span>
            <span>Total: 10 GB</span>
          </div>
          <Progress value={75} variant="warning" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Profile Completion</h3>
        <div className="flex items-center gap-4">
          <CircularProgress value={80} size="sm" />
          <div>
            <p className="text-sm font-medium">80% Complete</p>
            <p className="text-xs text-gray-600">Add profile picture to complete</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
