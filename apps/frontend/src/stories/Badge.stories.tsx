import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/Button';
import { useState } from 'react';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component for displaying status indicators, counts, and labels.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    shape: {
      control: { type: 'select' },
      options: ['rounded', 'pill', 'square'],
    },
    dot: {
      control: { type: 'boolean' },
    },
    max: {
      control: { type: 'number', min: 1, max: 100 },
    },
    showZero: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge shape="rounded">Rounded</Badge>
      <Badge shape="pill">Pill</Badge>
      <Badge shape="square">Square</Badge>
    </div>
  ),
};

export const DotBadges: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <Badge dot variant="default" />
        <span>Default dot</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge dot variant="primary" />
        <span>Primary dot</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge dot variant="success" />
        <span>Success dot</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge dot variant="warning" />
        <span>Warning dot</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge dot variant="error" />
        <span>Error dot</span>
      </div>
    </div>
  ),
};

export const NumberBadges: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge>{0}</Badge>
      <Badge>{5}</Badge>
      <Badge>{42}</Badge>
      <Badge>{999}</Badge>
    </div>
  ),
};

export const WithMax: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge max={99}>{5}</Badge>
      <Badge max={99}>{50}</Badge>
      <Badge max={99}>{150}</Badge>
      <Badge max={999}>{1000}</Badge>
    </div>
  ),
};

export const ShowZero: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <Badge showZero={false}>{0}</Badge>
        <span>Hide zero (default)</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge showZero={true}>{0}</Badge>
        <span>Show zero</span>
      </div>
    </div>
  ),
};

export const WithButtons: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="relative">
        <Button>Messages</Button>
        <Badge className="absolute -top-2 -right-2" variant="error">
          3
        </Badge>
      </div>
      <div className="relative">
        <Button>Notifications</Button>
        <Badge className="absolute -top-2 -right-2" variant="primary">
          12
        </Badge>
      </div>
      <div className="relative">
        <Button>Settings</Button>
        <Badge dot className="absolute -top-1 -right-1" variant="warning" />
      </div>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge dot variant="success" />
        <span>Online</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge dot variant="warning" />
        <span>Away</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge dot variant="error" />
        <span>Offline</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge dot variant="info" />
        <span>Busy</span>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Button onClick={() => setCount(count + 1)}>
            Increment
          </Button>
          <Button onClick={() => setCount(count - 1)} variant="outline">
            Decrement
          </Button>
          <Button onClick={() => setCount(0)} variant="outline">
            Reset
          </Button>
        </div>
        <div className="flex gap-4 items-center">
          <Badge variant="primary">{count}</Badge>
          <Badge variant="success" max={10}>{count}</Badge>
          <Badge variant="warning" showZero>{count}</Badge>
        </div>
      </div>
    );
  },
};
