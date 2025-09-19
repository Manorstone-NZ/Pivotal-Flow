/**
 * Customer Details Page
 * Header with tabs (Details | Contacts | Projects) and inline editing
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { useCustomer, useUpdateCustomer, type Customer } from '../../features/customers/api';
import { Button } from '../../components/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { ContactList } from '../../components/customers/ContactList';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { Dialog } from '../../components/ui/Dialog';
import { useAuth } from '../../features/auth/store';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const { data: customerResponse, isLoading, error } = useCustomer(id!, true); // Include contacts
  const updateCustomerMutation = useUpdateCustomer();

  const customer = customerResponse?.data;

  const handleBack = () => {
    navigate('/customers');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSuccess = (updatedCustomer: Customer) => {
    setIsEditing(false);
    success(`Customer ${updatedCustomer.companyName} updated successfully`);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'prospect': return 'warning';
      default: return 'secondary';
    }
  };

  const getCustomerTypeVariant = (type: string) => {
    switch (type) {
      case 'business': return 'primary';
      case 'individual': return 'info';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-text-secondary">Loading customer details...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Customer</h3>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Customer not found'}
          </p>
          <Button onClick={handleBack} variant="outline">
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2"
            aria-label="Back to customers list"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{customer.companyName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getStatusVariant(customer.status)}>
                {customer.status}
              </Badge>
              <Badge variant={getCustomerTypeVariant(customer.customerType)}>
                {customer.customerType}
              </Badge>
              {customer.customerNumber && (
                <span className="text-sm text-text-secondary">
                  {customer.customerNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {hasPermission('customers.manage') && (
          <Button
            onClick={handleEdit}
            className="flex items-center space-x-2"
            data-testid="edit-customer-button"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Customer</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        items={[
          {
            id: 'details',
            label: 'Details',
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <p className="text-text-primary">{customer.companyName}</p>
                      </div>
                      
                      {customer.legalName && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Legal Name</label>
                          <p className="text-text-primary">{customer.legalName}</p>
                        </div>
                      )}
                      
                      {customer.industry && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Industry</label>
                          <p className="text-text-primary">{customer.industry}</p>
                        </div>
                      )}
                      
                      {customer.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Website</label>
                          <p>
                            <a 
                              href={customer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-primary hover:underline"
                            >
                              {customer.website}
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {customer.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <p className="text-text-primary">{customer.description}</p>
                        </div>
                      )}

                      {customer.source && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Lead Source</label>
                          <p className="text-text-primary">{customer.source}</p>
                        </div>
                      )}

                      {customer.rating && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Rating</label>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={i < customer.rating! ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-sm text-text-secondary ml-2">
                              {customer.rating}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customer.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p>
                            <a 
                              href={`mailto:${customer.email}`}
                              className="text-brand-primary hover:underline"
                            >
                              {customer.email}
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {customer.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p>
                            <a 
                              href={`tel:${customer.phone}`}
                              className="text-brand-primary hover:underline"
                            >
                              {customer.phone}
                            </a>
                          </p>
                        </div>
                      )}

                      {/* Address */}
                      {(customer.street || customer.city || customer.country) && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Address</label>
                          <div className="text-text-primary">
                            {customer.street && <p>{customer.street}</p>}
                            {(customer.suburb || customer.city) && (
                              <p>
                                {[customer.suburb, customer.city].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {(customer.region || customer.postcode) && (
                              <p>
                                {[customer.region, customer.postcode].filter(Boolean).join(' ')}
                              </p>
                            )}
                            {customer.country && <p>{customer.country}</p>}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <p className="text-text-secondary">
                          {format(new Date(customer.createdAt), 'PPP')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          },
          {
            id: 'contacts',
            label: `Contacts ${customer.contacts ? `(${customer.contacts.length})` : ''}`,
            content: (
              <Card>
                <CardContent className="p-6">
                  <ContactList customerId={customer.id} />
                </CardContent>
              </Card>
            )
          },
          {
            id: 'projects',
            label: 'Projects',
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-text-secondary">
                      Project management integration coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        defaultActiveTab="details"
      />

      {/* Edit Customer Modal */}
      <Dialog
        open={isEditing}
        onClose={handleEditCancel}
        title="Edit Customer"
        size="xl"
      >
        <CustomerForm
          customer={customer}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </Dialog>
    </div>
  );
};

export default CustomerDetailsPage;
