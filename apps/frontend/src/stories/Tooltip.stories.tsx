import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../../components/ui/Tooltip';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/ui/IconButton';

// Simple icon for demonstration
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tooltip component that provides contextual information on hover or focus.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: {
      control: { type: 'number', min: 0, max: 1000, step: 100 },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Placements: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="flex gap-8 items-center">
        <Tooltip content="Top tooltip" placement="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip content="Bottom tooltip" placement="bottom">
          <Button>Bottom</Button>
        </Tooltip>
      </div>
      <div className="flex gap-8 items-center">
        <Tooltip content="Left tooltip" placement="left">
          <Button>Left</Button>
        </Tooltip>
        <Tooltip content="Right tooltip" placement="right">
          <Button>Right</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const WithIconButton: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Tooltip content="Add new item">
        <IconButton icon={<InfoIcon />} aria-label="Add item" />
      </Tooltip>
      <Tooltip content="Edit this item">
        <IconButton icon={<InfoIcon />} aria-label="Edit item" />
      </Tooltip>
      <Tooltip content="Delete this item">
        <IconButton icon={<InfoIcon />} aria-label="Delete item" />
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    content: 'This is a longer tooltip that contains more detailed information about the action or element.',
    children: <Button>Long tooltip</Button>,
  },
};

export const CustomDelay: Story = {
  args: {
    content: 'This tooltip appears after 500ms',
    delay: 500,
    children: <Button>Delayed tooltip</Button>,
  },
};

export const Disabled: Story = {
  args: {
    content: 'This tooltip is disabled',
    disabled: true,
    children: <Button>Disabled tooltip</Button>,
  },
};

export const WithHTMLContent: Story = {
  args: {
    content: (
      <div>
        <strong>Bold text</strong>
        <br />
        <em>Italic text</em>
        <br />
        <span className="text-blue-300">Colored text</span>
      </div>
    ),
    children: <Button>Rich content</Button>,
  },
};

export const Interactive: Story = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!');
    };

    return (
      <div className="flex gap-4 items-center">
        <Tooltip content="Click to add a new item">
          <Button onClick={handleClick}>Add Item</Button>
        </Tooltip>
        <Tooltip content="Click to edit the current item">
          <Button onClick={handleClick}>Edit Item</Button>
        </Tooltip>
        <Tooltip content="Click to delete this item">
          <Button onClick={handleClick}>Delete Item</Button>
        </Tooltip>
      </div>
    );
  },
};
