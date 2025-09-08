import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../../components/ui/Toggle';
import { useState } from 'react';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component with accessibility features, multiple sizes, and form integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state for uncontrolled usage',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the toggle is required',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether the toggle should be focused on mount',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the toggle',
    },
    label: {
      control: 'text',
      description: 'Label text for the toggle',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helpText: {
      control: 'text',
      description: 'Help text to display below the toggle',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
};

export const Checked: Story = {
  args: {
    label: 'Dark mode',
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: 'Auto-save',
    checked: false,
  },
};

export const Small: Story = {
  args: {
    label: 'Small toggle',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium toggle',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    label: 'Large toggle',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
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
    label: 'Required toggle',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Toggle with error',
    error: 'This field is required',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Toggle with help text',
    helpText: 'This will enable additional features',
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
        <Toggle
          label="Interactive toggle"
          checked={checked}
          onChange={setChecked}
        />
        <p className="text-sm text-gray-600">
          Current state: {checked ? 'On' : 'Off'}
        </p>
      </div>
    );
  },
};

export const MultipleToggles: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    });
    
    const handleChange = (key: keyof typeof settings) => (checked: boolean) => {
      setSettings(prev => ({ ...prev, [key]: checked }));
    };
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Settings</h3>
        <Toggle
          label="Push notifications"
          checked={settings.notifications}
          onChange={handleChange('notifications')}
        />
        <Toggle
          label="Dark mode"
          checked={settings.darkMode}
          onChange={handleChange('darkMode')}
        />
        <Toggle
          label="Auto-save documents"
          checked={settings.autoSave}
          onChange={handleChange('autoSave')}
        />
        <Toggle
          label="Analytics tracking"
          checked={settings.analytics}
          onChange={handleChange('analytics')}
        />
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      newsletter: false,
      marketing: false,
      privacy: true,
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted: ${JSON.stringify(formData, null, 2)}`);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <h3 className="text-lg font-medium">Preferences</h3>
        
        <Toggle
          label="Subscribe to newsletter"
          checked={formData.newsletter}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, newsletter: checked }))}
          helpText="Get weekly updates about new features"
        />
        
        <Toggle
          label="Receive marketing emails"
          checked={formData.marketing}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, marketing: checked }))}
          helpText="Promotional offers and product announcements"
        />
        
        <Toggle
          label="Privacy policy accepted"
          required
          checked={formData.privacy}
          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, privacy: checked }))}
        />
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!formData.privacy}
        >
          Save Preferences
        </button>
      </form>
    );
  },
};

export const SizeComparison: Story = {
  render: () => {
    const [states, setStates] = useState({
      small: false,
      medium: false,
      large: false,
    });
    
    const handleChange = (size: keyof typeof states) => (checked: boolean) => {
      setStates(prev => ({ ...prev, [size]: checked }));
    };
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Size Comparison</h3>
        
        <div className="space-y-4">
          <Toggle
            label="Small toggle"
            size="sm"
            checked={states.small}
            onChange={handleChange('small')}
          />
          
          <Toggle
            label="Medium toggle"
            size="md"
            checked={states.medium}
            onChange={handleChange('medium')}
          />
          
          <Toggle
            label="Large toggle"
            size="lg"
            checked={states.large}
            onChange={handleChange('large')}
          />
        </div>
      </div>
    );
  },
};

export const AccessibilityExample: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    
    return (
      <div className="space-y-4">
        <Toggle
          label="Accessible toggle"
          checked={checked}
          onChange={setChecked}
          helpText="This toggle demonstrates proper accessibility features"
        />
        
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Accessibility features:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Proper ARIA attributes (role="switch", aria-checked)</li>
            <li>Keyboard navigation support</li>
            <li>Screen reader announcements</li>
            <li>Focus management</li>
            <li>Error state handling</li>
          </ul>
        </div>
      </div>
    );
  },
};

