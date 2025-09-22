/**
 * F2 Rate Card Create Dialog
 * Modal for creating new rate cards
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
import { useTenantId } from '../../features/tenancy/context';

interface RateCardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateRateCardForm {
  name: string;
  description?: string;
  currency: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  isActive: boolean;
}

const CURRENCIES = [
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

export function RateCardCreateDialog({ open, onOpenChange, onSuccess }: RateCardCreateDialogProps) {
  const tenantId = useTenantId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateRateCardForm>({
    defaultValues: {
      name: '',
      description: '',
      currency: 'NZD',
      effectiveFrom: new Date().toISOString().split('T')[0], // Today's date
      effectiveUntil: '',
      isActive: true
    }
  });

  const currency = watch('currency');
  const isActive = watch('isActive');

  const onSubmit = async (data: CreateRateCardForm) => {
    if (!tenantId) {
      setError('Tenant context required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/v1/rate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          currency: data.currency,
          isActive: data.isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create rate card');
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rate card');
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Rate Card</DialogTitle>
          <DialogDescription>
            Create a new rate card to organize your services and pricing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 255,
                  message: 'Name must be less than 255 characters'
                }
              })}
              placeholder="e.g., Standard Development Rates"
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
              placeholder="Optional description of this rate card..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={currency}
              onValueChange={(value: string) => setValue('currency', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveFrom">Effective From *</Label>
            <Input
              id="effectiveFrom"
              type="date"
              {...register('effectiveFrom', {
                required: 'Effective from date is required'
              })}
              disabled={isSubmitting}
            />
            {errors.effectiveFrom && (
              <p className="text-sm text-red-600">{errors.effectiveFrom.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveUntil">Effective Until</Label>
            <Input
              id="effectiveUntil"
              type="date"
              {...register('effectiveUntil')}
              disabled={isSubmitting}
            />
            {errors.effectiveUntil && (
              <p className="text-sm text-red-600">{errors.effectiveUntil.message}</p>
            )}
          </div>

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
              {isSubmitting ? 'Creating...' : 'Create Rate Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
