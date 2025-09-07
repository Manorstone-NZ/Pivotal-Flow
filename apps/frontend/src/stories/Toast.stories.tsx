import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastContainer, useToast } from '../../components/ui/Toast';
import { Button } from '../../components/Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toast notification system with portal rendering and ARIA live regions for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    duration: {
      control: 'number',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    id: '1',
    title: 'Success!',
    description: 'Your changes have been saved.',
    type: 'success',
    onClose: () => {},
  },
};

export const Types: Story = {
  render: () => (
    <div className="space-x-4">
      <Toast
        id="success"
        title="Success!"
        description="Your changes have been saved."
        type="success"
        onClose={() => {}}
      />
      <Toast
        id="error"
        title="Error!"
        description="Something went wrong."
        type="error"
        onClose={() => {}}
      />
      <Toast
        id="warning"
        title="Warning!"
        description="Please check your input."
        type="warning"
        onClose={() => {}}
      />
      <Toast
        id="info"
        title="Info"
        description="Here's some information."
        type="info"
        onClose={() => {}}
      />
    </div>
  ),
};

export const WithTitleOnly: Story = {
  args: {
    id: '2',
    title: 'Simple notification',
    type: 'info',
    onClose: () => {},
  },
};

export const WithDescriptionOnly: Story = {
  args: {
    id: '3',
    description: 'This is a description-only toast notification.',
    type: 'info',
    onClose: () => {},
  },
};

export const LongContent: Story = {
  args: {
    id: '4',
    title: 'Long Notification Title That Might Wrap to Multiple Lines',
    description: 'This is a longer description that demonstrates how the toast component handles content that might wrap to multiple lines. It should still look good and be readable.',
    type: 'info',
    onClose: () => {},
  },
};

export const Persistent: Story = {
  args: {
    id: '5',
    title: 'Persistent Toast',
    description: 'This toast will not auto-dismiss.',
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const { toasts, success, error, warning, info } = useToast();
    
    return (
      <div className="space-y-4">
        <div className="space-x-4">
          <Button onClick={() => success('Success!', 'Your action was completed successfully.')}>
            Success Toast
          </Button>
          <Button onClick={() => error('Error!', 'Something went wrong. Please try again.')}>
            Error Toast
          </Button>
          <Button onClick={() => warning('Warning!', 'Please review your input before proceeding.')}>
            Warning Toast
          </Button>
          <Button onClick={() => info('Info', 'Here is some helpful information.')}>
            Info Toast
          </Button>
        </div>
        
        <ToastContainer toasts={toasts} />
      </div>
    );
  },
};
