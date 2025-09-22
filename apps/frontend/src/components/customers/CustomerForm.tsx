/**
 * Customer Form Component
 * Form for creating and editing customers with validation
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Type, type Static } from '@sinclair/typebox';

import { useCreateCustomer, useUpdateCustomer, type Customer, type CreateCustomerData, type UpdateCustomerData } from '../../features/customers/api';
import { Button } from '../Button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// TypeBox schema for frontend validation (matching backend approach)
const CustomerFormSchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  legalName: Type.Optional(Type.String({ maxLength: 255 })),
  industry: Type.Optional(Type.String({ maxLength: 100 })),
  website: Type.Optional(Type.String({ format: 'uri' })),
  description: Type.Optional(Type.String()),
  customerType: Type.Union([Type.Literal('business'), Type.Literal('individual')]),
  source: Type.Optional(Type.String({ maxLength: 50 })),
  rating: Type.Optional(Type.Number({ minimum: 0, maximum: 5 })),
  // Address
  street: Type.Optional(Type.String()),
  suburb: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  postcode: Type.Optional(Type.String()),
  country: Type.Optional(Type.String()),
  // Contact
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: 'email' })),
});

type CustomerFormData = Static<typeof CustomerFormSchema>;

// Simple validation function using TypeBox schema
// const validateCustomerForm = (data: CustomerFormData): Record<string, string> => {
//   const errors: Record<string, string> = {};
//   
//   if (!data.companyName || data.companyName.trim().length === 0) {
//     errors.companyName = 'Company name is required';
//   }
//   
//   if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
//     errors.email = 'Invalid email format';
//   }
  
//   if (data.website && data.website && !/^https?:\/\/.+/.test(data.website)) {
//     errors.website = 'Invalid website URL';
//   }
//   
//   return errors;
// };

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    mode: 'onChange',
    defaultValues: customer ? {
      companyName: customer.companyName,
      legalName: customer.legalName || '',
      industry: customer.industry || '',
      website: customer.website || '',
      description: customer.description || '',
      customerType: customer.customerType,
      source: customer.source || '',
      rating: customer.rating || 0,
      street: customer.street || '',
      suburb: customer.suburb || '',
      city: customer.city || '',
      region: customer.region || '',
      postcode: customer.postcode || '',
      country: customer.country || '',
      phone: customer.phone || '',
      email: customer.email || '',
    } : {
      customerType: 'business' as const,
      companyName: '',
      rating: 0,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        const result = await updateCustomerMutation.mutateAsync({ 
          id: customer.id, 
          data: data as UpdateCustomerData 
        });
        onSuccess(result.data);
      } else {
        const result = await createCustomerMutation.mutateAsync(data as CreateCustomerData);
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
      // Show error to user
      alert(`Failed to ${isEditing ? 'update' : 'create'} customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <Input
              id="companyName"
              {...register('companyName', { required: 'Company name is required' })}
              placeholder="Enter company name"
              required
              aria-invalid={!!errors.companyName}
              aria-describedby={errors.companyName ? 'companyName-error' : undefined}
            />
            {errors.companyName && (
              <p id="companyName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name
            </label>
            <Input
              id="legalName"
              {...register('legalName')}
              placeholder="Legal business name"
            />
          </div>

          <div>
            <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type *
            </label>
            <select 
              id="customerType"
              {...register('customerType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option value="business">Business</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Input
              id="industry"
              {...register('industry')}
              placeholder="e.g., Technology, Healthcare"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+64 21 123 4567"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              id="website"
              {...register('website')}
              placeholder="https://company.com"
              aria-invalid={!!errors.website}
              aria-describedby={errors.website ? 'website-error' : undefined}
            />
            {errors.website && (
              <p id="website-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Lead Source
            </label>
            <Input
              id="source"
              {...register('source')}
              placeholder="e.g., Website, Referral, Cold Call"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <TextArea
            id="description"
            {...register('description')}
            placeholder="Additional notes about this customer..."
            rows={3}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <Input
              id="street"
              {...register('street')}
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">
              Suburb
            </label>
            <Input
              id="suburb"
              {...register('suburb')}
              placeholder="Central City"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Auckland"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Region/State
            </label>
            <Input
              id="region"
              {...register('region')}
              placeholder="Auckland"
            />
          </div>

          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <Input
              id="postcode"
              {...register('postcode')}
              placeholder="1010"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <Input
              id="country"
              {...register('country')}
              placeholder="New Zealand"
            />
          </div>
        </div>
          </div>

          {/* Live validation feedback */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {Object.keys(errors).length > 0 && (
              <span>Form has {Object.keys(errors).length} validation errors</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 mt-8 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            <span>{isEditing ? 'Update Customer' : 'Create Customer'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
