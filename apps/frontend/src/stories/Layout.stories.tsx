import type { Meta, StoryObj } from '@storybook/react';
import { AppLayout, ProtectedLayout } from '../components/layout/AppLayout';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { SystemStatusWidget } from '../components/layout/SystemStatusWidget';
import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';

const meta: Meta<typeof AppLayout> = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main application layout with responsive sidebar, header, and footer.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

// Sample content for stories
const SampleContent = () => (
  <div className="space-y-6">
    <Card>
      <Card.Header>
        <Card.Title>Dashboard Overview</Card.Title>
        <Card.Description>
          Welcome to your Pivotal Flow dashboard
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-card rounded-lg border">
            <h3 className="font-semibold text-text-primary">Total Quotes</h3>
            <p className="text-2xl font-bold text-brand-primary">24</p>
          </div>
          <div className="p-4 bg-surface-card rounded-lg border">
            <h3 className="font-semibold text-text-primary">Active Projects</h3>
            <p className="text-2xl font-bold text-brand-primary">8</p>
          </div>
          <div className="p-4 bg-surface-card rounded-lg border">
            <h3 className="font-semibold text-text-primary">Revenue</h3>
            <p className="text-2xl font-bold text-brand-primary">$45,230</p>
          </div>
        </div>
      </Card.Content>
    </Card>
    
    <Card>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-surface-card rounded border">
            <div>
              <p className="font-medium text-text-primary">New quote created</p>
              <p className="text-sm text-text-secondary">Project Alpha - 2 hours ago</p>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-card rounded border">
            <div>
              <p className="font-medium text-text-primary">Quote approved</p>
              <p className="text-sm text-text-secondary">Project Beta - 4 hours ago</p>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  </div>
);

export const Default: Story = {
  args: {},
  render: (args) => (
    <AppLayout {...args}>
      <SampleContent />
    </AppLayout>
  ),
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gray-50',
  },
  render: (args) => (
    <AppLayout {...args}>
      <SampleContent />
    </AppLayout>
  ),
};

export const ProtectedLayoutExample: Story = {
  render: () => (
    <ProtectedLayout>
      <SampleContent />
    </ProtectedLayout>
  ),
};

// Header Stories
const HeaderMeta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Application header with navigation and user controls.',
      },
    },
  },
  tags: ['autodocs'],
};

export const HeaderStory: StoryObj<typeof Header> = {
  args: {},
  render: (args) => (
    <div className="min-h-screen bg-surface-background">
      <Header {...args} />
      <main className="p-6">
        <SampleContent />
      </main>
    </div>
  ),
};

// Sidebar Stories
const SidebarMeta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Navigation sidebar with collapsible menu items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
    },
  },
};

export const SidebarStory: StoryObj<typeof Sidebar> = {
  args: {
    isOpen: true,
  },
  render: (args) => (
    <div className="min-h-screen bg-surface-background flex">
      <Sidebar {...args} />
      <main className="flex-1 p-6">
        <SampleContent />
      </main>
    </div>
  ),
};

export const SidebarClosed: StoryObj<typeof Sidebar> = {
  args: {
    isOpen: false,
  },
  render: (args) => (
    <div className="min-h-screen bg-surface-background flex">
      <Sidebar {...args} />
      <main className="flex-1 p-6">
        <SampleContent />
      </main>
    </div>
  ),
};

// SystemStatusWidget Stories
const SystemStatusMeta: Meta<typeof SystemStatusWidget> = {
  title: 'Layout/SystemStatusWidget',
  component: SystemStatusWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'System status indicator widget showing application health.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: 'boolean',
    },
  },
};

export const SystemStatusStory: StoryObj<typeof SystemStatusWidget> = {
  args: {},
  render: (args) => (
    <div className="p-6 bg-surface-background">
      <SystemStatusWidget {...args} />
    </div>
  ),
};

export const SystemStatusCompact: StoryObj<typeof SystemStatusWidget> = {
  args: {
    compact: true,
  },
  render: (args) => (
    <div className="p-6 bg-surface-background">
      <SystemStatusWidget {...args} />
    </div>
  ),
};
