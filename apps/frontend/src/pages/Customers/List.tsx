/**
 * Customers List Page
 * Searchable table with filters, pagination, and "New Customer" button
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

import { useCustomers, useDeleteCustomer, type Customer, type CustomerFilters } from '../../features/customers/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { FormModal } from '../../components/ui/FormModal';
import { useAuth } from '../../features/auth/store';

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { hasPermission } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // Build filters for API
  const filters: CustomerFilters = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    customerType: customerTypeFilter !== 'all' ? (customerTypeFilter as any) : undefined,
    industry: industryFilter || undefined,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  }), [searchTerm, statusFilter, customerTypeFilter, industryFilter, sortBy, sortOrder, page, pageSize]);

  // API queries
  const { data: customersData, isLoading, error } = useCustomers(filters);
  const deleteCustomerMutation = useDeleteCustomer();

  // Computed values
  const customers = customersData?.data || [];
  const pagination = customersData?.pagination;
  const totalCustomers = pagination?.total || 0;

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'customerType':
        setCustomerTypeFilter(value);
        break;
      case 'industry':
        setIndustryFilter(value);
        break;
    }
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleCustomerClick = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.companyName}?`)) {
      try {
        await deleteCustomerMutation.mutateAsync(customer.id);
        success(`Customer ${customer.companyName} deleted successfully`);
      } catch (error) {
        showError('Failed to delete customer');
      }
    }
  };

  const handleNewCustomer = () => {
    setShowNewCustomerModal(true);
  };

  const handleNewCustomerSuccess = (customer: Customer) => {
    setShowNewCustomerModal(false);
    success(`Customer ${customer.companyName} created successfully`);
    // Navigate to the new customer's detail page
    navigate(`/customers/${customer.id}`);
  };

  // Status badge variant mapping
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'prospect': return 'warning';
      default: return 'secondary';
    }
  };

  // Customer type badge variant mapping
  const getCustomerTypeVariant = (type: string) => {
    switch (type) {
      case 'business': return 'primary';
      case 'individual': return 'info';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Customers</h3>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to load customers'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-text-secondary mt-1">
            Manage your customers and their contact information
          </p>
        </div>
        
        {hasPermission('customers.manage') && (
          <Button
            onClick={handleNewCustomer}
            className="flex items-center space-x-2"
            data-testid="new-customer-button"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Customer</span>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  data-testid="customer-search"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </Button>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span>{totalCustomers} total customers</span>
              <Badge variant="secondary">{customers.length} shown</Badge>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <Select
                    value={customerTypeFilter}
                    onValueChange={(value) => handleFilterChange('customerType', value)}
                  >
                    <option value="all">All Types</option>
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <Input
                    type="text"
                    placeholder="Filter by industry..."
                    value={industryFilter}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCustomerTypeFilter('all');
                    setIndustryFilter('');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <CustomerTable
            customers={customers}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onCustomerClick={handleCustomerClick}
            onDeleteCustomer={handleDeleteCustomer}
            pagination={{
              page,
              pageSize,
              total: totalCustomers,
              pages: pagination?.pages || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* New Customer Modal */}
      <FormModal
        open={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        title="Create New Customer"
        size="lg"
      >
        <CustomerForm
          onSuccess={handleNewCustomerSuccess}
          onCancel={() => setShowNewCustomerModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default CustomersListPage;
