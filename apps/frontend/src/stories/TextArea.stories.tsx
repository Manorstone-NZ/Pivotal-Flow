import type { Meta, StoryObj } from '@storybook/react';
import { TextArea } from '../../components/ui/TextArea';
import { useState } from 'react';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A textarea component with accessibility features, auto-resize, character limits, and form integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current text value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default text value for uncontrolled usage',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
    cols: {
      control: 'number',
      description: 'Number of visible character columns',
    },
    autoResize: {
      control: 'boolean',
      description: 'Whether the textarea should automatically resize',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum number of characters',
    },
    minLength: {
      control: 'number',
      description: 'Minimum number of characters',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the textarea is read-only',
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether the textarea should be focused on mount',
    },
    label: {
      control: 'text',
      description: 'Label text for the textarea',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helpText: {
      control: 'text',
      description: 'Help text to display below the textarea',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Message',
    value: 'This is a sample message with some content.',
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Share your thoughts...',
  },
};

export const Small: Story = {
  args: {
    label: 'Short note',
    rows: 2,
    placeholder: 'Brief note...',
  },
};

export const Large: Story = {
  args: {
    label: 'Detailed description',
    rows: 8,
    placeholder: 'Provide a detailed description...',
  },
};

export const AutoResize: Story = {
  args: {
    label: 'Auto-resizing textarea',
    autoResize: true,
    placeholder: 'Type and watch me grow...',
  },
};

export const WithMaxLength: Story = {
  args: {
    label: 'Limited text',
    maxLength: 100,
    placeholder: 'Maximum 100 characters...',
  },
};

export const WithMinLength: Story = {
  args: {
    label: 'Minimum text',
    minLength: 10,
    placeholder: 'At least 10 characters required...',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled textarea',
    value: 'This textarea is disabled',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-only textarea',
    value: 'This textarea is read-only',
    readOnly: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required field',
    required: true,
    placeholder: 'This field is required...',
  },
};

export const WithError: Story = {
  args: {
    label: 'Textarea with error',
    error: 'This field is required',
    placeholder: 'Enter some text...',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Textarea with help text',
    helpText: 'Provide detailed information about your request',
    placeholder: 'Enter your request...',
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-4">
        <TextArea
          label="Interactive textarea"
          value={value}
          onChange={setValue}
          placeholder="Type something..."
        />
        <div className="text-sm text-gray-600">
          <p>Character count: {value.length}</p>
          <p>Word count: {value.trim() ? value.trim().split(/\s+/).length : 0}</p>
        </div>
      </div>
    );
  },
};

export const CharacterCounter: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 200;
    
    return (
      <div className="space-y-2">
        <TextArea
          label="Message with character counter"
          value={value}
          onChange={setValue}
          maxLength={maxLength}
          placeholder="Type your message..."
        />
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {value.length} / {maxLength} characters
          </span>
          <span className={value.length > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-600'}>
            {value.length > maxLength * 0.9 ? 'Approaching limit' : 'Within limit'}
          </span>
        </div>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      subject: '',
      message: '',
      notes: '',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <h3 className="text-lg font-medium">Contact Form</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter subject..."
          />
        </div>
        
        <TextArea
          label="Message"
          required
          rows={4}
          value={formData.message}
          onChange={(value: string) => setFormData(prev => ({ ...prev, message: value }))}
          placeholder="Enter your message..."
          helpText="Please provide as much detail as possible"
        />
        
        <TextArea
          label="Additional notes"
          rows={2}
          value={formData.notes}
          onChange={(value: string) => setFormData(prev => ({ ...prev, notes: value }))}
          placeholder="Any additional information..."
        />
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!formData.subject || !formData.message}
        >
          Send Message
        </button>
      </form>
    );
  },
};

export const AutoResizeExample: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-4">
        <TextArea
          label="Auto-resizing textarea"
          autoResize
          value={value}
          onChange={setValue}
          placeholder="Start typing and watch me grow..."
        />
        <div className="text-sm text-gray-600">
          <p>Lines: {value.split('\n').length}</p>
          <p>Characters: {value.length}</p>
        </div>
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: 'Textarea without label',
  },
};

