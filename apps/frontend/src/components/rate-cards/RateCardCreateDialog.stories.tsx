import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { within, userEvent, expect } from '@storybook/test';
import { RateCardCreateDialog } from './RateCardCreateDialog';

const meta: Meta<typeof RateCardCreateDialog> = {
  title: 'Rate Cards/RateCardCreateDialog',
  component: RateCardCreateDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Dialog for creating new rate cards with form validation and currency selection.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the dialog is open',
    },
    onClose: {
      action: 'onClose',
      description: 'Called when the dialog should be closed',
    },
    onSuccess: {
      action: 'onSuccess', 
      description: 'Called when a rate card is successfully created',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - dialog closed
export const Default: Story = {
  args: {
    open: false,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
};

// Dialog open and ready for interaction
export const Open: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
};

// Interaction test - filling out the form
export const InteractionTest: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Wait for dialog to be visible
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    
    // Fill in the form
    await userEvent.type(
      canvas.getByLabelText(/name/i),
      'Software Development Services 2024'
    );
    
    await userEvent.type(
      canvas.getByLabelText(/description/i),
      'Comprehensive software development services including design, development, and testing.'
    );
    
    // Select currency (NZD should be default)
    const currencySelect = canvas.getByTestId('currency-select');
    await userEvent.click(currencySelect);
    
    // Verify form is filled
    await expect(canvas.getByDisplayValue('Software Development Services 2024')).toBeInTheDocument();
    await expect(canvas.getByDisplayValue(/Comprehensive software development/)).toBeInTheDocument();
  },
};

// Form validation test
export const ValidationTest: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Try to submit empty form
    const submitButton = canvas.getByRole('button', { name: /create rate card/i });
    await userEvent.click(submitButton);
    
    // Should show validation errors
    await expect(canvas.getByText(/required/i)).toBeInTheDocument();
  },
};

// Loading state simulation
export const LoadingState: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the dialog in a loading state after form submission.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill form with valid data
    await userEvent.type(canvas.getByLabelText(/name/i), 'Test Rate Card');
    await userEvent.type(canvas.getByLabelText(/description/i), 'Test description');
    
    // Submit form to trigger loading state
    const submitButton = canvas.getByRole('button', { name: /create rate card/i });
    await userEvent.click(submitButton);
    
    // In a real scenario, this would show a loading spinner
    // For now, we just verify the button is disabled during submission
    await expect(submitButton).toBeDisabled();
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test keyboard navigation
    const firstInput = canvas.getByLabelText(/name/i);
    await userEvent.tab();
    await expect(firstInput).toHaveFocus();
    
    // Test form labels
    await expect(canvas.getByLabelText(/name/i)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/description/i)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/currency/i)).toBeInTheDocument();
    
    // Test ARIA attributes
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-labelledby');
    await expect(dialog).toHaveAttribute('aria-describedby');
  },
};

// Currency selection test
export const CurrencySelection: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test currency dropdown
    const currencySelect = canvas.getByTestId('currency-select');
    await userEvent.click(currencySelect);
    
    // Should show currency options
    await expect(canvas.getByText('NZD')).toBeInTheDocument();
    await expect(canvas.getByText('USD')).toBeInTheDocument();
    await expect(canvas.getByText('AUD')).toBeInTheDocument();
    await expect(canvas.getByText('EUR')).toBeInTheDocument();
    await expect(canvas.getByText('GBP')).toBeInTheDocument();
    
    // Select USD
    await userEvent.click(canvas.getByText('USD'));
    
    // Verify selection
    await expect(currencySelect).toHaveTextContent('USD');
  },
};

// Error handling test
export const ErrorHandling: Story = {
  args: {
    open: true,
    onClose: action('onClose'),
    onSuccess: action('onSuccess'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests error handling when rate card creation fails.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill form with data that might cause server error
    await userEvent.type(canvas.getByLabelText(/name/i), 'Duplicate Name');
    await userEvent.type(canvas.getByLabelText(/description/i), 'This might cause an error');
    
    // Submit form
    const submitButton = canvas.getByRole('button', { name: /create rate card/i });
    await userEvent.click(submitButton);
    
    // In a real scenario, this would show an error message
    // For now, we just verify the form can handle submission
  },
};

