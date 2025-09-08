import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../components/ui/Checkbox';
import { useState } from 'react';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox component with accessibility features, error handling, and form integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state for uncontrolled usage',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether the checkbox should be focused on mount',
    },
    label: {
      control: 'text',
      description: 'Label text for the checkbox',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helpText: {
      control: 'text',
      description: 'Help text to display below the checkbox',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    label: 'Subscribe to newsletter',
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: 'Enable notifications',
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    disabled: true,
    checked: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required field',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Checkbox with error',
    error: 'This field is required',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Checkbox with help text',
    helpText: 'This will enable additional features',
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate state',
    indeterminate: true,
  },
};

export const WithoutLabel: Story = {
  args: {},
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    
    return (
      <div className="space-y-4">
        <Checkbox
          label="Interactive checkbox"
          checked={checked}
          onChange={setChecked}
        />
        <p className="text-sm text-gray-600">
          Current state: {checked ? 'Checked' : 'Unchecked'}
        </p>
      </div>
    );
  },
};

export const MultipleCheckboxes: Story = {
  render: () => {
    const [options, setOptions] = useState({
      email: false,
      sms: false,
      push: true,
    });
    
    const handleChange = (key: keyof typeof options) => (checked: boolean) => {
      setOptions(prev => ({ ...prev, [key]: checked }));
    };
    
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <Checkbox
          label="Email notifications"
          checked={options.email}
          onChange={handleChange('email')}
        />
        <Checkbox
          label="SMS notifications"
          checked={options.sms}
          onChange={handleChange('sms')}
        />
        <Checkbox
          label="Push notifications"
          checked={options.push}
          onChange={handleChange('push')}
        />
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      terms: false,
      newsletter: false,
      marketing: false,
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <h3 className="text-lg font-medium">Registration Form</h3>
        
        <Checkbox
          label="I agree to the terms and conditions"
          required
          checked={formData.terms}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, terms: checked }))}
        />
        
        <Checkbox
          label="Subscribe to newsletter"
          helpText="Get updates about new features and tips"
          checked={formData.newsletter}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, newsletter: checked }))}
        />
        
        <Checkbox
          label="Receive marketing emails"
          checked={formData.marketing}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, marketing: checked }))}
        />
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!formData.terms}
        >
          Submit
        </button>
      </form>
    );
  },
};

