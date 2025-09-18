import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useCreateInvoice, type InvoiceListFilters, type Invoice } from '../../features/invoices/api';
import { InvoiceTable } from '../../components/invoices';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
// Removed unused import

// Status filter options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'part_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'written_off', label: 'Written Off' },
  { value: 'void', label: 'Void' },
];

// Sort options
const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'invoiceNumber', label: 'Invoice Number' },
  { value: 'totalAmount', label: 'Amount' },
  { value: 'dueAt', label: 'Due Date' },
  { value: 'status', label: 'Status' },
];

/**
 * Format currency value for display
 */
const formatCurrency = (amount: number, currency: string = 'NZD'): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * InvoicesListPage component
 */
export const InvoicesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // Build filters
  const filters: InvoiceListFilters = useMemo(() => ({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter && { status: statusFilter as any }),
    sort: sortBy,
    sortOrder,
    page,
    limit: pageSize,
  }), [searchTerm, statusFilter, sortBy, sortOrder, page, pageSize]);

  // API queries
  const { data: invoicesData, isLoading, error, refetch } = useInvoices(filters);
  const createInvoiceMutation = useCreateInvoice();

  // Computed values
  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination;
  const totalInvoices = pagination?.total || 0;

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!invoices.length) return null;

    return invoices.reduce((acc, invoice) => {
      acc.total += invoice.totalAmount;
      acc.outstanding += invoice.balanceAmount;
      acc.paid += invoice.paidAmount;
      
      // Count by status
      acc.statusCounts[invoice.status] = (acc.statusCounts[invoice.status] || 0) + 1;
      
      return acc;
    }, {
      total: 0,
      outstanding: 0,
      paid: 0,
      statusCounts: {} as Record<string, number>,
    });
  }, [invoices]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(direction);
    setPage(1);
  };

  const handleCreateInvoice = async () => {
    try {
      const newInvoice = await createInvoiceMutation.mutateAsync({
        customerId: 'customer-1', // TODO: Replace with customer selector
        title: 'New Invoice',
        currency: 'NZD',
      });

      success('Invoice created successfully');
      navigate(`/invoices/${newInvoice.id}`);
    } catch (err) {
      showError('Failed to create invoice');
    }
  };

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Invoices
          </h1>
          <p className="text-text-secondary">
            Manage customer invoices and track payments
          </p>
        </div>
        
        <Button
          onClick={handleCreateInvoice}
          loading={createInvoiceMutation.isPending}
          className="w-full sm:w-auto"
        >
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-text-primary">
                {totalInvoices}
              </div>
              <div className="text-sm text-text-secondary">
                Total Invoices
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryStats.paid)}
              </div>
              <div className="text-sm text-text-secondary">
                Total Paid
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summaryStats.outstanding)}
              </div>
              <div className="text-sm text-text-secondary">
                Outstanding
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-text-primary">
                {formatCurrency(summaryStats.total)}
              </div>
              <div className="text-sm text-text-secondary">
                Total Value
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview */}
      {summaryStats && Object.keys(summaryStats.statusCounts).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-text-primary mb-3">
              Status Overview
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summaryStats.statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => handleStatusFilter(status)}
                >
                  {status.replace('_', ' ')}: {count}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-text-primary mb-1">
                Search
              </label>
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-text-primary mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-text-primary mb-1">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-text-secondary">Active filters:</span>
                
                {searchTerm && (
                  <button
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => handleSearch('')}
                  >
                    Search: "{searchTerm}" ×
                  </button>
                )}
                
                {statusFilter && (
                  <button
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => handleStatusFilter('')}
                  >
                    Status: {statusOptions.find(opt => opt.value === statusFilter)?.label} ×
                  </button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSearch('');
                    handleStatusFilter('');
                  }}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="font-medium text-text-primary mb-2">
                Failed to load invoices
              </h3>
              <p className="text-text-secondary mb-4">
                {error.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Table */}
      {!error && (
        <Card>
          <CardContent className="p-0">
            <InvoiceTable
              invoices={invoices}
              loading={isLoading}
              onRowClick={handleRowClick}
              onSort={handleSort}
              sortField={sortBy}
              sortDirection={sortOrder}
              showCustomer={true}
              showPayments={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalInvoices)} of {totalInvoices} invoices
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            
            <span className="text-sm text-text-secondary">
              Page {page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
