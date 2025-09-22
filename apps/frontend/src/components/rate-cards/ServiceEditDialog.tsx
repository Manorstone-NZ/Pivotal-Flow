/**
 * F2 Service Edit Dialog
 * Modal for editing existing services within a rate card
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface Service {
  id: string;
  name: string;
  description: string | null;
  unitOfMeasure: 'hour' | 'day' | 'fixed';
  buyPrice: string;
  sellPrice: string;
  taxClass: string;
  isActive: boolean;
  sortOrder: number;
}

interface ServiceEditDialogProps {
  rateCardId: string;
  service: Service;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UpdateServiceForm {
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

export function ServiceEditDialog({ rateCardId, service, currency, open, onOpenChange, onSuccess }: ServiceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UpdateServiceForm>({
    defaultValues: {
      name: service.name,
      description: service.description || '',
      unitOfMeasure: service.unitOfMeasure,
      buyPrice: parseFloat(service.buyPrice),
      sellPrice: parseFloat(service.sellPrice),
      taxClass: service.taxClass,
      isActive: service.isActive,
      sortOrder: service.sortOrder
    }
  });

  const unitOfMeasure = watch('unitOfMeasure');
  const taxClass = watch('taxClass');
  const isActive = watch('isActive');

  useEffect(() => {
    reset({
      name: service.name,
      description: service.description || '',
      unitOfMeasure: service.unitOfMeasure,
      buyPrice: parseFloat(service.buyPrice),
      sellPrice: parseFloat(service.sellPrice),
      taxClass: service.taxClass,
      isActive: service.isActive,
      sortOrder: service.sortOrder
    });
  }, [service, reset]);

  const onSubmit = async (data: UpdateServiceForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCardId}/services/${service.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.message || 'Failed to update service');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
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
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update service details and pricing information.
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
              {isSubmitting ? 'Updating...' : 'Update Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
