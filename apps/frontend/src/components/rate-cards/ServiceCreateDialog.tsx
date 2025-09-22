/**
 * F2 Service Create Dialog
 * Modal for creating new services within a rate card
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface ServiceCreateDialogProps {
  rateCardId: string;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateServiceForm {
  name: string;
  description?: string;
  unitOfMeasure: 'hour' | 'day' | 'fixed';
  buyPrice: number;
  sellPrice: number;
  taxClass: string;
  isActive: boolean;
  sortOrder?: number;
}

const UNIT_OF_MEASURE_OPTIONS = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'fixed', label: 'Fixed Price' },
];

const TAX_CLASS_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'zero', label: 'Zero Rate' },
  { value: 'exempt', label: 'Exempt' },
];

export function ServiceCreateDialog({ rateCardId, currency, open, onOpenChange, onSuccess }: ServiceCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateServiceForm>({
    defaultValues: {
      name: '',
      description: '',
      unitOfMeasure: 'hour',
      buyPrice: 0,
      sellPrice: 0,
      taxClass: 'standard',
      isActive: true,
      sortOrder: 0
    }
  });

  const unitOfMeasure = watch('unitOfMeasure');
  const taxClass = watch('taxClass');
  const isActive = watch('isActive');

  const onSubmit = async (data: CreateServiceForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCardId}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          unitOfMeasure: data.unitOfMeasure,
          buyPrice: data.buyPrice,
          sellPrice: data.sellPrice,
          taxClass: data.taxClass,
          isActive: data.isActive,
          sortOrder: data.sortOrder || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service');
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>
            Add a new service to this rate card with pricing information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Service name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 255,
                  message: 'Name must be less than 255 characters'
                }
              })}
              placeholder="e.g., Senior Developer"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description of this service..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
              <Select
                value={unitOfMeasure}
                onValueChange={(value: 'hour' | 'day' | 'fixed') => setValue('unitOfMeasure', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxClass">Tax Class *</Label>
              <Select
                value={taxClass}
                onValueChange={(value: string) => setValue('taxClass', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_CLASS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyPrice">Buy Price ({currency}) *</Label>
              <Input
                id="buyPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('buyPrice', {
                  required: 'Buy price is required',
                  min: {
                    value: 0,
                    message: 'Buy price must be 0 or greater'
                  },
                  valueAsNumber: true
                })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.buyPrice && (
                <p className="text-sm text-red-600">{errors.buyPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sell Price ({currency}) *</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('sellPrice', {
                  required: 'Sell price is required',
                  min: {
                    value: 0,
                    message: 'Sell price must be 0 or greater'
                  },
                  valueAsNumber: true
                })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.sellPrice && (
                <p className="text-sm text-red-600">{errors.sellPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onValueChange={(value: string) => setValue('isActive', value === 'active')}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                {...register('sortOrder', {
                  valueAsNumber: true
                })}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
