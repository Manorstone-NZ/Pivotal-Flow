import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../components/ui/Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with validation, error states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    error: 'Please enter a valid email address',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    helpText: 'Password must be at least 8 characters long',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Input',
    value: 'This value cannot be changed',
    readOnly: true,
  },
};

export const WithMaxLength: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    maxLength: 20,
    helpText: 'Maximum 20 characters',
  },
};

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input type="text" label="Text" placeholder="Enter text" />
      <Input type="email" label="Email" placeholder="Enter email" />
      <Input type="password" label="Password" placeholder="Enter password" />
      <Input type="number" label="Number" placeholder="Enter number" />
      <Input type="tel" label="Phone" placeholder="Enter phone number" />
      <Input type="url" label="URL" placeholder="Enter URL" />
      <Input type="search" label="Search" placeholder="Search..." />
    </div>
  ),
};
