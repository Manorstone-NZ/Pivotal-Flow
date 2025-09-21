import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '../../components/ui/Tabs';
import { useState } from 'react';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A tabs component with keyboard navigation and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'pills', 'underline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const sampleItems = [
  {
    id: 'tab1',
    label: 'Overview',
    content: (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p className="text-gray-600">
          This is the overview tab content. It contains general information about the current section.
        </p>
      </div>
    ),
  },
  {
    id: 'tab2',
    label: 'Details',
    content: (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Details</h3>
        <p className="text-gray-600">
          This is the details tab content. It contains more specific information and data.
        </p>
      </div>
    ),
  },
  {
    id: 'tab3',
    label: 'Settings',
    content: (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <p className="text-gray-600">
          This is the settings tab content. It contains configuration options and preferences.
        </p>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    defaultActiveTab: 'tab1',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <Tabs items={sampleItems} variant="default" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Pills Variant</h3>
        <Tabs items={sampleItems} variant="pills" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Underline Variant</h3>
        <Tabs items={sampleItems} variant="underline" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <Tabs items={sampleItems} size="sm" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium Size</h3>
        <Tabs items={sampleItems} size="md" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <Tabs items={sampleItems} size="lg" />
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
  },
};

export const WithDisabledTab: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        id: 'tab4',
        label: 'Disabled',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Disabled Tab</h3>
            <p className="text-gray-600">This tab is disabled.</p>
          </div>
        ),
        disabled: true,
      },
    ],
  },
};

export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');
    
    return (
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Active tab: <strong>{activeTab}</strong>
          </p>
        </div>
        <Tabs
          items={sampleItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    );
  },
};

export const WithRichContent: Story = {
  args: {
    items: [
      {
        id: 'tab1',
        label: 'Dashboard',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quick Stats</h4>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'tab2',
        label: 'Analytics',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">Performance Metrics</h4>
                <p className="text-sm text-blue-700">View detailed performance data</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-green-900">User Engagement</h4>
                <p className="text-sm text-green-700">Track user interaction patterns</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'tab3',
        label: 'Reports',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Reports</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Monthly Report
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Quarterly Report
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                Annual Report
              </button>
            </div>
          </div>
        ),
      },
    ],
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');
    
    const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      console.log('Tab changed to:', tabId);
    };
    
    return (
      <div>
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Instructions:</strong> Use arrow keys to navigate between tabs, 
            or click on tabs to switch. Check the console for tab change events.
          </p>
        </div>
        <Tabs
          items={sampleItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    );
  },
};
