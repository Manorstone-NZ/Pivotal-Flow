import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeekGrid } from './WeekGrid';

// Mock data for stories
const mockTimeEntries = [
  {
    id: 'entry-1',
    organizationId: 'org-1',
    userId: 'user-1',
    projectId: 'project-1',
    date: '2024-01-15',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    duration: 480, // 8 hours in minutes
    breakMinutes: 60,
    description: 'Frontend development work on user dashboard',
    activityType: 'development',
    billable: true,
    hourlyRate: 85,
    billableAmount: 680,
    currency: 'NZD',
    status: 'approved' as const,
    submittedAt: '2024-01-15T18:00:00Z',
    approvedAt: '2024-01-16T09:00:00Z',
    approvedBy: 'manager-1',
    tags: ['frontend', 'react', 'dashboard'],
    createdAt: '2024-01-15T18:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: 'entry-2',
    organizationId: 'org-1',
    userId: 'user-1',
    projectId: 'project-2',
    date: '2024-01-16',
    duration: 240, // 4 hours
    breakMinutes: 30,
    description: 'Client meeting and requirements gathering',
    activityType: 'meeting',
    billable: true,
    hourlyRate: 85,
    billableAmount: 340,
    currency: 'NZD',
    status: 'submitted' as const,
    submittedAt: '2024-01-16T17:00:00Z',
    createdAt: '2024-01-16T17:00:00Z',
    updatedAt: '2024-01-16T17:00:00Z'
  },
  {
    id: 'entry-3',
    organizationId: 'org-1',
    userId: 'user-1',
    date: '2024-01-17',
    duration: 120, // 2 hours
    breakMinutes: 0,
    description: 'Internal team standup and planning',
    activityType: 'admin',
    billable: false,
    currency: 'NZD',
    status: 'draft' as const,
    tags: ['admin', 'planning'],
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z'
  }
];

// Mock the API hooks
const mockUseTimeEntries = () => ({
  data: {
    success: true,
    data: mockTimeEntries,
    pagination: { page: 1, limit: 100, total: mockTimeEntries.length, pages: 1 }
  },
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve()
});

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

const meta: Meta<typeof WeekGrid> = {
  title: 'Components/Time/WeekGrid',
  component: WeekGrid,
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
        component: 'A weekly time tracking grid that displays time entries in a calendar format with copy/paste functionality and quick totals.'
      }
    }
  },
  argTypes: {
    userId: {
      control: 'text',
      description: 'User ID to filter entries for'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof WeekGrid>;

// Mock the hooks before defining stories
jest.mock('../../features/time/api', () => ({
  ...jest.requireActual('../../features/time/api'),
  useTimeEntries: () => mockUseTimeEntries(),
  useTimeEntryTotals: (entries: any[]) => ({
    totalMinutes: entries.reduce((sum, entry) => sum + entry.duration, 0),
    billableMinutes: entries.reduce((sum, entry) => sum + (entry.billable ? entry.duration : 0), 0),
    nonBillableMinutes: entries.reduce((sum, entry) => sum + (entry.billable ? 0 : entry.duration), 0),
    totalAmount: entries.reduce((sum, entry) => sum + (entry.billableAmount || 0), 0),
    totalHours: entries.reduce((sum, entry) => sum + entry.duration, 0) / 60,
    billableHours: entries.reduce((sum, entry) => sum + (entry.billable ? entry.duration : 0), 0) / 60,
    nonBillableHours: entries.reduce((sum, entry) => sum + (entry.billable ? 0 : entry.duration), 0) / 60
  })
}));

export const Default: Story = {
  args: {
    userId: 'user-1'
  }
};

export const WithCallbacks: Story = {
  args: {
    userId: 'user-1',
    onAddEntry: (date: string) => {
      console.log('Add entry for date:', date);
      alert(`Add entry for ${date}`);
    },
    onEditEntry: (entry: any) => {
      console.log('Edit entry:', entry);
      alert(`Edit entry: ${entry.description}`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid with callback functions for adding and editing entries.'
      }
    }
  }
};

export const EmptyWeek: Story = {
  args: {
    userId: 'empty-user'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid with no time entries, showing empty state.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      const emptyMock = () => ({
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 100, total: 0, pages: 1 }
        },
        isLoading: false,
        error: null,
        refetch: () => Promise.resolve()
      });
      
      jest.doMock('../../features/time/api', () => ({
        ...jest.requireActual('../../features/time/api'),
        useTimeEntries: emptyMock,
        useTimeEntryTotals: () => ({
          totalMinutes: 0,
          billableMinutes: 0,
          nonBillableMinutes: 0,
          totalAmount: 0,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0
        })
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
  args: {
    userId: 'user-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid in loading state.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      const loadingMock = () => ({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: () => Promise.resolve()
      });
      
      jest.doMock('../../features/time/api', () => ({
        ...jest.requireActual('../../features/time/api'),
        useTimeEntries: loadingMock,
        useTimeEntryTotals: () => ({
          totalMinutes: 0,
          billableMinutes: 0,
          nonBillableMinutes: 0,
          totalAmount: 0,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0
        })
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
  args: {
    userId: 'user-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid with error state.'
      }
    }
  },
  decorators: [
    (Story) => {
      // Override the mock for this story
      const errorMock = () => ({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load time entries'),
        refetch: () => Promise.resolve()
      });
      
      jest.doMock('../../features/time/api', () => ({
        ...jest.requireActual('../../features/time/api'),
        useTimeEntries: errorMock,
        useTimeEntryTotals: () => ({
          totalMinutes: 0,
          billableMinutes: 0,
          nonBillableMinutes: 0,
          totalAmount: 0,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0
        })
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

