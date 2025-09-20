/**
 * Address Fields Component
 * Reusable address form fields for organizations
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

import { Input } from '../ui/Input';

interface AddressFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  register,
  errors,
}) => {
  return (
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
            Suburb/District
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
            Postcode/ZIP
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
          <select
            id="country"
            {...register('country')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="">Select Country</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Australia">Australia</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="Singapore">Singapore</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

