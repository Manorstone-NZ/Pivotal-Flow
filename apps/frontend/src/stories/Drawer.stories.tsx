import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/Button';
import { useState } from 'react';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A drawer/sheet component that slides in from different sides with focus management and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: { type: 'select' },
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    closeOnOverlayClick: {
      control: { type: 'boolean' },
    },
    closeOnEscape: {
      control: { type: 'boolean' },
    },
    showCloseButton: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>
          Open Drawer
        </Button>
        
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Default Drawer"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Drawer Content</h3>
            <p className="text-gray-600 mb-4">
              This is the default drawer content. It slides in from the right side.
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Close Drawer
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const Sides: Story = {
  render: () => {
    const [openSide, setOpenSide] = useState<string | null>(null);
    
    const sides = ['left', 'right', 'top', 'bottom'] as const;
    
    return (
      <div className="p-8">
        <div className="flex gap-4 mb-8">
          {sides.map((side) => (
            <Button
              key={side}
              onClick={() => setOpenSide(side)}
              variant="outline"
            >
              Open {side.charAt(0).toUpperCase() + side.slice(1)} Drawer
            </Button>
          ))}
        </div>
        
        {sides.map((side) => (
          <Drawer
            key={side}
            isOpen={openSide === side}
            onClose={() => setOpenSide(null)}
            side={side}
            title={`${side.charAt(0).toUpperCase() + side.slice(1)} Drawer`}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {side.charAt(0).toUpperCase() + side.slice(1)} Side Drawer
              </h3>
              <p className="text-gray-600 mb-4">
                This drawer slides in from the {side} side.
              </p>
              <Button onClick={() => setOpenSide(null)}>
                Close Drawer
              </Button>
            </div>
          </Drawer>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<string | null>(null);
    
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    return (
      <div className="p-8">
        <div className="flex gap-4 mb-8">
          {sizes.map((size) => (
            <Button
              key={size}
              onClick={() => setOpenSize(size)}
              variant="outline"
            >
              Open {size.toUpperCase()} Drawer
            </Button>
          ))}
        </div>
        
        {sizes.map((size) => (
          <Drawer
            key={size}
            isOpen={openSize === size}
            onClose={() => setOpenSize(null)}
            size={size}
            title={`${size.toUpperCase()} Size Drawer`}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {size.toUpperCase()} Size Drawer
              </h3>
              <p className="text-gray-600 mb-4">
                This drawer has a {size} size.
              </p>
              <Button onClick={() => setOpenSize(null)}>
                Close Drawer
              </Button>
            </div>
          </Drawer>
        ))}
      </div>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>
          Open Drawer Without Title
        </Button>
        
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">No Title Drawer</h3>
            <p className="text-gray-600 mb-4">
              This drawer doesn't have a title in the header.
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Close Drawer
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>
          Open Drawer Without Close Button
        </Button>
        
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Close Button"
          showCloseButton={false}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">No Close Button</h3>
            <p className="text-gray-600 mb-4">
              This drawer doesn't have a close button in the header. You can only close it by clicking the overlay or pressing Escape.
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Close Drawer
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>
          Open Drawer with Long Content
        </Button>
        
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Long Content Drawer"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Long Content</h3>
            <div className="space-y-4">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded">
                  <h4 className="font-medium mb-2">Section {i + 1}</h4>
                  <p className="text-gray-600">
                    This is section {i + 1} content. The drawer should be scrollable when the content is longer than the viewport.
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={() => setIsOpen(false)}>
                Close Drawer
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);
    
    return (
      <div className="p-8">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Button clicked {count} times
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          Open Interactive Drawer
        </Button>
        
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Interactive Drawer"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Interactive Content</h3>
            <p className="text-gray-600 mb-4">
              This drawer contains interactive elements that maintain state.
            </p>
            <div className="space-y-4">
              <Button onClick={() => setCount(count + 1)}>
                Increment Counter
              </Button>
              <Button onClick={() => setCount(0)} variant="outline">
                Reset Counter
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Close Drawer
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
};
