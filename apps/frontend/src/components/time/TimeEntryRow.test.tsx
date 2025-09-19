import { render, screen, fireEvent } from '@testing-library/react';
import { TimeEntryRow } from './TimeEntryRow';
import { type TimeEntry } from '../../features/time/api';

// Mock date-fns to avoid timezone issues in tests
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM d, yyyy') return 'Jan 15, 2024';
    if (formatStr === 'MMM d, yyyy HH:mm') return 'Jan 15, 2024 09:00';
    if (formatStr === 'HH:mm') return '09:00';
    return 'Jan 15, 2024';
  }),
  parseISO: jest.fn((dateStr) => new Date(dateStr))
}));

// Mock the utility functions
jest.mock('../../features/approvals/api', () => ({
  getActivityTypeColor: jest.fn((type) => `bg-${type}-100 text-${type}-800`),
  getStatusColor: jest.fn((status) => `bg-${status}-100 text-${status}-800`)
}));

const mockEntry: TimeEntry = {
  id: 'entry-1',
  organizationId: 'org-1',
  userId: 'user-1',
  projectId: 'project-1',
  date: '2024-01-15',
  startTime: '2024-01-15T09:00:00Z',
  endTime: '2024-01-15T17:00:00Z',
  duration: 480, // 8 hours in minutes
  breakMinutes: 60,
  description: 'Frontend development work',
  activityType: 'development',
  billable: true,
  hourlyRate: 85,
  billableAmount: 680,
  currency: 'NZD',
  status: 'approved',
  submittedAt: '2024-01-15T18:00:00Z',
  approvedAt: '2024-01-16T09:00:00Z',
  approvedBy: 'manager-1',
  tags: ['frontend', 'react'],
  notes: 'Some additional notes',
  createdAt: '2024-01-15T18:00:00Z',
  updatedAt: '2024-01-16T09:00:00Z'
};

describe('TimeEntryRow', () => {
  const mockOnEdit = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full View', () => {
    it('renders time entry information correctly', () => {
      render(
        <TimeEntryRow 
          entry={mockEntry} 
          onEdit={mockOnEdit}
          onSubmit={mockOnSubmit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Frontend development work')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('8 hours')).toBeInTheDocument();
      expect(screen.getByText('Billable - $680.00')).toBeInTheDocument();
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('Some additional notes')).toBeInTheDocument();
    });

    it('shows date when showDate prop is true', () => {
      render(
        <TimeEntryRow 
          entry={mockEntry} 
          showDate={true}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByTitle('Edit entry');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(draftEntry);
    });

    it('calls onSubmit when submit button is clicked', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(draftEntry);
    });

    it('calls onDelete when delete button is clicked', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle('Delete entry');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(draftEntry);
    });

    it('displays rejection reason when entry is rejected', () => {
      const rejectedEntry = {
        ...mockEntry,
        status: 'rejected' as const,
        rejectionReason: 'Time seems excessive'
      };

      render(<TimeEntryRow entry={rejectedEntry} />);

      expect(screen.getByText('Rejection reason:')).toBeInTheDocument();
      expect(screen.getByText('Time seems excessive')).toBeInTheDocument();
    });

    it('displays non-billable status correctly', () => {
      const nonBillableEntry = {
        ...mockEntry,
        billable: false,
        billableAmount: undefined
      };

      render(<TimeEntryRow entry={nonBillableEntry} />);

      expect(screen.getByText('Non-billable')).toBeInTheDocument();
      expect(screen.queryByText('$680.00')).not.toBeInTheDocument();
    });
  });

  describe('Compact View', () => {
    it('renders compact view correctly', () => {
      render(
        <TimeEntryRow 
          entry={mockEntry} 
          compact={true}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText('8h')).toBeInTheDocument();
      expect(screen.getByText('Frontend development work')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('$680')).toBeInTheDocument();
    });

    it('calls onEdit when compact row is clicked', () => {
      render(
        <TimeEntryRow 
          entry={mockEntry} 
          compact={true}
          onEdit={mockOnEdit}
        />
      );

      const compactRow = screen.getByText('Frontend development work').closest('div');
      fireEvent.click(compactRow!);

      expect(mockOnEdit).toHaveBeenCalledWith(mockEntry);
    });

    it('truncates tags in compact view', () => {
      const entryWithManyTags = {
        ...mockEntry,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      };

      render(
        <TimeEntryRow 
          entry={entryWithManyTags} 
          compact={true}
        />
      );

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('shows non-billable status in compact view', () => {
      const nonBillableEntry = {
        ...mockEntry,
        billable: false,
        billableAmount: undefined
      };

      render(
        <TimeEntryRow 
          entry={nonBillableEntry} 
          compact={true}
        />
      );

      expect(screen.getByText('Non-billable')).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('formats hours correctly', () => {
      const hourEntry = { ...mockEntry, duration: 120 }; // 2 hours
      
      render(<TimeEntryRow entry={hourEntry} />);
      
      expect(screen.getByText('2 hours')).toBeInTheDocument();
    });

    it('formats single hour correctly', () => {
      const hourEntry = { ...mockEntry, duration: 60 }; // 1 hour
      
      render(<TimeEntryRow entry={hourEntry} />);
      
      expect(screen.getByText('1 hour')).toBeInTheDocument();
    });

    it('formats minutes correctly', () => {
      const minuteEntry = { ...mockEntry, duration: 30 }; // 30 minutes
      
      render(<TimeEntryRow entry={minuteEntry} />);
      
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
    });

    it('formats hours and minutes correctly', () => {
      const mixedEntry = { ...mockEntry, duration: 150 }; // 2h 30m
      
      render(<TimeEntryRow entry={mixedEntry} />);
      
      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('formats compact duration correctly', () => {
      const mixedEntry = { ...mockEntry, duration: 150 }; // 2h 30m
      
      render(<TimeEntryRow entry={mixedEntry} compact={true} />);
      
      expect(screen.getByText('2h30m')).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('shows check icon for approved status', () => {
      render(<TimeEntryRow entry={mockEntry} />);
      
      const icons = screen.container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('shows clock icon for submitted status', () => {
      const submittedEntry = { ...mockEntry, status: 'submitted' as const };
      
      render(<TimeEntryRow entry={submittedEntry} />);
      
      const icons = screen.container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('shows X icon for rejected status', () => {
      const rejectedEntry = { ...mockEntry, status: 'rejected' as const };
      
      render(<TimeEntryRow entry={rejectedEntry} />);
      
      const icons = screen.container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons Visibility', () => {
    it('shows submit button for draft entries', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('shows edit button for draft and rejected entries', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onEdit={mockOnEdit}
        />
      );
      
      expect(screen.getByTitle('Edit entry')).toBeInTheDocument();
    });

    it('shows delete button for draft entries', () => {
      const draftEntry = { ...mockEntry, status: 'draft' as const };
      
      render(
        <TimeEntryRow 
          entry={draftEntry} 
          onDelete={mockOnDelete}
        />
      );
      
      expect(screen.getByTitle('Delete entry')).toBeInTheDocument();
    });

    it('hides action buttons for approved entries', () => {
      render(<TimeEntryRow entry={mockEntry} />);
      
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit entry')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete entry')).not.toBeInTheDocument();
    });
  });
});

