/**
 * ProjectTable Unit Tests
 * Tests for the ProjectTable component using React Testing Library
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { ProjectTable } from '../ProjectTable';
import type { Project, ProjectFilters } from '../../../features/projects/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    organizationId: 'org-123',
    name: 'Project One',
    code: 'P1-2024',
    description: 'First project',
    status: 'active',
    ownerId: 'user-1',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    metadata: {},
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    deletedAt: null,
  },
  {
    id: 'proj-2',
    organizationId: 'org-123',
    name: 'Project Two',
    code: 'P2-2024',
    description: 'Second project',
    status: 'completed',
    ownerId: 'user-2',
    startDate: '2023-10-01',
    endDate: '2024-03-15',
    metadata: {},
    createdAt: '2023-09-15T09:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z',
    deletedAt: null,
  },
];

const mockFilters: ProjectFilters = {
  page: 1,
  size: 25,
  sort: 'createdAt',
  sortOrder: 'desc',
};

describe('ProjectTable', () => {
  const defaultProps = {
    projects: mockProjects,
    filters: mockFilters,
    onSort: vi.fn(),
    onProjectClick: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with projects', () => {
    render(<ProjectTable {...defaultProps} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<ProjectTable {...defaultProps} />);
    
    expect(screen.getByRole('columnheader', { name: /sort by name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /sort by status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /sort by start date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /sort by end date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /sort by created/i })).toBeInTheDocument();
  });

  it('shows sort indicators for active sort', () => {
    const filtersWithSort = { ...mockFilters, sort: 'name', sortOrder: 'asc' as const };
    render(<ProjectTable {...defaultProps} filters={filtersWithSort} />);
    
    const nameHeader = screen.getByRole('columnheader', { name: /sort by name/i });
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('calls onSort when header is clicked', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const nameHeader = screen.getByRole('columnheader', { name: /sort by name/i });
    fireEvent.click(nameHeader);
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('name');
  });

  it('calls onSort when header is activated with Enter key', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const nameHeader = screen.getByRole('columnheader', { name: /sort by name/i });
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('name');
  });

  it('calls onSort when header is activated with Space key', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const nameHeader = screen.getByRole('columnheader', { name: /sort by name/i });
    fireEvent.keyDown(nameHeader, { key: ' ' });
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('name');
  });

  it('calls onProjectClick when project row is clicked', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const projectRow = screen.getByRole('row', { name: /project one/i });
    fireEvent.click(projectRow);
    
    expect(defaultProps.onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('calls onProjectClick when project row is activated with Enter key', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const projectRow = screen.getByRole('row', { name: /project one/i });
    fireEvent.keyDown(projectRow, { key: 'Enter' });
    
    expect(defaultProps.onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('calls onProjectClick when project row is activated with Space key', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const projectRow = screen.getByRole('row', { name: /project one/i });
    fireEvent.keyDown(projectRow, { key: ' ' });
    
    expect(defaultProps.onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('renders loading state', () => {
    const { container } = render(<ProjectTable {...defaultProps} isLoading={true} />);
    
    // Loading skeleton should be present (check for animate-pulse class)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no projects', () => {
    render(<ProjectTable {...defaultProps} projects={[]} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Project One')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Two')).not.toBeInTheDocument();
  });

  it('renders project codes when available', () => {
    render(<ProjectTable {...defaultProps} />);
    
    expect(screen.getByText('P1-2024')).toBeInTheDocument();
    expect(screen.getByText('P2-2024')).toBeInTheDocument();
  });

  it('handles projects without codes', () => {
    const projectsWithoutCodes = mockProjects.map(p => ({ ...p, code: null }));
    render(<ProjectTable {...defaultProps} projects={projectsWithoutCodes} />);
    
    expect(screen.queryByText('P1-2024')).not.toBeInTheDocument();
    expect(screen.queryByText('P2-2024')).not.toBeInTheDocument();
  });

  it('handles projects without dates', () => {
    const projectsWithoutDates = mockProjects.map(p => ({ 
      ...p, 
      startDate: null, 
      endDate: null 
    }));
    render(<ProjectTable {...defaultProps} projects={projectsWithoutDates} />);
    
    // Should show dashes for missing dates
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(4); // 2 projects × 2 date columns
  });

  it('formats dates correctly', () => {
    render(<ProjectTable {...defaultProps} />);
    
    // Dates should be formatted (exact format may vary by locale)
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument(); // Start date
    expect(screen.getByText(/6\/30\/2024/)).toBeInTheDocument(); // End date
  });

  it('applies custom className', () => {
    render(<ProjectTable {...defaultProps} className="custom-class" />);
    
    expect(screen.getByRole('table').closest('.custom-class')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Projects table');
    
    const rows = screen.getAllByRole('row');
    expect(rows[0]).toHaveAttribute('role', 'row'); // Header row
  });

  it('has proper row accessibility attributes', () => {
    render(<ProjectTable {...defaultProps} />);
    
    const projectRow = screen.getByRole('row', { name: /project one/i });
    expect(projectRow).toHaveAttribute('aria-label', 'Project Project One, status active');
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<ProjectTable {...defaultProps} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('meets accessibility standards in loading state', async () => {
    const { container } = render(<ProjectTable {...defaultProps} isLoading={true} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
