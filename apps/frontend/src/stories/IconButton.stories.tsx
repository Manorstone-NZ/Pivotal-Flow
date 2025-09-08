import type { Meta, StoryObj } from '@storybook/react';
import { IconButton, type IconButtonProps } from '../../components/ui/IconButton';

// Simple icon components for demonstration
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An accessible icon-only button component with proper ARIA labeling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    'aria-label': {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: <PlusIcon />,
    'aria-label': 'Add item',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <IconButton icon={<PlusIcon />} aria-label="Add item" variant="primary" />
      <IconButton icon={<EditIcon />} aria-label="Edit item" variant="secondary" />
      <IconButton icon={<DeleteIcon />} aria-label="Delete item" variant="outline" />
      <IconButton icon={<PlusIcon />} aria-label="Add item" variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <IconButton icon={<PlusIcon />} aria-label="Add item" size="sm" />
      <IconButton icon={<PlusIcon />} aria-label="Add item" size="md" />
      <IconButton icon={<PlusIcon />} aria-label="Add item" size="lg" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <IconButton icon={<PlusIcon />} aria-label="Add item" />
      <IconButton icon={<PlusIcon />} aria-label="Add item" disabled />
      <IconButton icon={<PlusIcon />} aria-label="Add item" loading />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    icon: <PlusIcon />,
    'aria-label': 'Add new item',
    'aria-describedby': 'add-description',
  },
  render: (args: IconButtonProps) => (
    <div>
      <IconButton {...args} />
      <p id="add-description" className="mt-2 text-sm text-gray-600">
        Click to add a new item to the list
      </p>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const handleClick = (action: string) => {
      alert(`${action} clicked!`);
    };

    return (
      <div className="flex gap-4 items-center">
        <IconButton 
          icon={<PlusIcon />} 
          aria-label="Add item" 
          onClick={() => handleClick('Add')}
        />
        <IconButton 
          icon={<EditIcon />} 
          aria-label="Edit item" 
          onClick={() => handleClick('Edit')}
        />
        <IconButton 
          icon={<DeleteIcon />} 
          aria-label="Delete item" 
          onClick={() => handleClick('Delete')}
        />
      </div>
    );
  },
};
