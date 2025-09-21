import React, { useState, useCallback } from 'react';
import { Button } from '../Button';
import { Input } from '../ui/input';
// import { Select } from '../ui/select'; // Unused import
import { IconButton } from '../ui/IconButton';
import { useAddLineItem, useUpdateLineItem, useDeleteLineItem } from '../../features/quotes/api';
import type { Quote, QuoteLineItem, LineItem } from '../../features/quotes/api';

interface QuoteLineTableProps {
  quote: Quote;
  onQuoteUpdate?: (updatedQuote: Quote) => void;
  isEditable?: boolean;
  className?: string;
}

interface EditingLineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export const QuoteLineTable: React.FC<QuoteLineTableProps> = ({
  quote,
  onQuoteUpdate,
  isEditable = true,
  className,
}) => {
  const [editingItem, setEditingItem] = useState<EditingLineItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<LineItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addLineItemMutation = useAddLineItem();
  const updateLineItemMutation = useUpdateLineItem();
  const deleteLineItemMutation = useDeleteLineItem();

  const formatCurrency = useCallback((amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const validateLineItem = useCallback((item: Partial<LineItem>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!item.description?.trim()) {
      errors['description'] = 'Description is required';
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors['quantity'] = 'Quantity must be greater than 0';
    }
    
    if (!item.unitPrice || item.unitPrice < 0) {
      errors['unitPrice'] = 'Unit price must be 0 or greater';
    }
    
    return errors;
  }, []);

  const handleStartEdit = useCallback((lineItem: QuoteLineItem) => {
    setEditingItem({
      id: lineItem.id,
      description: lineItem.description,
      quantity: lineItem.quantity.toString(),
      unitPrice: lineItem.unitPrice.toString(),
    });
    setErrors({});
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setErrors({});
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingItem) return;

    const itemData: Partial<LineItem> = {
      description: editingItem.description,
      quantity: parseFloat(editingItem.quantity),
      unitPrice: parseFloat(editingItem.unitPrice),
    };

    const validationErrors = validateLineItem(itemData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedQuote = await updateLineItemMutation.mutateAsync({
        quoteId: quote.id,
        lineItemId: editingItem.id,
        data: itemData,
      });
      
      onQuoteUpdate?.(updatedQuote);
      setEditingItem(null);
      setErrors({});
    } catch (error) {
      console.error('Failed to update line item:', error);
      setErrors({ submit: 'Failed to update line item. Please try again.' });
    }
  }, [editingItem, quote.id, updateLineItemMutation, onQuoteUpdate, validateLineItem]);

  const handleDeleteItem = useCallback(async (lineItemId: string) => {
    if (!confirm('Are you sure you want to delete this line item?')) return;

    try {
      const updatedQuote = await deleteLineItemMutation.mutateAsync({
        quoteId: quote.id,
        lineItemId,
      });
      
      onQuoteUpdate?.(updatedQuote);
    } catch (error) {
      console.error('Failed to delete line item:', error);
    }
  }, [quote.id, deleteLineItemMutation, onQuoteUpdate]);

  const handleAddItem = useCallback(async () => {
    const validationErrors = validateLineItem(newItem);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedQuote = await addLineItemMutation.mutateAsync({
        quoteId: quote.id,
        data: newItem as LineItem,
      });
      
      onQuoteUpdate?.(updatedQuote);
      setNewItem({ description: '', quantity: 1, unitPrice: 0 });
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to add line item:', error);
      setErrors({ submit: 'Failed to add line item. Please try again.' });
    }
  }, [newItem, quote.id, addLineItemMutation, onQuoteUpdate, validateLineItem]);

  // Removed handleKeyPress as Input component doesn't support onKeyDown prop

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Line Items</h3>
        {isEditable && (
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || !!editingItem}
            size="sm"
          >
            Add Line Item
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-surface-border">
          <thead className="bg-surface-header">
            <tr>
              <th className="border border-surface-border px-4 py-3 text-left text-sm font-medium text-text-primary">
                Description
              </th>
              <th className="border border-surface-border px-4 py-3 text-right text-sm font-medium text-text-primary">
                Quantity
              </th>
              <th className="border border-surface-border px-4 py-3 text-right text-sm font-medium text-text-primary">
                Unit Price
              </th>
              <th className="border border-surface-border px-4 py-3 text-right text-sm font-medium text-text-primary">
                Total
              </th>
              {isEditable && (
                <th className="border border-surface-border px-4 py-3 text-center text-sm font-medium text-text-primary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {(quote.lineItems || []).map((lineItem) => (
              <tr key={lineItem.id} className="hover:bg-surface-background/50">
                {editingItem?.id === lineItem.id ? (
                  // Editing mode
                  <>
                    <td className="border border-surface-border px-4 py-3">
                      <Input
                        value={editingItem.description}
                        onChange={(value: string) => setEditingItem({ ...editingItem, description: value })}
                        placeholder="Item description"
                        error={errors['description']}
                        autoFocus
                      />
                    </td>
                    <td className="border border-surface-border px-4 py-3">
                      <Input
                        type="number"
                        value={editingItem.quantity}
                        onChange={(value: string) => setEditingItem({ ...editingItem, quantity: value })}
                        placeholder="0"
                        error={errors['quantity']}
                      />
                    </td>
                    <td className="border border-surface-border px-4 py-3">
                      <Input
                        type="number"
                        value={editingItem.unitPrice}
                        onChange={(value: string) => setEditingItem({ ...editingItem, unitPrice: value })}
                        placeholder="0.00"
                        error={errors['unitPrice']}
                      />
                    </td>
                    <td className="border border-surface-border px-4 py-3 text-right text-text-primary">
                      {formatCurrency(
                        parseFloat(editingItem.quantity || '0') * parseFloat(editingItem.unitPrice || '0'),
                        quote.metadata['currency'] as string || 'NZD'
                      )}
                    </td>
                    <td className="border border-surface-border px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateLineItemMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={updateLineItemMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  // Display mode
                  <>
                    <td className="border border-surface-border px-4 py-3 text-text-primary">
                      {lineItem.description}
                    </td>
                    <td className="border border-surface-border px-4 py-3 text-right text-text-primary">
                      {lineItem.quantity}
                    </td>
                    <td className="border border-surface-border px-4 py-3 text-right text-text-primary">
                      {formatCurrency(lineItem.unitPrice, quote.metadata['currency'] as string || 'NZD')}
                    </td>
                    <td className="border border-surface-border px-4 py-3 text-right text-text-primary font-medium">
                      {formatCurrency(lineItem.totalPrice, quote.metadata['currency'] as string || 'NZD')}
                    </td>
                    {isEditable && (
                      <td className="border border-surface-border px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            }
                            onClick={() => handleStartEdit(lineItem)}
                            disabled={!!editingItem || showAddForm}
                            aria-label="Edit line item"
                            size="sm"
                          />
                          <IconButton
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            }
                            onClick={() => handleDeleteItem(lineItem.id)}
                            disabled={!!editingItem || showAddForm || deleteLineItemMutation.isPending}
                            aria-label="Delete line item"
                            size="sm"
                            variant="ghost"
                          />
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            
            {/* Add new item form */}
            {showAddForm && (
              <tr className="bg-surface-background/30">
                <td className="border border-surface-border px-4 py-3">
                  <Input
                    value={newItem.description || ''}
                    onChange={(value: string) => setNewItem({ ...newItem, description: value })}
                    placeholder="Item description"
                    error={errors['description']}
                    autoFocus
                  />
                </td>
                <td className="border border-surface-border px-4 py-3">
                  <Input
                    type="number"
                    value={newItem.quantity?.toString() || '1'}
                    onChange={(value: string) => setNewItem({ ...newItem, quantity: parseFloat(value) || 1 })}
                    placeholder="1"
                    error={errors['quantity']}
                  />
                </td>
                <td className="border border-surface-border px-4 py-3">
                  <Input
                    type="number"
                    value={newItem.unitPrice?.toString() || '0'}
                    onChange={(value: string) => setNewItem({ ...newItem, unitPrice: parseFloat(value) || 0 })}
                    placeholder="0.00"
                    error={errors['unitPrice']}
                  />
                </td>
                <td className="border border-surface-border px-4 py-3 text-right text-text-primary">
                  {formatCurrency(
                    (newItem.quantity || 0) * (newItem.unitPrice || 0),
                    quote.metadata['currency'] as string || 'NZD'
                  )}
                </td>
                <td className="border border-surface-border px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddItem}
                      disabled={addLineItemMutation.isPending}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewItem({ description: '', quantity: 1, unitPrice: 0 });
                        setErrors({});
                      }}
                      disabled={addLineItemMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Error display */}
      {errors['submit'] && (
        <div className="mt-4 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
          <p className="text-semantic-error text-sm">{errors['submit']}</p>
        </div>
      )}

      {/* Empty state */}
      {(quote.lineItems?.length || 0) === 0 && !showAddForm && (
        <div className="text-center py-8 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No line items yet</p>
          <p className="text-sm mb-4">Add line items to build your quote</p>
          {isEditable && (
            <Button onClick={() => setShowAddForm(true)}>
              Add First Line Item
            </Button>
          )}
        </div>
      )}

      {/* Accessibility: Live region for total changes */}
      <div aria-live="polite" aria-label="Quote totals" className="sr-only">
        Quote total: {formatCurrency(quote.totalAmount, quote.metadata['currency'] as string || 'NZD')}
      </div>
    </div>
  );
};
