/**
 * ProjectTable Storybook Stories
 * Stories for the ProjectTable component with controls and accessibility checks
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProjectTable } from './ProjectTable';
import type { Project, ProjectFilters } from '../../features/projects/types';

// Mock project data
const mockProjects: Project[] = [
  {
    id: 'proj-123',
    organizationId: 'org-123',
    name: 'Website Redesign Project',
    code: 'WR-2024',
    description: 'Complete redesign of the company website with modern UI/UX principles.',
    status: 'active',
    ownerId: 'user-123',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    metadata: {},
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    deletedAt: null,
  },
  {
    id: 'proj-124',
    organizationId: 'org-123',
    name: 'Mobile App Development',
    code: 'MAD-2024',
    description: 'Development of a new mobile application for iOS and Android.',
    status: 'completed',
    ownerId: 'user-124',
    startDate: '2023-10-01',
    endDate: '2024-03-15',
    metadata: {},
    createdAt: '2023-09-15T09:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z',
    deletedAt: null,
  },
  {
    id: 'proj-125',
    organizationId: 'org-123',
    name: 'E-commerce Platform',
    code: 'EC-2024',
    description: 'Development of a new e-commerce platform with advanced features.',
    status: 'on-hold',
    ownerId: 'user-125',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    metadata: {},
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-02-15T13:00:00Z',
    deletedAt: null,
  },
  {
    id: 'proj-126',
    organizationId: 'org-123',
    name: 'Legacy System Migration',
    code: 'LSM-2024',
    description: 'Migration of legacy systems to modern cloud infrastructure.',
    status: 'cancelled',
    ownerId: 'user-126',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    metadata: {},
    createdAt: '2023-12-15T08:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'proj-127',
    organizationId: 'org-123',
    name: 'Data Analytics Dashboard',
    code: 'DAD-2024',
    description: 'Creation of a comprehensive data analytics dashboard for business insights.',
    status: 'active',
    ownerId: 'user-127',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    metadata: {},
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
    deletedAt: null,
  },
];

const mockFilters: ProjectFilters = {
  page: 1,
  size: 25,
  sort: 'createdAt',
  sortOrder: 'desc',
};

const meta: Meta<typeof ProjectTable> = {
  title: 'Projects/ProjectTable',
  component: ProjectTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A data table component that displays projects with sorting, filtering, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    projects: {
      description: 'Array of project data to display',
    },
    filters: {
      description: 'Current filter and sort state',
    },
    onSort: {
      action: 'sorted',
      description: 'Callback function when a column header is clicked for sorting',
    },
    onProjectClick: {
      action: 'project-clicked',
      description: 'Callback function when a project row is clicked',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the table is in a loading state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectTable>;

// Default story
export const Default: Story = {
  args: {
    projects: mockProjects,
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    projects: [],
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: true,
  },
};

// Empty state
export const Empty: Story = {
  args: {
    projects: [],
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Sorted by name ascending
export const SortedByNameAsc: Story = {
  args: {
    projects: mockProjects,
    filters: {
      ...mockFilters,
      sort: 'name',
      sortOrder: 'asc',
    },
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Sorted by status descending
export const SortedByStatusDesc: Story = {
  args: {
    projects: mockProjects,
    filters: {
      ...mockFilters,
      sort: 'status',
      sortOrder: 'desc',
    },
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Many projects (scrollable)
export const ManyProjects: Story = {
  args: {
    projects: mockProjects.concat(mockProjects).concat(mockProjects), // 15 projects
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Projects without codes
export const WithoutCodes: Story = {
  args: {
    projects: mockProjects.map(project => ({ ...project, code: null })),
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};

// Projects without dates
export const WithoutDates: Story = {
  args: {
    projects: mockProjects.map(project => ({ 
      ...project, 
      startDate: null, 
      endDate: null 
    })),
    filters: mockFilters,
    onSort: (field: string) => console.log('Sort by:', field),
    onProjectClick: (project: Project) => console.log('Project clicked:', project.name),
    isLoading: false,
  },
};
