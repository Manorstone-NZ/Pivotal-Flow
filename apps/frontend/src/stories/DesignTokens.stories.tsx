import type { Meta, StoryObj } from '@storybook/react';
import { TokenGallery } from '../components/ui/TokenGallery';

const meta: Meta<typeof TokenGallery> = {
  title: 'Design System/Token Gallery',
  component: TokenGallery,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive showcase of all design tokens used in the Pivotal Flow design system.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TokenGallery>;

export const Default: Story = {
  args: {},
};

export const WithCustomStyling: Story = {
  args: {
    className: 'bg-neutral-50 p-8',
  },
};
