/**
 * RateCardDrawer Component
 * Side drawer for editing rate card details and managing items
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { RateCardItemRow, RateCardItemTableHeader } from './RateCardItemRow';
import { 
  useRateCardItems, 
  useCreateRateCard, 
  useUpdateRateCard,
  useCreateRateCardItem 
} from '../../features/rate-cards/api';
import type { 
  RateCard, 
  CreateRateCard, 
  UpdateRateCard,
  CreateRateCardItem,
  RateCardItemsFilters 
} from '../../features/rate-cards/types';
import { SUPPORTED_CURRENCIES, RATE_UNITS, TAX_CLASSES } from '../../features/rate-cards/types';

interface RateCardDrawerProps {
  rateCard?: RateCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCreateMode: boolean;
}

export const RateCardDrawer: React.FC<RateCardDrawerProps> = ({
  rateCard,
  isOpen,
  onClose,
  onSuccess,
  isCreateMode,
}) => {
  const [formData, setFormData] = useState<CreateRateCard | UpdateRateCard>({
    name: '',
    version: '1.0',
    description: '',
    currency: 'NZD',
    effectiveFrom: new Date().toISOString().split('T')[0],
    isDefault: false,
  } as CreateRateCard);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsFilters] = useState<RateCardItemsFilters>({
    page: 1,
    limit: 50,
  });
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemData, setNewItemData] = useState<CreateRateCardItem>({
    itemCode: '',
    unit: 'hour',
    baseRate: '',
    currency: 'NZD',
    taxClass: 'standard',
  });

  const createMutation = useCreateRateCard();
  const updateMutation = useUpdateRateCard();
  const createItemMutation = useCreateRateCardItem();

  const { 
    data: itemsData, 
    isLoading: itemsLoading, 
    refetch: refetchItems 
  } = useRateCardItems(rateCard?.id || '', itemsFilters);

  // Reset form when rate card changes
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        name: '',
        version: '1.0',
        description: '',
        currency: 'NZD',
        effectiveFrom: new Date().toISOString().split('T')[0],
        isDefault: false,
      } as CreateRateCard);
    } else if (rateCard) {
      setFormData({
        name: rateCard.name,
        version: rateCard.version,
        description: rateCard.description || '',
        currency: rateCard.currency,
        effectiveFrom: rateCard.effectiveFrom.split('T')[0],
        effectiveUntil: rateCard.effectiveUntil?.split('T')[0],
        isDefault: rateCard.isDefault,
      } as UpdateRateCard);
      setNewItemData(prev => ({ ...prev, currency: rateCard.currency }));
    }
    setErrors({});
  }, [rateCard, isCreateMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors['name'] = 'Name is required';
    }

    if (!formData.currency) {
      newErrors['currency'] = 'Currency is required';
    }

    if (!formData.effectiveFrom) {
      newErrors['effectiveFrom'] = 'Effective from date is required';
    }

    if (formData.effectiveUntil && formData.effectiveFrom) {
      const fromDate = new Date(formData.effectiveFrom);
      const untilDate = new Date(formData.effectiveUntil);
      if (untilDate <= fromDate) {
        newErrors['effectiveUntil'] = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        await createMutation.mutateAsync(formData as CreateRateCard);
      } else if (rateCard) {
        await updateMutation.mutateAsync({ 
          id: rateCard.id, 
          data: formData as UpdateRateCard 
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save rate card:', error);
      setErrors({ ['submit']: 'Failed to save rate card. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!rateCard || !newItemData.itemCode || !newItemData.baseRate) {
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        rateCardId: rateCard.id,
        data: newItemData,
      });
      
      setNewItemData({
        itemCode: '',
        unit: 'hour',
        baseRate: '',
        currency: rateCard.currency,
        taxClass: 'standard',
      });
      setShowAddItemForm(false);
      refetchItems();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleItemUpdate = () => {
    refetchItems();
  };

  const handleItemDelete = (itemId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete item:', itemId);
  };

  if (!isOpen) return null;

  const items = itemsData?.data || [];

  return (
    <div className="h-full flex flex-col bg-surface-card border-l border-surface-border">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {isCreateMode ? 'Create Rate Card' : 'Edit Rate Card'}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
            data-testid="close-drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Basic Information Form */}
          <div>
            <h3 className="text-md font-medium text-text-primary mb-4">Basic Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name || ''}
                onChange={(value) => setFormData({ ...formData, name: value })}
                error={errors['name']}
                required
                disabled={isSubmitting}
                data-testid="rate-card-name"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Version"
                  value={formData.version || ''}
                  onChange={(value) => setFormData({ ...formData, version: value })}
                  disabled={isSubmitting}
                  data-testid="rate-card-version"
                />

                <Select
                  label="Currency"
                  value={formData.currency || ''}
                  onChange={(value) => setFormData({ ...formData, currency: value as string })}
                  error={errors['currency']}
                  required
                  disabled={isSubmitting}
                  data-testid="rate-card-currency"
                  options={SUPPORTED_CURRENCIES.map(currency => ({
                    value: currency,
                    label: currency
                  }))}
                />
              </div>

              <TextArea
                label="Description"
                value={formData.description || ''}
                onChange={(value) => setFormData({ ...formData, description: value })}
                rows={3}
                disabled={isSubmitting}
                data-testid="rate-card-description"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Effective From"
                  type="date"
                  value={formData.effectiveFrom || ''}
                  onChange={(value) => setFormData({ ...formData, effectiveFrom: value })}
                  error={errors['effectiveFrom']}
                  required
                  disabled={isSubmitting}
                  data-testid="rate-card-effective-from"
                />

                <Input
                  label="Effective Until"
                  type="date"
                  value={formData.effectiveUntil || ''}
                  onChange={(value) => setFormData({ ...formData, effectiveUntil: value })}
                  error={errors['effectiveUntil']}
                  disabled={isSubmitting}
                  data-testid="rate-card-effective-until"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  disabled={isSubmitting}
                  className="rounded border-surface-border"
                  data-testid="rate-card-is-default"
                />
                <label htmlFor="isDefault" className="text-sm text-text-primary">
                  Set as default rate card
                </label>
              </div>

              {errors['submit'] && (
                <p className="text-sm text-semantic-error">{errors['submit']}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary text-text-inverse hover:bg-brand-secondary"
                  data-testid="save-rate-card"
                >
                  {isSubmitting ? 'Saving...' : isCreateMode ? 'Create Rate Card' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  data-testid="cancel-rate-card"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* Rate Items Section (only for existing rate cards) */}
          {!isCreateMode && rateCard && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-text-primary">
                  Rate Items ({items.length})
                </h3>
                <Button
                  onClick={() => setShowAddItemForm(!showAddItemForm)}
                  variant="outline"
                  size="sm"
                  data-testid="add-item-button"
                >
                  Add Item
                </Button>
              </div>

              {/* Add Item Form */}
              {showAddItemForm && (
                <div className="mb-4 p-4 border border-surface-border rounded-lg bg-surface-background">
                  <h4 className="text-sm font-medium text-text-primary mb-3">Add New Item</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                      label="Item Code"
                      value={newItemData.itemCode}
                      onChange={(value) => setNewItemData({ ...newItemData, itemCode: value })}
                      placeholder="e.g., DEV01"
                      required
                      data-testid="new-item-code"
                    />
                    <Input
                      label="Base Rate"
                      value={newItemData.baseRate}
                      onChange={(value) => setNewItemData({ ...newItemData, baseRate: value })}
                      placeholder="0.00"
                      required
                      data-testid="new-item-rate"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Select
                      label="Unit"
                      value={newItemData.unit}
                      onChange={(value) => setNewItemData({ ...newItemData, unit: value as string })}
                      data-testid="new-item-unit"
                      options={RATE_UNITS.map(unit => ({
                        value: unit.value,
                        label: unit.label
                      }))}
                    />
                    <Select
                      label="Tax Class"
                      value={newItemData.taxClass || 'standard'}
                      onChange={(value) => setNewItemData({ ...newItemData, taxClass: value as string })}
                      data-testid="new-item-tax-class"
                      options={TAX_CLASSES.map(taxClass => ({
                        value: taxClass.value,
                        label: taxClass.label
                      }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddItem}
                      size="sm"
                      className="bg-brand-primary text-text-inverse hover:bg-brand-secondary"
                      data-testid="save-new-item"
                    >
                      Add Item
                    </Button>
                    <Button
                      onClick={() => setShowAddItemForm(false)}
                      variant="outline"
                      size="sm"
                      data-testid="cancel-new-item"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-surface-border rounded-lg overflow-hidden">
                {itemsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <LoadingSkeleton key={i} className="h-12 rounded" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-text-secondary mb-2">No rate items</div>
                    <div className="text-sm text-text-secondary">
                      Add your first rate item to get started
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <RateCardItemTableHeader />
                    <tbody>
                      {items.map((item) => (
                        <RateCardItemRow
                          key={item.id}
                          item={item}
                          onUpdate={handleItemUpdate}
                          onDelete={handleItemDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
