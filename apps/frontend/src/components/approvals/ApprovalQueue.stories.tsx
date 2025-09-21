import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovalQueue } from './ApprovalQueue';

// Mock data for stories
const mockApprovals = [
  {
    id: 'approval-1',
    organizationId: 'org-1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    projectId: 'project-1',
    projectName: 'Website Redesign',
    date: '2024-01-15',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    duration: 480,
    breakMinutes: 60,
    description: 'Frontend development work on user dashboard',
    activityType: 'development',
    billable: true,
    hourlyRate: 85,
    billableAmount: 340,
    status: 'pending',
    submittedAt: '2024-01-16T08:00:00Z',
    submittedBy: 'user-1'
  },
  {
    id: 'approval-2',
    organizationId: 'org-1',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    projectId: 'project-2',
    projectName: 'Mobile App',
    date: '2024-01-16',
    startTime: '2024-01-16T09:30:00Z',
    endTime: '2024-01-16T17:30:00Z',
    duration: 480,
    breakMinutes: 60,
    description: 'Backend API development and testing',
    activityType: 'development',
    billable: true,
    hourlyRate: 90,
    billableAmount: 360,
    status: 'pending',
    submittedAt: '2024-01-17T08:30:00Z',
    submittedBy: 'user-2'
  },
  {
    id: 'approval-3',
    organizationId: 'org-1',
    userId: 'user-3',
    userName: 'Bob Johnson',
    userEmail: 'bob.johnson@example.com',
    projectId: 'project-1',
    projectName: 'Website Redesign',
    date: '2024-01-17',
    startTime: '2024-01-17T10:00:00Z',
    endTime: '2024-01-17T18:00:00Z',
    duration: 480,
    breakMinutes: 60,
    description: 'Code review and documentation',
    activityType: 'review',
    billable: true,
    hourlyRate: 75,
    billableAmount: 300,
    status: 'pending',
    submittedAt: '2024-01-18T09:00:00Z',
    submittedBy: 'user-3'
  }
];

// Create a mock query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Mock provider component
const MockProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

const meta: Meta<typeof ApprovalQueue> = {
  title: 'Components/Approvals/ApprovalQueue',
  component: ApprovalQueue,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A queue component for managing time entry approvals. Displays pending time entries that require manager approval with bulk actions and individual review capabilities.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => React.createElement(MockProvider, null, React.createElement(Story))
  ],
  argTypes: {
    onApprove: {
      action: 'approve',
      description: 'Called when a time entry is approved'
    },
    onReject: {
      action: 'reject',
      description: 'Called when a time entry is rejected'
    },
    onBulkApprove: {
      action: 'bulkApprove',
      description: 'Called when multiple time entries are approved'
    },
    onBulkReject: {
      action: 'bulkReject',
      description: 'Called when multiple time entries are rejected'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ApprovalQueue>;

// Simple mock component that doesn't use hooks
const MockApprovalQueue = (props: any) => {
  const [approvals] = React.useState(mockApprovals);
  const [isLoading] = React.useState(false);
  const [error] = React.useState(null);

  return React.createElement(ApprovalQueue, {
    ...props,
    approvals: approvals,
    isLoading,
    error,
    onRefresh: () => Promise.resolve()
  });
};

export const Default: Story = {
  args: {},
  render: (args) => React.createElement(MockApprovalQueue, args)
};

export const Empty: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ApprovalQueue with no pending approvals, showing empty state.'
      }
    }
  },
  render: (args) => {
    const EmptyMockApprovalQueue = () => {
      return React.createElement(ApprovalQueue, {
        ...args,
        approvals: [],
        isLoading: false,
        error: null,
        onRefresh: () => Promise.resolve()
      });
    };
    return React.createElement(EmptyMockApprovalQueue);
  }
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ApprovalQueue in loading state while fetching approvals.'
      }
    }
  },
  render: (args) => {
    const LoadingMockApprovalQueue = () => {
      return React.createElement(ApprovalQueue, {
        ...args,
        approvals: [],
        isLoading: true,
        error: null,
        onRefresh: () => Promise.resolve()
      });
    };
    return React.createElement(LoadingMockApprovalQueue);
  }
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ApprovalQueue showing error state when approvals fail to load.'
      }
    }
  },
  render: (args) => {
    const ErrorMockApprovalQueue = () => {
      return React.createElement(ApprovalQueue, {
        ...args,
        approvals: [],
        isLoading: false,
        error: new Error('Failed to load approvals'),
        onRefresh: () => Promise.resolve()
      });
    };
    return React.createElement(ErrorMockApprovalQueue);
  }
};

export const WithManyApprovals: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'ApprovalQueue with many pending approvals to test pagination and bulk actions.'
      }
    }
  },
  render: (args) => {
    const ManyMockApprovalQueue = () => {
      // Generate more mock data
      const manyApprovals = Array.from({ length: 25 }, (_, i) => ({
        ...mockApprovals[i % mockApprovals.length],
        id: `approval-${i + 1}`,
        userId: `user-${(i % 5) + 1}`,
        userName: `User ${(i % 5) + 1}`,
        userEmail: `user${(i % 5) + 1}@example.com`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      return React.createElement(ApprovalQueue, {
        ...args,
        approvals: manyApprovals,
        isLoading: false,
        error: null,
        onRefresh: () => Promise.resolve()
      });
    };
    return React.createElement(ManyMockApprovalQueue);
  }
};