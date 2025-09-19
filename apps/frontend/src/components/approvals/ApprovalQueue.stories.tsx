import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovalQueue } from './ApprovalQueue';

// Mock data for stories
const mockApprovalItems = [
  {
    id: 'approval-1',
    userId: 'user-1',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    projectId: 'project-1',
    projectName: 'Client Dashboard',
    date: '2024-01-15',
    duration: 480, // 8 hours
    description: 'Frontend development work on user dashboard components and responsive design',
    activityType: 'development',
    billable: true,
    billableAmount: 680,
    submittedAt: '2024-01-15T18:00:00Z',
    createdAt: '2024-01-15T18:00:00Z',
    tags: ['frontend', 'react', 'dashboard'],
    notes: 'Implemented new dashboard layout with responsive design. Added comprehensive unit tests.'
  },
  {
    id: 'approval-2',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    projectId: 'project-2',
    projectName: 'API Integration',
    date: '2024-01-16',
    duration: 240, // 4 hours
    description: 'Client meeting and requirements gathering session',
    activityType: 'meeting',
    billable: true,
    billableAmount: 340,
    submittedAt: '2024-01-16T17:00:00Z',
    createdAt: '2024-01-16T17:00:00Z',
    tags: ['client', 'requirements']
  },
  {
    id: 'approval-3',
    userId: 'user-3',
    userName: 'Mike Davis',
    userEmail: 'mike.davis@company.com',
    date: '2024-01-17',
    duration: 120, // 2 hours
    description: 'Internal team standup and sprint planning',
    activityType: 'admin',
    billable: false,
    submittedAt: '2024-01-17T10:00:00Z',
    createdAt: '2024-01-17T10:00:00Z',
    tags: ['admin', 'planning']
  },
  {
    id: 'approval-4',
    userId: 'user-1',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    projectId: 'project-3',
    projectName: 'Mobile App',
    date: '2024-01-18',
    duration: 360, // 6 hours
    description: 'Backend API development and database optimization',
    activityType: 'development',
    billable: true,
    billableAmount: 510,
    submittedAt: '2024-01-18T16:30:00Z',
    createdAt: '2024-01-18T16:30:00Z',
    tags: ['backend', 'api', 'database'],
    notes: 'Optimized database queries and implemented new API endpoints for mobile app.'
  },
  {
    id: 'approval-5',
    userId: 'user-4',
    userName: 'Lisa Chen',
    userEmail: 'lisa.chen@company.com',
    projectId: 'project-1',
    projectName: 'Client Dashboard',
    date: '2024-01-19',
    duration: 180, // 3 hours
    description: 'Code review and testing of dashboard components',
    activityType: 'testing',
    billable: true,
    billableAmount: 255,
    submittedAt: '2024-01-19T14:15:00Z',
    createdAt: '2024-01-19T14:15:00Z',
    tags: ['testing', 'code-review']
  }
];

// Mock the API hooks
const mockUseTimeApprovals = (isEmpty = false, isLoading = false, hasError = false) => ({
  data: hasError ? undefined : {
    success: true,
    data: isEmpty ? [] : mockApprovalItems,
    pagination: { 
      page: 1, 
      limit: 20, 
      total: isEmpty ? 0 : mockApprovalItems.length, 
      pages: 1 
    }
  },
  isLoading,
  error: hasError ? new Error('Failed to load approvals') : null,
  refetch: () => Promise.resolve()
});

const mockMutations = {
  mutateAsync: async () => ({ success: true, data: { message: 'Success' } }),
  isPending: false,
  isError: false,
  error: null
};

