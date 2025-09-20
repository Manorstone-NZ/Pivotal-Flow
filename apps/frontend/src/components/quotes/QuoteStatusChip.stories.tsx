/**
 * Quote Status Chip Stories - SaaS Multi-Tenant
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QuoteStatusChip, getStatusProgression, canPerformAction } from './QuoteStatusChip';

const meta: Meta<typeof QuoteStatusChip> = {
  title: 'Components/Quotes/QuoteStatusChip',
  component: QuoteStatusChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Status chip component for SaaS multi-tenant quote delivery system with enhanced status tracking.'
      }
    }
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['draft', 'pending', 'approved', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    showIcon: {
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof QuoteStatusChip>;

// Basic status examples
export const Draft: Story = {
  args: {
    status: 'draft',
    size: 'md',
    showIcon: true
  }
};

export const Pending: Story = {
  args: {
    status: 'pending',
    size: 'md',
    showIcon: true
  }
};

export const Approved: Story = {
  args: {
    status: 'approved',
    size: 'md',
    showIcon: true
  }
};

export const Sent: Story = {
  args: {
    status: 'sent',
    size: 'md',
    showIcon: true
  }
};

export const Viewed: Story = {
  args: {
    status: 'viewed',
    size: 'md',
    showIcon: true
  }
};

export const Accepted: Story = {
  args: {
    status: 'accepted',
    size: 'md',
    showIcon: true
  }
};

export const Rejected: Story = {
  args: {
    status: 'rejected',
    size: 'md',
    showIcon: true
  }
};

export const Expired: Story = {
  args: {
    status: 'expired',
    size: 'md',
    showIcon: true
  }
};

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
    size: 'md',
    showIcon: true
  }
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <QuoteStatusChip status="sent" size="sm" />
      <QuoteStatusChip status="sent" size="md" />
      <QuoteStatusChip status="sent" size="lg" />
    </div>
  )
};

// Without icons
export const WithoutIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <QuoteStatusChip status="draft" showIcon={false} />
      <QuoteStatusChip status="approved" showIcon={false} />
      <QuoteStatusChip status="sent" showIcon={false} />
      <QuoteStatusChip status="viewed" showIcon={false} />
      <QuoteStatusChip status="accepted" showIcon={false} />
    </div>
  )
};

// All statuses showcase
export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <QuoteStatusChip status="draft" />
      <QuoteStatusChip status="pending" />
      <QuoteStatusChip status="approved" />
      <QuoteStatusChip status="sent" />
      <QuoteStatusChip status="viewed" />
      <QuoteStatusChip status="accepted" />
      <QuoteStatusChip status="rejected" />
      <QuoteStatusChip status="expired" />
      <QuoteStatusChip status="cancelled" />
    </div>
  )
};

// Status progression example
export const StatusProgression: Story = {
  render: () => {
    const progression = getStatusProgression('viewed');
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status Progression for "Viewed"</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Completed:</span>
            <div className="flex space-x-2 mt-1">
              {progression.completed.map(status => (
                <QuoteStatusChip key={status} status={status} size="sm" />
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Current:</span>
            <div className="mt-1">
              <QuoteStatusChip status={progression.current} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Remaining:</span>
            <div className="flex space-x-2 mt-1">
              {progression.remaining.map(status => (
                <QuoteStatusChip key={status} status={status} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Action permissions example
export const ActionPermissions: Story = {
  render: () => {
    const statuses: Array<{ status: any; actions: string[] }> = [
      { status: 'draft', actions: ['deliver', 'edit', 'cancel'] },
      { status: 'approved', actions: ['deliver', 'cancel'] },
      { status: 'sent', actions: ['cancel', 'expire', 'resend'] },
      { status: 'viewed', actions: ['cancel', 'expire', 'resend'] },
      { status: 'accepted', actions: [] },
      { status: 'rejected', actions: ['resend'] }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Actions by Status</h3>
        {statuses.map(({ status, actions }) => (
          <div key={status} className="flex items-center space-x-4">
            <QuoteStatusChip status={status} size="sm" />
            <div className="flex space-x-2">
              {actions.map(action => (
                <span 
                  key={action}
                  className={`text-xs px-2 py-1 rounded ${
                    canPerformAction(status, action) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {action}
                </span>
              ))}
              {actions.length === 0 && (
                <span className="text-xs text-gray-500 italic">No actions available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
};
