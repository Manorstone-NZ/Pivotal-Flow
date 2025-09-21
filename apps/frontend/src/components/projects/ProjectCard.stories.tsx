/**
 * ProjectCard Storybook Stories
 * Stories for the ProjectCard component with controls and accessibility checks
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../../features/projects/types';

// Mock project data
const mockProject: Project = {
  id: 'proj-123',
  organizationId: 'org-123',
  name: 'Website Redesign Project',
  code: 'WR-2024',
  description: 'Complete redesign of the company website with modern UI/UX principles and improved accessibility.',
  status: 'active',
  ownerId: 'user-123',
  startDate: '2024-01-15',
  endDate: '2024-06-30',
  metadata: {
    priority: 'high',
    budget: 50000,
    team: ['designer', 'developer', 'pm']
  },
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
  deletedAt: null,
};

const completedProject: Project = {
  ...mockProject,
  id: 'proj-124',
  name: 'Mobile App Development',
  code: 'MAD-2024',
  status: 'completed',
  endDate: '2024-03-15',
};

const onHoldProject: Project = {
  ...mockProject,
  id: 'proj-125',
  name: 'E-commerce Platform',
  code: 'EC-2024',
  status: 'on-hold',
  description: 'Development of a new e-commerce platform. Currently paused due to budget constraints.',
};

const cancelledProject: Project = {
  ...mockProject,
  id: 'proj-126',
  name: 'Legacy System Migration',
  code: 'LSM-2024',
  status: 'cancelled',
  description: 'Migration of legacy systems to modern infrastructure. Cancelled due to technical complexity.',
};

const meta: Meta<typeof ProjectCard> = {
  title: 'Projects/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A project card component that displays project information in a card format with modern design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    project: {
      description: 'The project data to display',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function when the card is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
    showDates: {
      control: 'boolean',
      description: 'Whether to show start and end dates',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

// Default story
export const Default: Story = {
  args: {
    project: mockProject,
    onClick: () => console.log('Project clicked'),
  },
};

// Different status variants
export const Active: Story = {
  args: {
    project: mockProject,
    onClick: () => console.log('Active project clicked'),
  },
};

export const Completed: Story = {
  args: {
    project: completedProject,
    onClick: () => console.log('Completed project clicked'),
  },
};

export const OnHold: Story = {
  args: {
    project: onHoldProject,
    onClick: () => console.log('On-hold project clicked'),
  },
};

export const Cancelled: Story = {
  args: {
    project: cancelledProject,
    onClick: () => console.log('Cancelled project clicked'),
  },
};

// Without click handler (read-only)
export const ReadOnly: Story = {
  args: {
    project: mockProject,
  },
};

// Without dates
export const WithoutDates: Story = {
  args: {
    project: {
      ...mockProject,
      startDate: null,
      endDate: null,
    },
    showDates: false,
  },
};

// Long description
export const LongDescription: Story = {
  args: {
    project: {
      ...mockProject,
      description: 'This is a very long description that should be truncated after two lines to maintain the card layout and prevent it from becoming too tall. The description should wrap nicely and show an ellipsis when it exceeds the maximum height.',
    },
  },
};

// Without code
export const WithoutCode: Story = {
  args: {
    project: {
      ...mockProject,
      code: null,
    },
  },
};

// All statuses grid
export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      <ProjectCard project={mockProject} onClick={() => console.log('Active clicked')} />
      <ProjectCard project={completedProject} onClick={() => console.log('Completed clicked')} />
      <ProjectCard project={onHoldProject} onClick={() => console.log('On-hold clicked')} />
      <ProjectCard project={cancelledProject} onClick={() => console.log('Cancelled clicked')} />
    </div>
  ),
};

