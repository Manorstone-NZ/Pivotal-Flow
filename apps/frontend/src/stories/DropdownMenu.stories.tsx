import type { Meta, StoryObj } from '@storybook/react-vite';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '../../components/ui/DropdownMenu';
import { Button } from '../../components/Button';
import { useState } from 'react';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown menu component with trigger, content, items, and separators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dropdown is open',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button onClick={() => setOpen(!open)}>
            Open Menu
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('Edit clicked')}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Copy clicked')}>
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Delete clicked')}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const WithSeparators: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button onClick={() => setOpen(!open)}>
            Actions
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('New clicked')}>
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Open clicked')}>
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Save clicked')}>
              Save
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Save As clicked')}>
              Save As
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Exit clicked')}>
              Exit
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const LeftAligned: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button onClick={() => setOpen(!open)}>
            Left Aligned
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => alert('Option 1')}>
              Option 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 2')}>
              Option 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 3')}>
              Option 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const RightAligned: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button onClick={() => setOpen(!open)}>
            Right Aligned
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert('Option 1')}>
              Option 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 2')}>
              Option 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 3')}>
              Option 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const UserMenu: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button variant="outline" onClick={() => setOpen(!open)}>
            👤 John Doe
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('Profile clicked')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Settings clicked')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Help clicked')}>
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Logout clicked')}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const FileMenu: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button variant="outline" onClick={() => setOpen(!open)}>
            📁 File
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('New File')}>
              New File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Open File')}>
              Open File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Open Recent')}>
              Open Recent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Save')}>
              Save
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Save As')}>
              Save As
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Export')}>
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Print')}>
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    
    const items = [
      { id: 'item1', label: 'First Item' },
      { id: 'item2', label: 'Second Item' },
      { id: 'item3', label: 'Third Item' },
    ];
    
    return (
      <div className="space-y-4">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button onClick={() => setOpen(!open)}>
              Select Item
            </Button>
          </DropdownMenuTrigger>
          {open && (
            <DropdownMenuContent>
              {items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item.label);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
        
        {selectedItem && (
          <p className="text-sm text-gray-600">
            Selected: {selectedItem}
          </p>
        )}
      </div>
    );
  },
};

export const MultipleDropdowns: Story = {
  render: () => {
    const [fileOpen, setFileOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    
    return (
      <div className="flex space-x-2">
        <DropdownMenu open={fileOpen} onOpenChange={setFileOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" onClick={() => setFileOpen(!fileOpen)}>
              File
            </Button>
          </DropdownMenuTrigger>
          {fileOpen && (
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => alert('New')}>New</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Open')}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Save')}>Save</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
        
        <DropdownMenu open={editOpen} onOpenChange={setEditOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" onClick={() => setEditOpen(!editOpen)}>
              Edit
            </Button>
          </DropdownMenuTrigger>
          {editOpen && (
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => alert('Undo')}>Undo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Redo')}>Redo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Cut')}>Cut</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Copy')}>Copy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Paste')}>Paste</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
        
        <DropdownMenu open={viewOpen} onOpenChange={setViewOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" onClick={() => setViewOpen(!viewOpen)}>
              View
            </Button>
          </DropdownMenuTrigger>
          {viewOpen && (
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => alert('Zoom In')}>Zoom In</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Zoom Out')}>Zoom Out</DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Full Screen')}>Full Screen</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    );
  },
};

export const CustomTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <div 
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => setOpen(!open)}
          >
            ⋮
          </div>
        </DropdownMenuTrigger>
        {open && (
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => alert('Option 1')}>
              Option 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 2')}>
              Option 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Option 3')}>
              Option 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    );
  },
};

