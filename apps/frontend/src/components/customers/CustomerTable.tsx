/**
 * Customer Table Component
 * Sortable table with row actions for customer management
 */

import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import type { Customer } from '../../features/customers/api';
import { Button } from '../Button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../features/auth/store';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onCustomerClick: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onCustomerClick,
  onDeleteCustomer,
  pagination,
}) => {
  const { hasPermission } = useAuth();

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
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
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-text-secondary">Loading customers...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="text-text-secondary mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No customers found</h3>
        <p className="text-text-secondary mb-4">
          {pagination.total === 0 
            ? "You haven't added any customers yet." 
            : "No customers match your current filters."
          }
        </p>
        {hasPermission('customers.manage') && pagination.total === 0 && (
          <Button onClick={() => onCustomerClick({} as Customer)}>
            Create your first customer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Customers table">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('companyName')}
                role="columnheader"
                aria-sort={sortBy === 'companyName' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>Company Name</span>
                  {getSortIcon('companyName')}
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('email')}
                role="columnheader"
                aria-sort={sortBy === 'email' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('status')}
                role="columnheader"
                aria-sort={sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('createdAt')}
                role="columnheader"
                aria-sort={sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr 
                key={customer.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onCustomerClick(customer)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCustomerClick(customer);
                  }
                }}
                aria-label={`Customer ${customer.companyName}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {customer.companyName}
                    </div>
                    {customer.customerNumber && (
                      <div className="text-sm text-text-secondary">
                        {customer.customerNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-text-primary">
                    {customer.email || '-'}
                  </div>
                  {customer.phone && (
                    <div className="text-sm text-text-secondary">
                      {customer.phone}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(customer.status)}>
                    {customer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getCustomerTypeVariant(customer.customerType)}>
                    {customer.customerType}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCustomerClick(customer)}
                      data-testid={`view-customer-${customer.id}`}
                      aria-label={`View ${customer.companyName} details`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    {hasPermission('customers.manage') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCustomerClick(customer)} // Will open in edit mode
                          data-testid={`edit-customer-${customer.id}`}
                          aria-label={`Edit ${customer.companyName}`}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-800"
                          data-testid={`delete-customer-${customer.id}`}
                          aria-label={`Delete ${customer.companyName}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                aria-label="Page size"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="rounded-l-md"
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => pagination.onPageChange(pageNum)}
                      className="border-l-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="rounded-r-md border-l-0"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
