import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '../../components/ui/select';
import { useState } from 'react';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A select dropdown component with accessibility features, error handling, and form integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current selected value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value for uncontrolled usage',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
    },
    multiple: {
      control: 'boolean',
      description: 'Whether multiple options can be selected',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether the select should be focused on mount',
    },
    label: {
      control: 'text',
      description: 'Label text for the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the select',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helpText: {
      control: 'text',
      description: 'Help text to display below the select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const basicOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
];

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];

export const Default: Story = {
  args: {
    options: basicOptions,
    label: 'Choose an option',
  },
};

export const WithValue: Story = {
  args: {
    options: basicOptions,
    label: 'Choose an option',
    value: 'option2',
  },
};

export const WithPlaceholder: Story = {
  args: {
    options: basicOptions,
    label: 'Choose an option',
    placeholder: 'Please select...',
  },
};

export const Disabled: Story = {
  args: {
    options: basicOptions,
    label: 'Disabled select',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    options: basicOptions,
    label: 'Required field',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    options: basicOptions,
    label: 'Select with error',
    error: 'This field is required',
  },
};

export const WithHelpText: Story = {
  args: {
    options: basicOptions,
    label: 'Select with help text',
    helpText: 'Choose the best option for your needs',
  },
};

export const Multiple: Story = {
  args: {
    options: basicOptions,
    label: 'Multiple selection',
    multiple: true,
    placeholder: 'Select multiple options...',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: statusOptions,
    label: 'Status',
    placeholder: 'Select status...',
  },
};

export const CountrySelector: Story = {
  args: {
    options: countryOptions,
    label: 'Country',
    placeholder: 'Select your country...',
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-4">
        <Select
          options={basicOptions}
          label="Interactive select"
          value={value}
          onChange={setValue}
        />
        <p className="text-sm text-gray-600">
          Selected value: {value || 'None'}
        </p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      country: '',
      status: '',
      category: '',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
    };
    
    const categoryOptions = [
      { value: 'business', label: 'Business' },
      { value: 'personal', label: 'Personal' },
      { value: 'education', label: 'Education' },
    ];
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <h3 className="text-lg font-medium">User Profile</h3>
        
        <Select
          options={countryOptions}
          label="Country"
          required
          value={formData.country}
          onChange={(value: string) => setFormData(prev => ({ ...prev, country: value as string }))}
        />
        
        <Select
          options={statusOptions}
          label="Status"
          value={formData.status}
          onChange={(value: string) => setFormData(prev => ({ ...prev, status: value as string }))}
        />
        
        <Select
          options={categoryOptions}
          label="Category"
          helpText="Choose the category that best describes your account"
          value={formData.category}
          onChange={(value: string) => setFormData(prev => ({ ...prev, category: value as string }))}
        />
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!formData.country}
        >
          Submit
        </button>
      </form>
    );
  },
};

export const LongList: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: `item-${i + 1}`,
      label: `Item ${i + 1}`,
    })),
    label: 'Long list of options',
    placeholder: 'Search through many options...',
  },
};

export const WithoutLabel: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Select without label',
  },
};

