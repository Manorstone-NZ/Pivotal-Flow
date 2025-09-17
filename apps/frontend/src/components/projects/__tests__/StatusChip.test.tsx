/**
 * StatusChip Unit Tests
 * Tests for the StatusChip component using React Testing Library
 */

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { StatusChip } from '../StatusChip';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('StatusChip', () => {
  it('renders with default props', () => {
    render(<StatusChip status="active" />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders different status variants correctly', () => {
    const { rerender } = render(<StatusChip status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();

    rerender(<StatusChip status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<StatusChip status="on-hold" />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();

    rerender(<StatusChip status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<StatusChip status="active" size="sm" />);
    expect(screen.getByText('Active')).toHaveClass('text-xs');

    rerender(<StatusChip status="active" size="md" />);
    expect(screen.getByText('Active')).toHaveClass('text-xs');

    rerender(<StatusChip status="active" size="lg" />);
    expect(screen.getByText('Active')).toHaveClass('text-sm');
  });

  it('applies custom className', () => {
    render(<StatusChip status="active" className="custom-class" />);
    
    expect(screen.getByText('Active')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<StatusChip status="active" />);
    
    const statusChip = screen.getByRole('status');
    expect(statusChip).toHaveAttribute('aria-label', 'Project is currently active and in progress');
    expect(statusChip).toHaveAttribute('title', 'Project is currently active and in progress');
  });

  it('has different aria-labels for different statuses', () => {
    const { rerender } = render(<StatusChip status="active" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Project is currently active and in progress');

    rerender(<StatusChip status="completed" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Project has been completed successfully');

    rerender(<StatusChip status="on-hold" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Project is temporarily paused or on hold');

    rerender(<StatusChip status="cancelled" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Project has been cancelled or terminated');
  });

  it('includes screen reader text', () => {
    render(<StatusChip status="active" />);
    
    expect(screen.getByText('Status:', { exact: false })).toBeInTheDocument();
  });

  it('handles unknown status gracefully', () => {
    // Suppress console.warn for this test
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { container } = render(<StatusChip status="unknown" as any />);
    
    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Unknown project status: unknown');
    
    consoleSpy.mockRestore();
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<StatusChip status="active" />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has correct CSS classes for different statuses', () => {
    const { rerender } = render(<StatusChip status="active" />);
    expect(screen.getByText('Active')).toHaveClass('bg-semantic-success/10', 'text-semantic-success');

    rerender(<StatusChip status="completed" />);
    expect(screen.getByText('Completed')).toHaveClass('bg-semantic-info/10', 'text-semantic-info');

    rerender(<StatusChip status="on-hold" />);
    expect(screen.getByText('On Hold')).toHaveClass('bg-semantic-warning/10', 'text-semantic-warning');

    rerender(<StatusChip status="cancelled" />);
    expect(screen.getByText('Cancelled')).toHaveClass('bg-semantic-error/10', 'text-semantic-error');
  });
});
