/**
 * Contact List Component
 * Display and manage customer contacts
 */

import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import { useCustomerContacts, useDeleteContact, type CustomerContact } from '../../features/customers/api';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FormModal } from '../ui/FormModal';
import { ContactForm } from './ContactForm';
import { useAuth } from '../../features/auth/store';
import { useToast } from '../ui/Toast';

interface ContactListProps {
  customerId: string;
  className?: string;
}

export const ContactList: React.FC<ContactListProps> = ({
  customerId,
  className = '',
}) => {
  const { hasPermission } = useAuth();
  const { success, error: showError } = useToast();
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);

  // API hooks
  const { data: contactsResponse, isLoading, error } = useCustomerContacts(customerId);
  const deleteContactMutation = useDeleteContact();

  const contacts = contactsResponse?.data || [];

  const handleNewContact = () => {
    setShowNewContactModal(true);
  };

  const handleEditContact = (contact: CustomerContact) => {
    setEditingContact(contact);
  };

  const handleDeleteContact = async (contact: CustomerContact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await deleteContactMutation.mutateAsync({ 
          customerId, 
          contactId: contact.id 
        });
        success(`Contact ${contact.firstName} ${contact.lastName} deleted successfully`);
      } catch (error) {
        showError('Failed to delete contact');
      }
    }
  };

  const handleContactSuccess = (contact: CustomerContact) => {
    setShowNewContactModal(false);
    setEditingContact(null);
    success(`Contact ${contact.firstName} ${contact.lastName} ${editingContact ? 'updated' : 'created'} successfully`);
  };

  const handleContactCancel = () => {
    setShowNewContactModal(false);
    setEditingContact(null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="md" />
        <span className="ml-3 text-text-secondary">Loading contacts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Contacts</h3>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to load contacts'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Contacts</h3>
          <p className="text-sm text-text-secondary">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {hasPermission('customers.manage') && (
          <Button
            onClick={handleNewContact}
            size="sm"
            className="flex items-center space-x-2"
            data-testid="new-contact-button"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        )}
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <div className="text-text-secondary mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-text-primary mb-2">No contacts yet</h4>
          <p className="text-text-secondary mb-4">
            Add contacts to keep track of key people at this customer.
          </p>
          {hasPermission('customers.manage') && (
            <Button onClick={handleNewContact} size="sm">
              Add first contact
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-medium text-text-primary">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    {contact.isPrimary && (
                      <div className="flex items-center space-x-1">
                        <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                        <Badge variant="warning" size="sm">Primary</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-text-secondary">
                    {contact.position && (
                      <p>{contact.position}{contact.department && ` • ${contact.department}`}</p>
                    )}
                    {contact.email && (
                      <p>
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="text-brand-primary hover:underline"
                        >
                          {contact.email}
                        </a>
                      </p>
                    )}
                    {contact.phone && (
                      <p>
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="text-brand-primary hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </p>
                    )}
                    {contact.notes && (
                      <p className="text-text-secondary italic">{contact.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {hasPermission('customers.manage') && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                      data-testid={`edit-contact-${contact.id}`}
                      aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contact)}
                      className="text-red-600 hover:text-red-800"
                      data-testid={`delete-contact-${contact.id}`}
                      aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Contact Modal */}
      <FormModal
        open={showNewContactModal}
        onClose={handleContactCancel}
        title="Add New Contact"
        size="md"
      >
        <ContactForm
          customerId={customerId}
          onSuccess={handleContactSuccess}
          onCancel={handleContactCancel}
        />
      </FormModal>

      {/* Edit Contact Modal */}
      <FormModal
        open={!!editingContact}
        onClose={handleContactCancel}
        title="Edit Contact"
        size="md"
      >
        <ContactForm
          customerId={customerId}
          contact={editingContact}
          onSuccess={handleContactSuccess}
          onCancel={handleContactCancel}
        />
      </FormModal>
    </div>
  );
};
