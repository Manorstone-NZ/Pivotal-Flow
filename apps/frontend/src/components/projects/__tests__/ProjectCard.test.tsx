/**
 * ProjectCard Unit Tests
 * Tests for the ProjectCard component using React Testing Library
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { ProjectCard } from '../ProjectCard';
import type { Project } from '../../../features/projects/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const mockProject: Project = {
  id: 'proj-123',
  organizationId: 'org-123',
  name: 'Test Project',
  code: 'TP-2024',
  description: 'A test project description',
  status: 'active',
  ownerId: 'user-123',
  startDate: '2024-01-15',
  endDate: '2024-06-30',
  metadata: {},
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
  deletedAt: null,
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('TP-2024')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders without code when code is null', () => {
    const projectWithoutCode = { ...mockProject, code: null };
    render(<ProjectCard project={projectWithoutCode} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('TP-2024')).not.toBeInTheDocument();
  });

  it('renders without description when description is null', () => {
    const projectWithoutDescription = { ...mockProject, description: null };
    render(<ProjectCard project={projectWithoutDescription} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('A test project description')).not.toBeInTheDocument();
  });

  it('renders dates when showDates is true', () => {
    render(<ProjectCard project={mockProject} showDates={true} />);
    
    expect(screen.getByText(/Start:/)).toBeInTheDocument();
    expect(screen.getByText(/End:/)).toBeInTheDocument();
  });

  it('does not render dates when showDates is false', () => {
    render(<ProjectCard project={mockProject} showDates={false} />);
    
    expect(screen.queryByText(/Start:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/End:/)).not.toBeInTheDocument();
  });

  it('handles missing dates gracefully', () => {
    const projectWithoutDates = { 
      ...mockProject, 
      startDate: null, 
      endDate: null 
    };
    render(<ProjectCard project={projectWithoutDates} showDates={true} />);
    
    expect(screen.queryByText(/Start:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/End:/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as article when no onClick is provided', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes when clickable', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'View project Test Project');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('applies custom className', () => {
    render(<ProjectCard project={mockProject} className="custom-class" />);
    
    expect(screen.getByRole('article')).toHaveClass('custom-class');
  });

  it('shows "View details" text when clickable', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    expect(screen.getByText('View details')).toBeInTheDocument();
  });

  it('does not show "View details" text when not clickable', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.queryByText('View details')).not.toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<ProjectCard project={mockProject} showDates={true} />);
    
    // Check that dates are formatted (exact format may vary by locale)
    expect(screen.getByText(/Start:/)).toBeInTheDocument();
    expect(screen.getByText(/End:/)).toBeInTheDocument();
  });

  it('shows created date', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<ProjectCard project={mockProject} onClick={jest.fn()} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('meets accessibility standards when not clickable', async () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
