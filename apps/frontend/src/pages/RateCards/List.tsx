/**
 * Rate Cards List Page
 * Main page with list + side drawer editor for rate cards management
 */

import React, { useState, useCallback } from 'react';
import { Button } from '../../components/Button';
import { RateCardList } from '../../components/rate-cards/RateCardList';
import { RateCardDrawer } from '../../components/rate-cards/RateCardDrawer';
import { useRateCards } from '../../features/rate-cards/api';
import type { RateCard, RateCardsFilters } from '../../features/rate-cards/types';

export const RateCardsListPage: React.FC = () => {
  const [filters, setFilters] = useState<RateCardsFilters>({
    page: 1,
    limit: 25,
    status: 'all',
  });
  
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { data, isLoading, error, refetch } = useRateCards(filters);

  const handleSelectRateCard = useCallback((rateCard: RateCard) => {
    setSelectedRateCard(rateCard);
    setIsCreateMode(false);
    setIsDrawerOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedRateCard(null);
    setIsCreateMode(true);
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedRateCard(null);
    setIsCreateMode(false);
  }, []);

  const handleDrawerSuccess = useCallback(() => {
    refetch(); // Refresh the list
    if (isCreateMode) {
      setIsDrawerOpen(false);
      setIsCreateMode(false);
    }
  }, [isCreateMode, refetch]);

  const rateCards = data?.data || [];

  return (
    <div className="h-screen flex flex-col bg-surface-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-surface-border bg-surface-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Rate Cards</h1>
              <p className="text-text-secondary mt-1">
                Manage pricing structures and rate items
              </p>
            </div>
            <Button 
              onClick={handleCreateClick}
              className="bg-brand-primary text-text-inverse hover:bg-brand-secondary"
              data-testid="create-rate-card-button"
            >
              Create Rate Card
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Rate Cards List */}
        <div className={`
          flex-shrink-0 border-r border-surface-border bg-surface-card
          transition-all duration-300 ease-in-out
          ${isDrawerOpen ? 'w-80' : 'w-96'}
        `}>
          <RateCardList
            rateCards={rateCards}
            selectedRateCardId={selectedRateCard?.id}
            onSelectRateCard={handleSelectRateCard}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Right Panel - Details/Editor */}
        <div className="flex-1 relative">
          {!isDrawerOpen ? (
            <div className="h-full flex items-center justify-center bg-surface-background">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-header flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-text-secondary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No Rate Card Selected
                </h3>
                <p className="text-text-secondary mb-4">
                  Select a rate card from the list to view and edit its details and items
                </p>
                <Button 
                  onClick={handleCreateClick}
                  variant="outline"
                  data-testid="create-rate-card-empty-state"
                >
                  Create New Rate Card
                </Button>
              </div>
            </div>
          ) : (
            <RateCardDrawer
              rateCard={selectedRateCard}
              isOpen={isDrawerOpen}
              onClose={handleDrawerClose}
              onSuccess={handleDrawerSuccess}
              isCreateMode={isCreateMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RateCardsListPage;
