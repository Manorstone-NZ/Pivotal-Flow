/**
 * F2 Rate Card Edit Dialog
 * Modal for editing existing rate cards and managing services
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { ServiceCreateDialog } from './ServiceCreateDialog';
import { ServiceEditDialog } from './ServiceEditDialog';
import { useTenantId } from '../../features/tenancy/context';

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

interface RateCard {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  isActive: boolean;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

interface RateCardEditDialogProps {
  rateCard: RateCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UpdateRateCardForm {
  name: string;
  description?: string;
  currency: string;
  isActive: boolean;
}

const CURRENCIES = [
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

export function RateCardEditDialog({ rateCard, open, onOpenChange, onSuccess }: RateCardEditDialogProps) {
  const tenantId = useTenantId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>(rateCard.services || []);
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UpdateRateCardForm>({
    defaultValues: {
      name: rateCard.name,
      description: rateCard.description || '',
      currency: rateCard.currency,
      isActive: rateCard.isActive
    }
  });

  const currency = watch('currency');
  const isActive = watch('isActive');

  useEffect(() => {
    reset({
      name: rateCard.name,
      description: rateCard.description || '',
      currency: rateCard.currency,
      isActive: rateCard.isActive
    });
    setServices(rateCard.services || []);
  }, [rateCard, reset]);

  const onSubmit = async (data: UpdateRateCardForm) => {
    if (!tenantId) {
      setError('Tenant context required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCard.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.message || 'Failed to update rate card');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rate card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSuccess = () => {
    setCreateServiceOpen(false);
    setEditingService(null);
    // Refresh services list
    refreshServices();
  };

  const refreshServices = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCard.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const updatedRateCard = await response.json();
        setServices(updatedRateCard.services || []);
      }
    } catch (err) {
      // Silently fail - services will be refreshed on dialog close
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCard.id}/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      refreshServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
      setActiveTab('details');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rate Card</DialogTitle>
          <DialogDescription>
            Update rate card details and manage services.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
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
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={currency}
                    onValueChange={(value: string) => setValue('currency', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {isSubmitting ? 'Updating...' : 'Update Rate Card'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Services</h3>
                <p className="text-sm text-gray-500">
                  Manage services within this rate card
                </p>
              </div>
              <Button onClick={() => setCreateServiceOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {services.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Services</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Add services to this rate card to define pricing for different types of work.
                  </p>
                  <Button onClick={() => setCreateServiceOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Buy Price</TableHead>
                        <TableHead>Sell Price</TableHead>
                        <TableHead>Tax Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-sm text-gray-500">
                                    {service.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {service.unitOfMeasure}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {currency} {parseFloat(service.buyPrice).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {currency} {parseFloat(service.sellPrice).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {service.taxClass}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={service.isActive ? 'default' : 'secondary'}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingService(service)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteService(service.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Service Dialogs */}
        <ServiceCreateDialog
          rateCardId={rateCard.id}
          currency={rateCard.currency}
          open={createServiceOpen}
          onOpenChange={setCreateServiceOpen}
          onSuccess={handleServiceSuccess}
        />

        {editingService && (
          <ServiceEditDialog
            rateCardId={rateCard.id}
            service={editingService}
            currency={rateCard.currency}
            open={!!editingService}
            onOpenChange={(open) => !open && setEditingService(null)}
            onSuccess={handleServiceSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
