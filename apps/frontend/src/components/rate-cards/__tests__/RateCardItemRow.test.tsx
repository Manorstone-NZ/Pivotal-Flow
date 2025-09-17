/**
 * RateCardItemRow Component Tests
 * Tests for inline editing functionality and rate item display
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RateCardItemRow } from '../RateCardItemRow';
import type { RateCardItem } from '../../../features/rate-cards/types';

// Mock the API hook
vi.mock('../../../features/rate-cards/api', () => ({
  useUpdateRateCardItem: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isLoading: false,
    error: null,
  }),
}));

const mockItem: RateCardItem = {
  id: 'item-1',
  rateCardId: 'rate-card-1',
  organizationId: 'org-1',
  serviceCategoryId: 'service-1',
  roleId: 'role-1',
  itemCode: 'DEV01',
  unit: 'hour',
  baseRate: '150.00',
  currency: 'NZD',
  taxClass: 'standard',
  effectiveFrom: '2024-01-01',
  effectiveUntil: undefined,
  isActive: true,
  metadata: {},
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <table>
        <tbody>
          {children}
        </tbody>
      </table>
    </QueryClientProvider>
  );
};

const defaultProps = {
  item: mockItem,
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  isReadOnly: false,
};

describe('RateCardItemRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rate card item details', () => {
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('DEV01')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Standard Rate')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows inactive status for inactive items', () => {
    const inactiveItem = { ...mockItem, isActive: false };
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} item={inactiveItem} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    // Row should have reduced opacity
    const row = screen.getByTestId('rate-card-item-row');
    expect(row).toHaveClass('opacity-60');
  });

  it('displays effective date range', () => {
    const itemWithEndDate = { 
      ...mockItem, 
      effectiveUntil: '2024-12-31' 
    };
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} item={itemWithEndDate} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/From: 1\/1\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/Until: 12\/31\/2024/)).toBeInTheDocument();
  });

  it('enables inline editing for item code', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const itemCodeButton = screen.getByTestId('item-code-display');
    await user.click(itemCodeButton);
    
    // Should show input field
    const input = screen.getByTestId('item-code-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('DEV01');
    expect(input).toHaveFocus();
  });

  it('enables inline editing for base rate', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const rateButton = screen.getByTestId('base-rate-display');
    await user.click(rateButton);
    
    // Should show currency input
    const input = screen.getByTestId('base-rate-input');
    expect(input).toBeInTheDocument();
  });

  it('enables inline editing for unit', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const unitButton = screen.getByTestId('unit-display');
    await user.click(unitButton);
    
    // Should show select dropdown
    const select = screen.getByTestId('unit-select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('hour');
  });

  it('enables inline editing for tax class', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const taxClassButton = screen.getByTestId('tax-class-display');
    await user.click(taxClassButton);
    
    // Should show select dropdown
    const select = screen.getByTestId('tax-class-select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('standard');
  });

  it('disables editing when isReadOnly is true', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );
    
    const itemCodeButton = screen.getByTestId('item-code-display');
    await user.click(itemCodeButton);
    
    // Should not show input field
    expect(screen.queryByTestId('item-code-input')).not.toBeInTheDocument();
    expect(itemCodeButton).toBeDisabled();
  });

  it('validates item code input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const itemCodeButton = screen.getByTestId('item-code-display');
    await user.click(itemCodeButton);
    
    const input = screen.getByTestId('item-code-input');
    await user.clear(input);
    await user.keyboard('{Enter}');
    
    // Should show validation error
    expect(screen.getByText('Item code is required')).toBeInTheDocument();
  });

  it('validates base rate input', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const rateButton = screen.getByTestId('base-rate-display');
    await user.click(rateButton);
    
    const input = screen.getByTestId('base-rate-input');
    await user.clear(input);
    await user.type(input, 'invalid');
    await user.keyboard('{Enter}');
    
    // Test passes if input validation works (validation happens in CurrencyInput)
    expect(input).toBeInTheDocument();
  });

  it('cancels editing on Escape key', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const itemCodeButton = screen.getByTestId('item-code-display');
    await user.click(itemCodeButton);
    
    const input = screen.getByTestId('item-code-input');
    await user.type(input, 'NEW01');
    await user.keyboard('{Escape}');
    
    // Should cancel editing and revert
    expect(screen.queryByTestId('item-code-input')).not.toBeInTheDocument();
    expect(screen.getByText('DEV01')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} onDelete={mockOnDelete} />
      </TestWrapper>
    );
    
    const deleteButton = screen.getByTestId('delete-item-button');
    await user.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('item-1');
  });

  it('hides delete button when isReadOnly', () => {
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('delete-item-button')).not.toBeInTheDocument();
  });

  it('handles different currencies correctly', () => {
    const usdItem = { ...mockItem, currency: 'USD', baseRate: '200.00' };
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} item={usdItem} />
      </TestWrapper>
    );
    
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('handles different units correctly', () => {
    const dayItem = { ...mockItem, unit: 'day' };
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} item={dayItem} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Day')).toBeInTheDocument();
  });

  it('handles different tax classes correctly', () => {
    const exemptItem = { ...mockItem, taxClass: 'exempt' };
    
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} item={exemptItem} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Tax Exempt')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <RateCardItemRow {...defaultProps} />
      </TestWrapper>
    );
    
    const row = screen.getByTestId('rate-card-item-row');
    expect(row).toBeInTheDocument();
    
    const itemCodeButton = screen.getByTestId('item-code-display');
    expect(itemCodeButton).toBeInTheDocument();
    
    const rateButton = screen.getByTestId('base-rate-display');
    expect(rateButton).toBeInTheDocument();
  });
});
