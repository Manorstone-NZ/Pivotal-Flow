import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeEntryRow } from './TimeEntryRow';
import { type TimeEntry } from '../../features/time/api';

// Mock time entry data
const baseEntry: TimeEntry = {
  id: 'entry-1',
  organizationId: 'org-1',
  userId: 'user-1',
  projectId: 'project-1',
  date: '2024-01-15',
  startTime: '2024-01-15T09:00:00Z',
  endTime: '2024-01-15T17:00:00Z',
  duration: 480, // 8 hours in minutes
  breakMinutes: 60,
  description: 'Frontend development work on user dashboard components',
  activityType: 'development',
  billable: true,
  hourlyRate: 85,
  billableAmount: 680,
  currency: 'NZD',
  status: 'approved',
  submittedAt: '2024-01-15T18:00:00Z',
  approvedAt: '2024-01-16T09:00:00Z',
  approvedBy: 'manager-1',
  tags: ['frontend', 'react', 'dashboard'],
  notes: 'Implemented new dashboard layout and responsive design. Added unit tests for all components.',
  createdAt: '2024-01-15T18:00:00Z',
  updatedAt: '2024-01-16T09:00:00Z'
};

const meta: Meta<typeof TimeEntryRow> = {
  title: 'Components/Time/TimeEntryRow',
  component: TimeEntryRow,
  decorators: [
    (Story) => (
      <div className="p-6 bg-gray-50 max-w-4xl">
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        component: 'A component for displaying time entry information in both compact and full view modes.'
      }
    }
  },
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Whether to show compact view (for week grid) or full view'
    },
    showDate: {
      control: 'boolean',
      description: 'Whether to show the date in full view'
    },
    onEdit: {
      action: 'edit',
      description: 'Callback when edit button is clicked'
    },
    onSubmit: {
      action: 'submit',
      description: 'Callback when submit button is clicked'
    },
    onDelete: {
      action: 'delete',
      description: 'Callback when delete button is clicked'
    }
  }
};

export default meta;
type Story = StoryObj<typeof TimeEntryRow>;

export const FullViewApproved: Story = {
  args: {
    entry: baseEntry,
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Full view of an approved time entry with all details visible.'
      }
    }
  }
};

export const CompactView: Story = {
  args: {
    entry: baseEntry,
    compact: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact view suitable for use in the weekly grid.'
      }
    }
  }
};

export const DraftEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-draft',
      status: 'draft',
      submittedAt: undefined,
      approvedAt: undefined,
      approvedBy: undefined
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A draft time entry that can be edited or submitted.'
      }
    }
  }
};

export const SubmittedEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-submitted',
      status: 'submitted',
      approvedAt: undefined,
      approvedBy: undefined
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A submitted time entry awaiting approval.'
      }
    }
  }
};

export const RejectedEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-rejected',
      status: 'rejected',
      approvedAt: undefined,
      approvedBy: undefined,
      rejectedAt: '2024-01-16T10:00:00Z',
      rejectedBy: 'manager-1',
      rejectionReason: 'Time allocation seems excessive for the described work. Please provide more detail or reduce hours.'
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A rejected time entry with rejection reason displayed.'
      }
    }
  }
};

export const NonBillableEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-nonbillable',
      billable: false,
      hourlyRate: undefined,
      billableAmount: undefined,
      activityType: 'admin',
      description: 'Team standup meeting and sprint planning',
      tags: ['admin', 'meeting', 'planning']
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A non-billable time entry for administrative work.'
      }
    }
  }
};

export const ShortEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-short',
      duration: 30, // 30 minutes
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T14:30:00Z',
      breakMinutes: 0,
      description: 'Quick bug fix',
      activityType: 'development',
      billableAmount: 42.50,
      tags: ['bugfix']
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A short time entry with minimal duration.'
      }
    }
  }
};

export const MeetingEntry: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'entry-meeting',
      duration: 120, // 2 hours
      activityType: 'meeting',
      description: 'Client requirements gathering and project kickoff meeting',
      tags: ['client', 'requirements', 'kickoff'],
      notes: 'Discussed project scope, timeline, and deliverables. Client approved initial wireframes.'
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A meeting time entry with client interaction.'
      }
    }
  }
};

export const CompactWithLongDescription: Story = {
  args: {
    entry: {
      ...baseEntry,
      description: 'Very long description that should be truncated in compact view to demonstrate how the component handles overflow text and maintains proper layout even with extensive content that would normally break the design'
    },
    compact: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact view with long description showing text truncation.'
      }
    }
  }
};

export const WithoutTimeRange: Story = {
  args: {
    entry: {
      ...baseEntry,
      startTime: undefined,
      endTime: undefined
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Time entry without start/end times, showing only duration.'
      }
    }
  }
};

export const WithManyTags: Story = {
  args: {
    entry: {
      ...baseEntry,
      tags: ['frontend', 'react', 'typescript', 'testing', 'responsive', 'accessibility', 'performance', 'documentation']
    },
    compact: false,
    showDate: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Time entry with many tags to show tag display behavior.'
      }
    }
  }
};

export const CompactWithManyTags: Story = {
  args: {
    entry: {
      ...baseEntry,
      tags: ['frontend', 'react', 'typescript', 'testing', 'responsive', 'accessibility', 'performance', 'documentation']
    },
    compact: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact view with many tags showing tag truncation.'
      }
    }
  }
};

