/**
 * Contact Form Component
 * Form for creating and editing customer contacts
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Type, type Static } from '@sinclair/typebox';

import { useCreateContact, useUpdateContact, type CustomerContact, type CreateContactData, type UpdateContactData } from '../../features/customers/api';
import { Button } from '../Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// TypeBox schema for frontend validation (matching backend approach)
const ContactFormSchema = Type.Object({
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.Optional(Type.String({ format: 'email' })),
  phone: Type.Optional(Type.String()),
  position: Type.Optional(Type.String({ maxLength: 100 })),
  department: Type.Optional(Type.String({ maxLength: 100 })),
  isPrimary: Type.Boolean(),
  notes: Type.Optional(Type.String()),
});

type ContactFormData = Static<typeof ContactFormSchema>;

// Simple validation function using TypeBox schema
const validateContactForm = (data: ContactFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  }
  
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  return errors;
};

interface ContactFormProps {
  customerId: string;
  contact?: CustomerContact;
  onSuccess: (contact: CustomerContact) => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  customerId,
  contact,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  const isEditing = !!contact;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ContactFormData>({
    mode: 'onChange',
    defaultValues: contact ? {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      department: contact.department || '',
      isPrimary: contact.isPrimary,
      notes: contact.notes || '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      isPrimary: false,
      notes: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log('Contact form submitted with data:', data);
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        const result = await updateContactMutation.mutateAsync({ 
          customerId,
          contactId: contact.id,
          data: data as UpdateContactData 
        });
        onSuccess(result.data);
      } else {
        const result = await createContactMutation.mutateAsync({
          customerId,
          data: data as CreateContactData
        });
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
      // Show error to user
      alert(`Failed to ${isEditing ? 'update' : 'create'} contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <h3 className="text-lg font-medium text-text-primary">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <Input
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              placeholder="John"
              required
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <Input
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
              placeholder="Smith"
              required
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.smith@company.com"
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
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <Input
              id="position"
              {...register('position')}
              placeholder="Manager"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Sales"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <TextArea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this contact..."
            rows={3}
          />
        </div>

        {/* Primary Contact */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPrimary"
            {...register('isPrimary')}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
            Primary contact for this customer
          </label>
        </div>
        {watch('isPrimary') && (
          <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Setting this contact as primary will remove the primary designation from other contacts.
          </p>
        )}
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
            <span>{isEditing ? 'Update Contact' : 'Add Contact'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
