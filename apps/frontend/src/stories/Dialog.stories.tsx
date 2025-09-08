import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/Button';
import { useState } from 'react';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component with accessibility features, focus management, and customizable sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    title: {
      control: 'text',
      description: 'Title of the dialog',
    },
    description: {
      control: 'text',
      description: 'Description text for the dialog',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the dialog',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Whether clicking the overlay closes the dialog',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the dialog',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Dialog Title',
    description: 'This is a dialog description.',
    children: (
      <div className="space-y-4">
        <p>Dialog content goes here.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    open: true,
    size: 'sm',
    title: 'Small Dialog',
    children: (
      <div className="space-y-4">
        <p>This is a small dialog.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>OK</Button>
        </div>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    open: true,
    size: 'lg',
    title: 'Large Dialog',
    description: 'This dialog has more space for content.',
    children: (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Enter your name" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Message</label>
          <textarea className="w-full px-3 py-2 border rounded-md" rows={4} placeholder="Enter your message" />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Send</Button>
        </div>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    open: true,
    size: 'xl',
    title: 'Extra Large Dialog',
    description: 'This dialog provides maximum space for complex content.',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">First Name</label>
            <input className="w-full px-3 py-2 border rounded-md" placeholder="First name" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Last Name</label>
            <input className="w-full px-3 py-2 border rounded-md" placeholder="Last name" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Address</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Street address" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">City</label>
            <input className="w-full px-3 py-2 border rounded-md" placeholder="City" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">State</label>
            <input className="w-full px-3 py-2 border rounded-md" placeholder="State" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">ZIP</label>
            <input className="w-full px-3 py-2 border rounded-md" placeholder="ZIP code" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </div>
      </div>
    ),
  },
};

export const FullScreen: Story = {
  args: {
    open: true,
    size: 'full',
    title: 'Full Screen Dialog',
    description: 'This dialog takes up the full screen width.',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Personal Information</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name</label>
              <input className="w-full px-3 py-2 border rounded-md" placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input className="w-full px-3 py-2 border rounded-md" placeholder="Email address" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Preferences</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Theme</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Language</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Email notifications
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Push notifications
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                SMS notifications
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    open: true,
    children: (
      <div className="space-y-4">
        <p>This dialog has no title.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>OK</Button>
        </div>
      </div>
    ),
  },
};

export const ConfirmationDialog: Story = {
  args: {
    open: true,
    title: 'Confirm Action',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    children: (
      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Interactive Dialog"
          description="This dialog can be opened and closed."
        >
          <div className="space-y-4">
            <p>This is an interactive dialog that can be controlled by the button above.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  },
};

export const NonClosable: Story = {
  args: {
    open: true,
    title: 'Non-Closable Dialog',
    description: 'This dialog cannot be closed by clicking the overlay or pressing Escape.',
    closeOnOverlayClick: false,
    closeOnEscape: false,
    children: (
      <div className="space-y-4">
        <p>You must use the close button to close this dialog.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Continue</Button>
        </div>
      </div>
    ),
  },
};

