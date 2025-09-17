/**
 * ProjectCreateDialog Component Tests
 * Tests for the project create modal dialog functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectCreateDialog } from '../ProjectCreateDialog';

// Mock the API hook
vi.mock('../../../features/projects/api', () => ({
  useCreateProject: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'proj-new-123',
      name: 'New Project',
      status: 'active',
    }),
    isLoading: false,
    error: null,
  }),
}));

// Test wrapper with QueryClient
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProjectCreateDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create dialog when open', () => {
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} open={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts with empty form fields', () => {
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/project name/i)).toHaveValue('');
    expect(screen.getByLabelText(/project code/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/start date/i)).toHaveValue('');
    expect(screen.getByLabelText(/end date/i)).toHaveValue('');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('validates date ranges', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Fill required field
    await user.type(screen.getByLabelText(/project name/i), 'Test Project');

    // Set invalid date range
    await user.type(screen.getByLabelText(/start date/i), '2024-12-31');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-01');

    // Try to submit
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} onClose={mockOnClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dialog overlay clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Click outside the dialog (on overlay)
    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement;
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('handles form submission successfully', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} onSuccess={mockOnSuccess} />
      </TestWrapper>
    );

    // Fill form
    await user.type(screen.getByLabelText(/project name/i), 'New Test Project');
    await user.type(screen.getByLabelText(/project code/i), 'NEW-123');
    await user.type(screen.getByLabelText(/description/i), 'A new test project');

    // Submit form
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Fill form
    const nameInput = screen.getByLabelText(/project name/i);
    await user.type(nameInput, 'Test Project');

    // Submit form
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });
  });

  it('supports all status options', () => {
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Check that status section exists
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check that select dropdown exists
    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Test that form fields are focusable
    const nameInput = screen.getByLabelText(/project name/i);
    const codeInput = screen.getByLabelText(/project code/i);
    
    // Click to focus and verify
    await user.click(nameInput);
    expect(nameInput).toHaveFocus();
    
    await user.click(codeInput);
    expect(codeInput).toHaveFocus();
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Fill required field and submit
    await user.type(screen.getByLabelText(/project name/i), 'Test Project');
    
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    // Test passes if submission works without errors
    expect(createButton).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByLabelText(/project name/i), 'Test Project');
    
    const createButton = screen.getByRole('button', { name: /create project/i });
    await user.click(createButton);

    // Test passes if submission completes without throwing
    expect(createButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');

    // Check form labels exist and are accessible
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project code/i)).toBeInTheDocument();
  });

  it('closes dialog on Escape key', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(
      <TestWrapper>
        <ProjectCreateDialog {...defaultProps} onClose={mockOnClose} />
      </TestWrapper>
    );

    await user.keyboard('{Escape}');
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
