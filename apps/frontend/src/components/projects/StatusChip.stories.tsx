/**
 * StatusChip Storybook Stories
 * Stories for the StatusChip component with controls and accessibility checks
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusChip } from './StatusChip';

const meta: Meta<typeof StatusChip> = {
  title: 'Projects/StatusChip',
  component: StatusChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A status chip component that displays project status with appropriate colors and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'completed', 'on-hold', 'cancelled'],
      description: 'The project status to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the status chip',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusChip>;

// Default story
export const Default: Story = {
  args: {
    status: 'active',
    size: 'md',
  },
};

// All status variants
export const Active: Story = {
  args: {
    status: 'active',
    size: 'md',
  },
};

export const Completed: Story = {
  args: {
    status: 'completed',
    size: 'md',
  },
};

export const OnHold: Story = {
  args: {
    status: 'on-hold',
    size: 'md',
  },
};

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
    size: 'md',
  },
};

// Size variants
export const Small: Story = {
  args: {
    status: 'active',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    status: 'active',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    status: 'active',
    size: 'lg',
  },
};

// All statuses in different sizes
export const AllStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Small</h3>
        <div className="flex gap-2">
          <StatusChip status="active" size="sm" />
          <StatusChip status="completed" size="sm" />
          <StatusChip status="on-hold" size="sm" />
          <StatusChip status="cancelled" size="sm" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Medium</h3>
        <div className="flex gap-2">
          <StatusChip status="active" size="md" />
          <StatusChip status="completed" size="md" />
          <StatusChip status="on-hold" size="md" />
          <StatusChip status="cancelled" size="md" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Large</h3>
        <div className="flex gap-2">
          <StatusChip status="active" size="lg" />
          <StatusChip status="completed" size="lg" />
          <StatusChip status="on-hold" size="lg" />
          <StatusChip status="cancelled" size="lg" />
        </div>
      </div>
    </div>
  ),
};
