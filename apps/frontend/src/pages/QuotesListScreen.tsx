/**
 * Quotes List Screen - E4 SDK Integration Example
 * Demonstrates quick filters, status management, and totals
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes, useCreateQuote } from '../features/quotes/api';
import type { Quote } from '../features/quotes/api';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { QuoteStatusChip } from '../components/quotes/QuoteStatusChip';
import { cn } from '../lib/utils';

// Quote interface now imported from features/quotes/api

export const QuotesListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // API queries
  const { data: quotesData, isLoading, error } = useQuotes({
    search: searchTerm,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(customerFilter && { customerId: customerFilter }),
    ...(dateRange !== 'all' && { dateRange }),
    sort: sortBy,
    sortOrder: sortOrder,
    page,
    limit: pageSize,
  });

  const createQuoteMutation = useCreateQuote();

  // Computed values
  const quotes = quotesData?.data || [];
  const pagination = quotesData?.pagination;
  const totalQuotes = pagination?.total || 0;

  // Calculate totals
  const totals = useMemo(() => {
    return quotes.reduce((acc: { subtotal: number; tax: number; discount: number; total: number }, quote: Quote) => {
      acc.subtotal += quote.subtotal;
      acc.tax += quote.taxAmount;
      acc.discount += parseFloat(quote.metadata['discountAmount'] as string) || 0;
      acc.total += quote.totalAmount;
      return acc;
    }, { subtotal: 0, tax: 0, discount: 0, total: 0 });
  }, [quotes]);

  // Column definitions
  const columns = useMemo(() => [
    {
      accessorKey: 'quoteNumber',
      header: 'Quote #',
      cell: ({ row }: { row: { original: Quote } }) => (
        <div className="font-medium text-text-primary">
          {row.original.quoteNumber}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: { row: { original: Quote } }) => (
        <div className="text-text-primary">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: 'clientId',
      header: 'Customer',
      cell: ({ row }: { row: { original: Quote } }) => (
        <div className="text-text-primary">
          {row.original.clientId}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Quote } }) => (
        <QuoteStatusChip status={row.original.status as any} size="sm" />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }: { row: { original: Quote } }) => (
        <div className="text-text-primary font-medium">
          {(row.original.metadata['currency'] as string) || 'NZD'} {row.original.totalAmount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }: { row: { original: Quote } }) => {
        if (!row.original.validUntil) {
          return <div className="text-text-secondary text-sm">No expiry</div>;
        }
        
        const validUntil = new Date(row.original.validUntil);
        const isExpired = validUntil < new Date();
        const isExpiringSoon = validUntil < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        return (
          <div className={cn(
            'text-sm',
            isExpired ? 'text-red-600' : 
            isExpiringSoon ? 'text-yellow-600' : 'text-text-secondary'
          )}>
            {validUntil.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: { original: Quote } }) => (
        <div className="text-text-secondary text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ], []);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string | number) => {
    setStatusFilter(String(value));
    setPage(1);
  };

  const handleCustomerFilter = (value: string) => {
    setCustomerFilter(value);
    setPage(1);
  };

  const handleDateRangeFilter = (value: string | number) => {
    setDateRange(String(value));
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string | number) => {
    const size = typeof newPageSize === 'string' ? parseInt(newPageSize, 10) : newPageSize;
    setPageSize(size);
    setPage(1);
  };

  const handleCreateQuote = async () => {
    try {
      const newQuote = await createQuoteMutation.mutateAsync({
        clientId: 'customer-1', // Default to first customer
        title: 'New Quote',
        type: 'project',
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {},
      });
      success('Quote created successfully');
      // Navigate to the new quote details page
      navigate(`/quotes/${newQuote.id}`);
    } catch {
      showError('Failed to create quote');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Error Loading Quotes
            </h2>
            <p className="text-text-secondary mb-4">
              {error.message || 'An error occurred while loading quotes'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Quotes</h1>
          <p className="text-text-secondary mt-1">
            Manage customer quotations and proposals
          </p>
        </div>
        <Button onClick={handleCreateQuote}>
          Create Quote
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-text-primary">
              {totalQuotes}
            </div>
            <div className="text-sm text-text-secondary">
              Total Quotes
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {quotes.filter((q: Quote) => q.status === 'accepted').length}
            </div>
            <div className="text-sm text-text-secondary">
              Accepted
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {quotes.filter((q: Quote) => q.status === 'pending').length}
            </div>
            <div className="text-sm text-text-secondary">
              Pending
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-text-primary">
              USD {totals.total.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">
              Total Value
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={handleSearch}
                label="Search"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                label="Status"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
            </div>
            <div>
              <Input
                placeholder="Customer name..."
                value={customerFilter}
                onChange={handleCustomerFilter}
                label="Customer"
              />
            </div>
            <div>
              <Select
                value={dateRange}
                onChange={handleDateRangeFilter}
                label="Date Range"
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'quarter', label: 'This Quarter' },
                ]}
              />
            </div>
            <div>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                label="Page Size"
                options={[
                  { value: 10, label: '10 per page' },
                  { value: 25, label: '25 per page' },
                  { value: 50, label: '50 per page' },
                  { value: 100, label: '100 per page' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={quotes}
            columns={columns}
            isLoading={isLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onRowClick={(quote: Quote) => navigate(`/quotes/${quote.id}`)}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalQuotes)} of {totalQuotes} quotes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm text-text-primary">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
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
