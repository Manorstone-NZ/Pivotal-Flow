/**
 * Simple Organization Form Component
 * Simplified form for creating organizations - focusing on essential fields only
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useCreateOrganization, useUpdateOrganization, type Organization, type CreateOrganizationData } from '../../features/tenancy/api';

// Simplified form data type - only essential fields
interface OrganizationFormData {
  name: string;
  slug: string;
  industry: string;
  currency: string;
  timezone: string;
  city: string;
  country: string;
  email: string;
}

interface OrganizationFormProps {
  organization?: Organization;
  onSuccess: (organization: Organization) => void;
  onCancel: () => void;
}

export const OrganizationFormSimple: React.FC<OrganizationFormProps> = ({
  organization,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!organization;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrganizationFormData>({
    defaultValues: {
      name: organization?.name || '',
      slug: organization?.slug || '',
      industry: organization?.industry || '',
      currency: organization?.currency || 'USD',
      timezone: organization?.timezone || 'UTC',
      city: organization?.city || '',
      country: organization?.country || '',
      email: organization?.email || '',
    },
  });

  // API hooks
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();

  // Generate slug from name
  const name = watch('name');
  useEffect(() => {
    if (name && !isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [name, isEditing, setValue]);

  // Form submission
  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);
    
    try {
      const organizationData: CreateOrganizationData = {
        name: data.name,
        slug: data.slug || undefined,
        industry: data.industry || undefined,
        currency: data.currency || 'USD',
        timezone: data.timezone || 'UTC',
        city: data.city || undefined,
        country: data.country || undefined,
        email: data.email || undefined,
      };

      let result;
      if (isEditing && organization) {
        result = await updateOrganizationMutation.mutateAsync({
          id: organization.id,
          data: organizationData
        });
      } else {
        result = await createOrganizationMutation.mutateAsync(organizationData);
      }
      
      onSuccess(result.data);
    } catch (error) {
      console.error('Failed to save organization:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} organization`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Essential Information Only */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <Input
              id="name"
              {...register('name', { required: 'Organization name is required' })}
              placeholder="Enter organization name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="organization-slug"
            />
            <p className="mt-1 text-xs text-gray-500">Auto-generated from name</p>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              id="industry"
              {...register('industry')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              {...register('currency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
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
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              {...register('country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Country</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Australia">Australia</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@organization.com"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              {...register('timezone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
              <option value="Pacific/Auckland">Auckland</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
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
          <span>{isEditing ? 'Update Organization' : 'Create Organization'}</span>
        </Button>
      </div>
    </form>
  );
};

