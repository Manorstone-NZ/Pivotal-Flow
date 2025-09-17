import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useSetDiscount } from '../../features/quotes/api';
import type { Quote, Discount } from '../../features/quotes/api';

interface DiscountEditorProps {
  quote: Quote;
  onQuoteUpdate?: (updatedQuote: Quote) => void;
  isEditable?: boolean;
  className?: string;
}

export const DiscountEditor: React.FC<DiscountEditorProps> = ({
  quote,
  onQuoteUpdate,
  isEditable = true,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [discountData, setDiscountData] = useState<Discount>({
    type: (quote.metadata['discountType'] as 'percentage' | 'fixed') || 'percentage',
    value: parseFloat(quote.metadata['discountValue'] as string) || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setDiscountMutation = useSetDiscount();

  const formatCurrency = useCallback((amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const validateDiscount = useCallback((discount: Discount): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (discount.value < 0) {
      errors['value'] = 'Discount value cannot be negative';
    }
    
    if (discount.type === 'percentage' && discount.value > 100) {
      errors['value'] = 'Percentage discount cannot exceed 100%';
    }
    
    if (discount.type === 'fixed' && discount.value > quote.subtotal) {
      errors['value'] = 'Fixed discount cannot exceed subtotal';
    }
    
    return errors;
  }, [quote.subtotal]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setDiscountData({
      type: (quote.metadata['discountType'] as 'percentage' | 'fixed') || 'percentage',
      value: parseFloat(quote.metadata['discountValue'] as string) || 0,
    });
    setErrors({});
  }, [quote.metadata]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setDiscountData({
      type: (quote.metadata['discountType'] as 'percentage' | 'fixed') || 'percentage',
      value: parseFloat(quote.metadata['discountValue'] as string) || 0,
    });
    setErrors({});
  }, [quote.metadata]);

  const handleSaveDiscount = useCallback(async () => {
    const validationErrors = validateDiscount(discountData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedQuote = await setDiscountMutation.mutateAsync({
        quoteId: quote.id,
        discount: discountData,
      });
      
      onQuoteUpdate?.(updatedQuote);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to update discount:', error);
      setErrors({ submit: 'Failed to update discount. Please try again.' });
    }
  }, [discountData, quote.id, setDiscountMutation, onQuoteUpdate, validateDiscount]);

  const handleRemoveDiscount = useCallback(async () => {
    if (!confirm('Are you sure you want to remove the discount?')) return;

    try {
      const updatedQuote = await setDiscountMutation.mutateAsync({
        quoteId: quote.id,
        discount: { type: 'percentage', value: 0 },
      });
      
      onQuoteUpdate?.(updatedQuote);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to remove discount:', error);
      setErrors({ submit: 'Failed to remove discount. Please try again.' });
    }
  }, [quote.id, setDiscountMutation, onQuoteUpdate]);

  // Removed handleKeyPress as Input component doesn't support onKeyDown

  const currentDiscountAmount = parseFloat(quote.metadata['discountAmount'] as string) || 0;
  const hasDiscount = currentDiscountAmount > 0;
  const currency = quote.metadata['currency'] as string || 'NZD';

  return (
    <Card className={className || ''}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Discount</h3>
            {isEditable && !isEditing && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEdit}
                >
                  {hasDiscount ? 'Edit Discount' : 'Add Discount'}
                </Button>
                {hasDiscount && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveDiscount}
                    disabled={setDiscountMutation.isPending}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            // Editing mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Discount Type"
                    value={discountData.type}
                    onChange={(value) => setDiscountData({ ...discountData, type: value as 'percentage' | 'fixed' })}
                    options={[
                      { value: 'percentage', label: 'Percentage (%)' },
                      { value: 'fixed', label: 'Fixed Amount' },
                    ]}
                  />
                </div>
                <div>
                  <Input
                    label={discountData.type === 'percentage' ? 'Percentage' : 'Amount'}
                    type="number"
                    value={discountData.value.toString()}
                    onChange={(value) => setDiscountData({ ...discountData, value: parseFloat(value) || 0 })}
                    placeholder={discountData.type === 'percentage' ? '10' : '100.00'}
                    error={errors['value']}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-surface-background p-3 rounded-lg border border-surface-border">
                <div className="text-sm text-text-secondary mb-2">Preview:</div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="text-semantic-success">
                    {discountData.type === 'percentage' 
                      ? `-${formatCurrency(quote.subtotal * (discountData.value / 100), currency)}`
                      : `-${formatCurrency(discountData.value, currency)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-surface-border pt-2 mt-2">
                  <span>New Total:</span>
                  <span>
                    {discountData.type === 'percentage' 
                      ? formatCurrency(quote.subtotal * (1 - discountData.value / 100) + quote.taxAmount, currency)
                      : formatCurrency(quote.subtotal - discountData.value + quote.taxAmount, currency)
                    }
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={setDiscountMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveDiscount}
                  disabled={setDiscountMutation.isPending}
                >
                  {setDiscountMutation.isPending ? 'Saving...' : 'Apply Discount'}
                </Button>
              </div>

              {/* Error display */}
              {errors['submit'] && (
                <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
                  <p className="text-semantic-error text-sm">{errors['submit']}</p>
                </div>
              )}
            </div>
          ) : (
            // Display mode
            <div className="space-y-3">
              {hasDiscount ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary capitalize">
                      {quote.metadata['discountType'] as string}
                      {quote.metadata['discountType'] === 'percentage' && (
                        <span className="text-xs ml-1">({quote.metadata['discountValue'] as string}%)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Discount Amount:</span>
                    <span className="text-semantic-success font-medium">
                      -{formatCurrency(currentDiscountAmount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-text-secondary">
                    <span>Applied to subtotal of {formatCurrency(quote.subtotal, currency)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-text-secondary">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-.707.293H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-sm">No discount applied</p>
                  {isEditable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEdit}
                      className="mt-2"
                    >
                      Add Discount
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
