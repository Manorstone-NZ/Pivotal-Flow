/**
 * RateCardList Component
 * Displays a list of rate cards with search, filtering, and selection
 */

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import type { RateCard, RateCardsFilters } from '../../features/rate-cards/types';
import { SUPPORTED_CURRENCIES } from '../../features/rate-cards/types';

interface RateCardListProps {
  rateCards: RateCard[];
  selectedRateCardId?: string | undefined;
  onSelectRateCard: (rateCard: RateCard) => void;
  filters: RateCardsFilters;
  onFiltersChange: (filters: RateCardsFilters) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const RateCardList: React.FC<RateCardListProps> = ({
  rateCards,
  selectedRateCardId,
  onSelectRateCard,
  filters,
  onFiltersChange,
  isLoading = false,
  error = null,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page on search
    });
  };

  const handleStatusChange = (value: string | number) => {
    onFiltersChange({
      ...filters,
      status: (value as 'active' | 'inactive' | 'all') || undefined,
      page: 1,
    });
  };

  const handleCurrencyChange = (value: string | number) => {
    onFiltersChange({
      ...filters,
      currency: (value as string) || undefined,
      page: 1,
    });
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-semantic-error mb-2">Failed to load rate cards</div>
        <div className="text-sm text-text-secondary">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Rate Cards</h2>
        
        {/* Filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search rate cards..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full"
            data-testid="rate-cards-search"
          />
          
          <div className="flex gap-2">
            <Select
              value={filters.status || 'all'}
              onChange={handleStatusChange}
              className="flex-1"
              data-testid="rate-cards-status-filter"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            
            <Select
              value={filters.currency || ''}
              onChange={handleCurrencyChange}
              className="flex-1"
              data-testid="rate-cards-currency-filter"
              options={[
                { value: '', label: 'All Currencies' },
                ...SUPPORTED_CURRENCIES.map(currency => ({
                  value: currency,
                  label: currency
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : rateCards.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-text-secondary mb-2">No rate cards found</div>
            <div className="text-sm text-text-secondary">
              {filters.search ? 'Try adjusting your search terms' : 'Create your first rate card to get started'}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {rateCards.map((rateCard) => (
              <RateCardItem
                key={rateCard.id}
                rateCard={rateCard}
                isSelected={selectedRateCardId === rateCard.id}
                onClick={() => onSelectRateCard(rateCard)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface RateCardItemProps {
  rateCard: RateCard;
  isSelected: boolean;
  onClick: () => void;
}

const RateCardItem: React.FC<RateCardItemProps> = ({
  rateCard,
  isSelected,
  onClick,
}) => {
  const effectiveFromDate = new Date(rateCard.effectiveFrom);
  const effectiveUntilDate = rateCard.effectiveUntil ? new Date(rateCard.effectiveUntil) : null;
  const now = new Date();
  
  const isCurrentlyActive = rateCard.isActive && 
    effectiveFromDate <= now && 
    (!effectiveUntilDate || effectiveUntilDate >= now);

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-brand-primary bg-brand-primary/5' : 'hover:bg-surface-header/50'}
      `}
      onClick={onClick}
      data-testid="rate-card-item"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-primary truncate">
              {rateCard.name}
            </h3>
            <p className="text-sm text-text-secondary">
              Version {rateCard.version} • {rateCard.currency}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {rateCard.isDefault && (
              <Badge variant="secondary" size="sm">Default</Badge>
            )}
            <Badge 
              variant={isCurrentlyActive ? 'success' : 'default'} 
              size="sm"
            >
              {isCurrentlyActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {rateCard.description && (
          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
            {rateCard.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Effective: {effectiveFromDate.toLocaleDateString()}
            {effectiveUntilDate && ` - ${effectiveUntilDate.toLocaleDateString()}`}
          </span>
          <span>
            Updated {new Date(rateCard.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading skeleton for the rate card list
export const RateCardListSkeleton: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b border-surface-border">
      <LoadingSkeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <LoadingSkeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-10 flex-1" />
          <LoadingSkeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
    <div className="flex-1 p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  </div>
);
