import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Design System/Theme Toggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Theme toggle component that switches between light, dark, and system themes.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  args: {},
};

export const WithCustomStyling: Story = {
  args: {
    className: 'w-12 h-12',
  },
};

export const InToolbar: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 bg-surface-card border border-surface-border rounded-lg">
      <span className="text-text-primary font-medium">Theme:</span>
      <ThemeToggle />
    </div>
  ),
};
