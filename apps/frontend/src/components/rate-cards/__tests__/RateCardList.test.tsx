/**
 * RateCardList Component Tests
 * Tests for rate card list display, filtering, and selection
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RateCardList } from '../RateCardList';
import type { RateCard, RateCardsFilters } from '../../../features/rate-cards/types';

// Mock data
const mockRateCards: RateCard[] = [
  {
    id: 'rate-card-1',
    organizationId: 'org-1',
    name: 'Standard Rates',
    version: '1.0',
    description: 'Standard hourly rates',
    currency: 'NZD',
    effectiveFrom: '2024-01-01',
    effectiveUntil: undefined,
    isDefault: true,
    isActive: true,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rate-card-2',
    organizationId: 'org-1',
    name: 'Premium Rates',
    version: '2.0',
    description: 'Premium service rates',
    currency: 'USD',
    effectiveFrom: '2024-01-01',
    effectiveUntil: '2024-12-31',
    isDefault: false,
    isActive: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const defaultFilters: RateCardsFilters = {
  page: 1,
  limit: 25,
  status: 'all',
};

const defaultProps = {
  rateCards: mockRateCards,
  selectedRateCardId: undefined,
  onSelectRateCard: vi.fn(),
  filters: defaultFilters,
  onFiltersChange: vi.fn(),
  isLoading: false,
  error: null,
};

describe('RateCardList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rate cards list', () => {
    render(<RateCardList {...defaultProps} />);
    
    expect(screen.getByText('Rate Cards')).toBeInTheDocument();
    expect(screen.getByText('Standard Rates')).toBeInTheDocument();
    expect(screen.getByText('Premium Rates')).toBeInTheDocument();
  });

  it('displays rate card details correctly', () => {
    render(<RateCardList {...defaultProps} />);
    
    // Check first rate card details
    expect(screen.getByText('Standard Rates')).toBeInTheDocument();
    expect(screen.getByText('Version 1.0 • NZD')).toBeInTheDocument();
    expect(screen.getByText('Standard hourly rates')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    
    // Check that both Active and Inactive badges exist
    const badges = screen.getAllByText('Active');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows inactive status for inactive rate cards', () => {
    render(<RateCardList {...defaultProps} />);
    
    // Premium Rates should show as inactive
    const premiumCard = screen.getByText('Premium Rates').closest('[data-testid="rate-card-item"]');
    expect(premiumCard).toBeInTheDocument();
    expect(premiumCard).toHaveTextContent('Inactive');
  });

  it('highlights selected rate card', () => {
    render(<RateCardList {...defaultProps} selectedRateCardId="rate-card-1" />);
    
    const selectedCard = screen.getByText('Standard Rates').closest('[data-testid="rate-card-item"]');
    expect(selectedCard).toHaveClass('ring-2', 'ring-brand-primary');
  });

  it('calls onSelectRateCard when rate card is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();

    render(<RateCardList {...defaultProps} onSelectRateCard={mockOnSelect} />);
    
    const rateCard = screen.getByText('Standard Rates').closest('[data-testid="rate-card-item"]');
    await user.click(rateCard!);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockRateCards[0]);
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();

    render(<RateCardList {...defaultProps} onFiltersChange={mockOnFiltersChange} />);
    
    const searchInput = screen.getByTestId('rate-cards-search');
    await user.click(searchInput);
    await user.type(searchInput, 'test');
    
    // Check that onChange was called for search
    expect(mockOnFiltersChange).toHaveBeenCalled();
    
    // Check that at least one call included search text
    const calls = mockOnFiltersChange.mock.calls;
    const hasSearchCall = calls.some(call => call[0].search && call[0].search.length > 0);
    expect(hasSearchCall).toBe(true);
  });

  it('handles status filter change', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();

    render(<RateCardList {...defaultProps} onFiltersChange={mockOnFiltersChange} />);
    
    const statusFilter = screen.getByTestId('rate-cards-status-filter');
    await user.selectOptions(statusFilter, 'active');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: 'active',
      page: 1,
    });
  });

  it('handles currency filter change', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();

    render(<RateCardList {...defaultProps} onFiltersChange={mockOnFiltersChange} />);
    
    const currencyFilter = screen.getByTestId('rate-cards-currency-filter');
    await user.selectOptions(currencyFilter, 'USD');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      currency: 'USD',
      page: 1,
    });
  });

  it('shows loading state', () => {
    render(<RateCardList {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Rate Cards')).toBeInTheDocument();
    // Loading skeletons should be present
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Failed to load rate cards');
    render(<RateCardList {...defaultProps} error={error} />);
    
    expect(screen.getAllByText('Failed to load rate cards')).toHaveLength(2);
  });

  it('shows empty state when no rate cards', () => {
    render(<RateCardList {...defaultProps} rateCards={[]} />);
    
    expect(screen.getByText('No rate cards found')).toBeInTheDocument();
    expect(screen.getByText('Create your first rate card to get started')).toBeInTheDocument();
  });

  it('shows filtered empty state', () => {
    render(<RateCardList {...defaultProps} rateCards={[]} filters={{ ...defaultFilters, search: 'nonexistent' }} />);
    
    expect(screen.getByText('No rate cards found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
  });

  it('displays effective date ranges correctly', () => {
    render(<RateCardList {...defaultProps} />);
    
    // Check both date ranges exist
    const dateRanges = screen.getAllByText(/Effective: 1\/1\/2024/);
    expect(dateRanges).toHaveLength(2);
    
    // Check specific pattern for end date
    expect(screen.getByText(/Effective: 1\/1\/2024 - 12\/31\/2024/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RateCardList {...defaultProps} />);
    
    const searchInput = screen.getByTestId('rate-cards-search');
    expect(searchInput).toHaveAttribute('placeholder', 'Search rate cards...');
    
    const statusFilter = screen.getByTestId('rate-cards-status-filter');
    expect(statusFilter).toBeInTheDocument();
    
    const currencyFilter = screen.getByTestId('rate-cards-currency-filter');
    expect(currencyFilter).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<RateCardList {...defaultProps} />);
    
    const searchInput = screen.getByTestId('rate-cards-search');
    const statusFilter = screen.getByTestId('rate-cards-status-filter');
    
    // Tab through form elements
    await user.click(searchInput);
    expect(searchInput).toHaveFocus();
    
    await user.tab();
    expect(statusFilter).toHaveFocus();
  });
});
