/**
 * RateCardItemRow Component
 * Editable row for rate card items with inline editing
 */

import React, { useState, useCallback } from 'react';
import { Money, CurrencyInput } from './Money';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../Button';
import { Badge } from '../ui/badge';
import { useUpdateRateCardItem } from '../../features/rate-cards/api';
import type { RateCardItem, UpdateRateCardItem } from '../../features/rate-cards/types';
import { RATE_UNITS, TAX_CLASSES } from '../../features/rate-cards/types';

interface RateCardItemRowProps {
  item: RateCardItem;
  onUpdate?: (item: RateCardItem) => void;
  onDelete?: (itemId: string) => void;
  isReadOnly?: boolean;
}

export const RateCardItemRow: React.FC<RateCardItemRowProps> = ({
  item,
  onUpdate,
  onDelete,
  isReadOnly = false,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UpdateRateCardItem>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const updateMutation = useUpdateRateCardItem();

  const startEditing = useCallback((field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue });
    setValidationErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setEditValues({});
    setValidationErrors({});
  }, []);

  const saveField = useCallback(async (field: string, value: any) => {
    // Validate the field
    const errors: Record<string, string> = {};

    if (field === 'baseRate') {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= 0) {
        errors[field] = 'Rate must be a positive number';
      }
    } else if (field === 'itemCode') {
      if (!value || value.trim().length === 0) {
        errors[field] = 'Item code is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const updateData: UpdateRateCardItem = { [field]: value };
      const updatedItem = await updateMutation.mutateAsync({ 
        id: item.id, 
        data: updateData 
      });
      
      onUpdate?.(updatedItem);
      setEditingField(null);
      setEditValues({});
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to update item:', error);
      setValidationErrors({ [field]: 'Failed to save changes' });
    }
  }, [item.id, updateMutation, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = editValues[field as keyof UpdateRateCardItem];
      saveField(field, value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }, [editValues, saveField, cancelEditing]);

  const handleBlur = useCallback((field: string) => {
    const value = editValues[field as keyof UpdateRateCardItem];
    if (value !== undefined) {
      saveField(field, value);
    } else {
      cancelEditing();
    }
  }, [editValues, saveField, cancelEditing]);

  const effectiveFromDate = new Date(item.effectiveFrom);
  const effectiveUntilDate = item.effectiveUntil ? new Date(item.effectiveUntil) : null;
  const now = new Date();
  
  const isCurrentlyActive = item.isActive && 
    effectiveFromDate <= now && 
    (!effectiveUntilDate || effectiveUntilDate >= now);

  return (
    <tr 
      className={`
        border-b border-surface-border hover:bg-surface-header/50 transition-colors
        ${!isCurrentlyActive ? 'opacity-60' : ''}
      `}
      data-testid="rate-card-item-row"
    >
      {/* Item Code */}
      <td className="px-4 py-3">
        {editingField === 'itemCode' ? (
          <input
            type="text"
            value={editValues.itemCode || ''}
            onChange={(e) => setEditValues({ ...editValues, itemCode: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, 'itemCode')}
            onBlur={() => handleBlur('itemCode')}
            className={`
              w-full px-2 py-1 border rounded text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-primary
              bg-surface-card border-surface-border
              ${validationErrors['itemCode'] ? 'border-semantic-error' : ''}
            `}
            autoFocus
            data-testid="item-code-input"
          />
        ) : (
          <button
            onClick={() => !isReadOnly && startEditing('itemCode', item.itemCode)}
            disabled={isReadOnly}
            className={`
              text-left font-mono text-sm hover:bg-surface-header/50 px-2 py-1 rounded transition-colors
              ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
            `}
            data-testid="item-code-display"
          >
            {item.itemCode}
          </button>
        )}
        {validationErrors['itemCode'] && (
          <p className="text-xs text-semantic-error mt-1">{validationErrors['itemCode']}</p>
        )}
      </td>

      {/* Base Rate */}
      <td className="px-4 py-3">
        {editingField === 'baseRate' ? (
          <CurrencyInput
            value={editValues.baseRate || item.baseRate}
            currency={item.currency}
            onChange={(value) => setEditValues({ ...editValues, baseRate: value })}
            onBlur={() => handleBlur('baseRate')}
            className="w-24 text-sm"
            error={validationErrors['baseRate']}
            data-testid="base-rate-input"
          />
        ) : (
          <button
            onClick={() => !isReadOnly && startEditing('baseRate', item.baseRate)}
            disabled={isReadOnly}
            className={`
              text-left hover:bg-surface-header/50 px-2 py-1 rounded transition-colors
              ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
            `}
            data-testid="base-rate-display"
          >
            <Money amount={item.baseRate} currency={item.currency} />
          </button>
        )}
      </td>

      {/* Unit */}
      <td className="px-4 py-3">
        {editingField === 'unit' ? (
          <Select
            value={editValues.unit || item.unit}
            onValueChange={(value: string) => {
              setEditValues({ ...editValues, unit: value as string });
              saveField('unit', value);
            }}
            className="w-20 text-sm"
            data-testid="unit-select"
            options={RATE_UNITS.map(unit => ({
              value: unit.value,
              label: unit.label
            }))}
          />
        ) : (
          <button
            onClick={() => !isReadOnly && startEditing('unit', item.unit)}
            disabled={isReadOnly}
            className={`
              text-left hover:bg-surface-header/50 px-2 py-1 rounded transition-colors text-sm
              ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
            `}
            data-testid="unit-display"
          >
            {RATE_UNITS.find(u => u.value === item.unit)?.label || item.unit}
          </button>
        )}
      </td>

      {/* Tax Class */}
      <td className="px-4 py-3">
        {editingField === 'taxClass' ? (
          <Select
            value={editValues.taxClass || item.taxClass}
            onValueChange={(value: string) => {
              setEditValues({ ...editValues, taxClass: value as string });
              saveField('taxClass', value);
            }}
            className="w-32 text-sm"
            data-testid="tax-class-select"
            options={TAX_CLASSES.map(taxClass => ({
              value: taxClass.value,
              label: taxClass.label
            }))}
          />
        ) : (
          <button
            onClick={() => !isReadOnly && startEditing('taxClass', item.taxClass)}
            disabled={isReadOnly}
            className={`
              text-left hover:bg-surface-header/50 px-2 py-1 rounded transition-colors text-sm
              ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
            `}
            data-testid="tax-class-display"
          >
            {TAX_CLASSES.find(tc => tc.value === item.taxClass)?.label || item.taxClass}
          </button>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge 
          variant={isCurrentlyActive ? 'success' : 'default'} 
          size="sm"
        >
          {isCurrentlyActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>

      {/* Effective Period */}
      <td className="px-4 py-3 text-sm text-text-secondary">
        <div>From: {effectiveFromDate.toLocaleDateString()}</div>
        {effectiveUntilDate && (
          <div>Until: {effectiveUntilDate.toLocaleDateString()}</div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(item.id)}
              className="text-semantic-error hover:text-semantic-error hover:bg-semantic-error/10"
              data-testid="delete-item-button"
            >
              Delete
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};

// Table header component
export const RateCardItemTableHeader: React.FC = () => (
  <thead className="bg-surface-header">
    <tr>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Item Code
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Rate
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Unit
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Tax Class
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Status
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Effective Period
      </th>
      <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">
        Actions
      </th>
    </tr>
  </thead>
);
