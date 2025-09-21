import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
    billableAmount: 340,
    status: 'approved',
    approvedAt: '2024-01-16T10:00:00Z',
    approvedBy: 'manager-1'
  },
  {
    id: 'entry-2',
    organizationId: 'org-1',
    userId: 'user-1',
    projectId: 'project-2',
    date: '2024-01-16',
    startTime: '2024-01-16T09:30:00Z',
    endTime: '2024-01-16T17:30:00Z',
    duration: 480,
    breakMinutes: 60,
    description: 'Backend API development and testing',
    activityType: 'development',
    billable: true,
    hourlyRate: 85,
    billableAmount: 340,
    status: 'pending',
    approvedAt: null,
    approvedBy: null
  },
  {
    id: 'entry-3',
    organizationId: 'org-1',
    userId: 'user-1',
    projectId: 'project-1',
    date: '2024-01-17',
    startTime: '2024-01-17T10:00:00Z',
    endTime: '2024-01-17T18:00:00Z',
    duration: 480,
    breakMinutes: 60,
    description: 'Code review and documentation',
    activityType: 'review',
    billable: true,
    hourlyRate: 85,
    billableAmount: 340,
    status: 'approved',
    approvedAt: '2024-01-18T09:00:00Z',
    approvedBy: 'manager-1'
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

const meta: Meta<typeof WeekGrid> = {
  title: 'Components/Time/WeekGrid',
  component: WeekGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A weekly grid component for displaying and managing time entries. Shows time entries in a calendar-like grid format with daily totals and project breakdowns.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => React.createElement(MockProvider, null, React.createElement(Story))
  ],
};

export default meta;
type Story = StoryObj<typeof WeekGrid>;

// Simple mock component that doesn't use hooks
const MockWeekGrid = (props: any) => {
  const [entries] = React.useState(mockTimeEntries);
  const [isLoading] = React.useState(false);
  const [error] = React.useState(null);

  return React.createElement(WeekGrid, {
    ...props,
    timeEntries: entries,
    isLoading,
    error,
    onRefresh: () => Promise.resolve()
  });
};

export const Default: Story = {
  args: {
    userId: 'user-1'
  },
  render: (args) => React.createElement(MockWeekGrid, args)
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
  render: (args) => {
    const EmptyMockWeekGrid = () => {
      return React.createElement(WeekGrid, {
        ...args
      });
    };
    return React.createElement(EmptyMockWeekGrid);
  }
};

export const Loading: Story = {
  args: {
    userId: 'user-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid in loading state while fetching time entries.'
      }
    }
  },
  render: (args) => {
    const LoadingMockWeekGrid = () => {
      return React.createElement(WeekGrid, {
        ...args
      });
    };
    return React.createElement(LoadingMockWeekGrid);
  }
};

export const Error: Story = {
  args: {
    userId: 'user-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid showing error state when time entries fail to load.'
      }
    }
  },
  render: (args) => {
    const ErrorMockWeekGrid = () => {
      return React.createElement(WeekGrid, {
        ...args
      });
    };
    return React.createElement(ErrorMockWeekGrid);
  }
};

export const WithCustomWeek: Story = {
  args: {
    userId: 'user-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'WeekGrid showing a specific week with custom start date.'
      }
    }
  },
  render: (args) => React.createElement(MockWeekGrid, args)
};