// Create a wrapper component that provides QueryClient
const QueryWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const meta: Meta<typeof ApprovalQueue> = {
  title: 'Components/Approvals/ApprovalQueue',
  component: ApprovalQueue,
  decorators: [
    (Story) => (
      <QueryWrapper>
        <div className="p-6 bg-gray-50 min-h-screen">
          <Story />
        </div>
      </QueryWrapper>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A queue component for managing time entry approvals with bulk actions and individual decision making.'
      }
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ApprovalQueue>;

// Mock the hooks before defining stories
jest.mock('../../features/approvals/api', () => ({
  ...jest.requireActual('../../features/approvals/api'),
  useTimeApprovals: () => mockUseTimeApprovals(),
  useApproveTimeEntry: () => mockMutations,
  useRejectTimeEntry: () => mockMutations,
  useBulkApproveTimeEntries: () => mockMutations,
  useBulkRejectTimeEntries: () => mockMutations,
  formatDuration: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  },
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  getActivityTypeColor: (type: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      admin: 'bg-gray-100 text-gray-800',
      testing: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }
}));

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default approval queue with pending time entries.'
      }
    }
  }
};

export const EmptyQueue: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Approval queue with no pending entries.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      jest.doMock('../../features/approvals/api', () => ({
        ...jest.requireActual('../../features/approvals/api'),
        useTimeApprovals: () => mockUseTimeApprovals(true),
        useApproveTimeEntry: () => mockMutations,
        useRejectTimeEntry: () => mockMutations,
        useBulkApproveTimeEntries: () => mockMutations,
        useBulkRejectTimeEntries: () => mockMutations,
        formatDuration: (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours === 0) return `${mins}m`;
          if (mins === 0) return `${hours}h`;
          return `${hours}h ${mins}m`;
        },
        formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
        getActivityTypeColor: (type: string) => 'bg-blue-100 text-blue-800'
      }));
      
      return (
        <QueryWrapper>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </QueryWrapper>
      );
    }
  ]
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Approval queue in loading state.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      jest.doMock('../../features/approvals/api', () => ({
        ...jest.requireActual('../../features/approvals/api'),
        useTimeApprovals: () => mockUseTimeApprovals(false, true),
        useApproveTimeEntry: () => mockMutations,
        useRejectTimeEntry: () => mockMutations,
        useBulkApproveTimeEntries: () => mockMutations,
        useBulkRejectTimeEntries: () => mockMutations,
        formatDuration: (minutes: number) => `${minutes}m`,
        formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
        getActivityTypeColor: (type: string) => 'bg-blue-100 text-blue-800'
      }));
      
      return (
        <QueryWrapper>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </QueryWrapper>
      );
    }
  ]
};

export const WithError: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Approval queue with error state.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      jest.doMock('../../features/approvals/api', () => ({
        ...jest.requireActual('../../features/approvals/api'),
        useTimeApprovals: () => mockUseTimeApprovals(false, false, true),
        useApproveTimeEntry: () => mockMutations,
        useRejectTimeEntry: () => mockMutations,
        useBulkApproveTimeEntries: () => mockMutations,
        useBulkRejectTimeEntries: () => mockMutations,
        formatDuration: (minutes: number) => `${minutes}m`,
        formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
        getActivityTypeColor: (type: string) => 'bg-blue-100 text-blue-800'
      }));
      
      return (
        <QueryWrapper>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </QueryWrapper>
      );
    }
  ]
};

export const WithPendingActions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Approval queue with pending mutation states (approve/reject in progress).'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      const pendingMutations = {
        mutateAsync: async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { success: true, data: { message: 'Success' } };
        },
        isPending: true,
        isError: false,
        error: null
      };
      
      jest.doMock('../../features/approvals/api', () => ({
        ...jest.requireActual('../../features/approvals/api'),
        useTimeApprovals: () => mockUseTimeApprovals(),
        useApproveTimeEntry: () => pendingMutations,
        useRejectTimeEntry: () => pendingMutations,
        useBulkApproveTimeEntries: () => pendingMutations,
        useBulkRejectTimeEntries: () => pendingMutations,
        formatDuration: (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours === 0) return `${mins}m`;
          if (mins === 0) return `${hours}h`;
          return `${hours}h ${mins}m`;
        },
        formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
        getActivityTypeColor: (type: string) => 'bg-blue-100 text-blue-800'
      }));
      
      return (
        <QueryWrapper>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </QueryWrapper>
      );
    }
  ]
};

