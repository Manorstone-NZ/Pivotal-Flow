/**
 * F1A Tenant Admin Portal - Tenant Form Component
 * Secure tenant creation and editing form for platform administrators
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin access only
 * - Input validation with TypeBox schema alignment
 * - No sensitive data exposure
 * - Comprehensive error handling
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Save, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';

// Form validation schema (aligned with backend TypeBox schemas)
const tenantFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  billingEmail: z.string()
    .email('Invalid email address'),
  defaultCurrency: z.string()
    .length(3, 'Currency must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase ISO 4217 code'),
  timezone: z.string()
    .min(1, 'Timezone is required')
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

interface TenantData {
  id: string;
  name: string;
  slug: string;
  billingEmail: string;
  defaultCurrency: string;
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  membershipCount: number;
}

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: TenantData | null; // null for create, TenantData for edit
  mode: 'create' | 'edit';
}

// Common currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
];

// Common timezone options
const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
  { value: 'America/New_York', label: 'EST - Eastern Time' },
  { value: 'America/Los_Angeles', label: 'PST - Pacific Time' },
  { value: 'Europe/London', label: 'GMT - Greenwich Mean Time' },
  { value: 'Europe/Paris', label: 'CET - Central European Time' },
  { value: 'Asia/Tokyo', label: 'JST - Japan Standard Time' },
  { value: 'Pacific/Auckland', label: 'NZST - New Zealand Standard Time' },
  { value: 'Australia/Sydney', label: 'AEST - Australian Eastern Time' },
];

/**
 * TenantForm Component
 * Handles both tenant creation and editing with comprehensive validation
 */
export const TenantForm: React.FC<TenantFormProps> = ({
  isOpen,
  onClose,
  tenant,
  mode
}) => {
  const [submitError, setSubmitError] = useState<string>('');
  const queryClient = useQueryClient();

  // Form setup with validation
  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name || '',
      slug: tenant?.slug || '',
      billingEmail: tenant?.billingEmail || '',
      defaultCurrency: tenant?.defaultCurrency || 'USD',
      timezone: tenant?.timezone || 'UTC'
    }
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      const response = await apiClient.post('/v1/admin/tenants', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      form.reset();
      setSubmitError('');
      onClose();
      logger.info('Tenant created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to create tenant';
      setSubmitError(errorMessage);
      logger.error('Failed to create tenant', { error: error.message });
    }
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      if (!tenant?.id) throw new Error('Tenant ID required for update');
      const response = await apiClient.patch(`/v1/admin/tenants/${tenant.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      setSubmitError('');
      onClose();
      logger.info('Tenant updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to update tenant';
      setSubmitError(errorMessage);
      logger.error('Failed to update tenant', { error: error.message });
    }
  });

  // Form submission
  const onSubmit = (data: TenantFormData) => {
    setSubmitError('');
    
    if (mode === 'create') {
      createTenantMutation.mutate(data);
    } else {
      updateTenantMutation.mutate(data);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (mode === 'create') {
      form.setValue('slug', slug);
    }
  };

  const isLoading = createTenantMutation.isPending || updateTenantMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Tenant' : `Edit Tenant: ${tenant?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new tenant with initial configuration and billing information.'
              : 'Update tenant information and configuration settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tenant name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Slug *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tenant-slug"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground">
                        URL-safe identifier used in API endpoints and URLs
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="billing@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Tenant' : 'Update Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantForm;

