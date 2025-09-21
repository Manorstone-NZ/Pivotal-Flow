/**
 * Quote Details Screen - E4 SDK Integration Example
 * Demonstrates line items table, totals calculation, and status transitions
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuoteDetail, useUpdateQuote, useUpdateQuoteStatus } from '../lib/api/queries';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/Button';
import { Input } from '../components/ui/input';
import { TextArea } from '../components/ui/TextArea';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/Toast';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'accepted' | 'rejected';
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  validFrom: string;
  validUntil: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'info',
  sent: 'primary',
  accepted: 'success',
  rejected: 'error',
} as const;

const statusLabels = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
} as const;

const statusTransitions = {
  draft: ['pending'],
  pending: ['approved', 'rejected'],
  approved: ['sent'],
  sent: ['accepted', 'rejected'],
  accepted: [],
  rejected: ['draft'],
} as const;

export const QuoteDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState<Partial<Quote>>({});

  // API queries
  const { data: quote, isLoading, error } = useQuoteDetail(id || '');
  const updateQuoteMutation = useUpdateQuote();
  const updateStatusMutation = useUpdateQuoteStatus();

  // Computed values
  const currentQuote = quote || {} as Quote;
  const displayQuote = isEditing ? { ...currentQuote, ...editedQuote } : currentQuote;
  
  // Calculate totals
  const totals = React.useMemo(() => {
    const lineItems = displayQuote.lineItems || [];
    const subtotal = lineItems.reduce((sum: number, item: LineItem) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const discount = 0; // No discount for now
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
  }, [displayQuote.lineItems]);

  // Line items columns
  const lineItemColumns = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: { row: { original: LineItem } }) => (
        <div className="text-text-primary">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: { row: { original: LineItem } }) => (
        <div className="text-text-secondary text-sm">
          {row.original.category || 'General'}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      cell: ({ row }: { row: { original: LineItem } }) => (
        <div className="text-text-primary text-center">
          {row.original.quantity}
        </div>
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }: { row: { original: LineItem } }) => (
        <div className="text-text-primary text-right">
          {displayQuote.currency} {row.original.unitPrice.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }: { row: { original: LineItem } }) => (
        <div className="text-text-primary text-right font-medium">
          {displayQuote.currency} {row.original.total.toLocaleString()}
        </div>
      ),
    },
  ];

  // Event handlers
  const handleEdit = () => {
    setEditedQuote({
      title: currentQuote.title,
      description: currentQuote.description || '',
      validFrom: currentQuote.validFrom,
      validUntil: currentQuote.validUntil,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!currentQuote.id) return;
      await updateQuoteMutation.mutateAsync({
        id: currentQuote.id,
        ...editedQuote,
      });
      setIsEditing(false);
      setEditedQuote({});
      success('Quote updated successfully');
    } catch {
      showError('Failed to update quote');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedQuote({});
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (!currentQuote.id) return;
      await updateStatusMutation.mutateAsync({
        id: currentQuote.id,
        status: newStatus,
      });
      success('Quote status updated successfully');
    } catch {
      showError('Failed to update quote status');
    }
  };

  const handleBack = () => {
    navigate('/quotes');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Error Loading Quote
            </h2>
            <p className="text-text-secondary mb-4">
              {error.message || 'An error occurred while loading the quote'}
            </p>
            <Button onClick={handleBack}>
              Back to Quotes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-text-secondary mt-4">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Quote Not Found
            </h2>
            <p className="text-text-secondary mb-4">
              The quote you're looking for doesn't exist.
            </p>
            <Button onClick={handleBack}>
              Back to Quotes
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
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {displayQuote.quoteNumber}
            </h1>
            <p className="text-text-secondary mt-1">
              {displayQuote.title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={statusColors[displayQuote.status as keyof typeof statusColors]} className="text-sm">
            {statusLabels[displayQuote.status as keyof typeof statusLabels]}
          </Badge>
          {!isEditing && (
            <Button variant="outline" onClick={handleEdit}>
              Edit Quote
            </Button>
          )}
        </div>
      </div>

      {/* Quote Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {isEditing ? (
                        <Input
                          label="Title"
                          value={displayQuote.title || ''}
                          onChange={(value: string) => {
                            setEditedQuote(prev => ({ ...prev, title: value }));
                          }}
                          disabled={false}
                        />
                      ) : (
                        <Input
                          label="Title"
                          value={displayQuote.title || ''}
                          disabled={true}
                        />
                      )}
                    </div>
                <div>
                  <Input
                    label="Customer"
                    value={displayQuote.customerName || ''}
                    disabled
                  />
                </div>
              </div>
                  <div>
                    {isEditing ? (
                      <TextArea
                        label="Description"
                        value={displayQuote.description || ''}
                        onChange={(value: string) => {
                          setEditedQuote(prev => ({ ...prev, description: value }));
                        }}
                        disabled={false}
                        rows={3}
                      />
                    ) : (
                      <TextArea
                        label="Description"
                        value={displayQuote.description || ''}
                        disabled={true}
                        rows={3}
                      />
                    )}
                  </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {isEditing ? (
                    <Input
                      label="Valid From"
                      type="date"
                      value={(displayQuote.validFrom ? new Date(displayQuote.validFrom).toISOString().split('T')[0] : '') as string}
                      onChange={(value: string) => {
                        setEditedQuote(prev => ({ ...prev, validFrom: new Date(value).toISOString() }));
                      }}
                      disabled={false}
                    />
                  ) : (
                    <Input
                      label="Valid From"
                      type="date"
                      value={(displayQuote.validFrom ? new Date(displayQuote.validFrom).toISOString().split('T')[0] : '') as string}
                      disabled={true}
                    />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="Valid Until"
                      type="date"
                      value={(displayQuote.validUntil ? new Date(displayQuote.validUntil).toISOString().split('T')[0] : '') as string}
                      onChange={(value: string) => {
                        setEditedQuote(prev => ({ ...prev, validUntil: new Date(value).toISOString() }));
                      }}
                      disabled={false}
                    />
                  ) : (
                    <Input
                      label="Valid Until"
                      type="date"
                      value={(displayQuote.validUntil ? new Date(displayQuote.validUntil).toISOString().split('T')[0] : '') as string}
                      disabled={true}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={displayQuote.lineItems || []}
                columns={lineItemColumns}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="text-text-primary">
                  {displayQuote.currency} {totals.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax (10%):</span>
                <span className="text-text-primary">
                  {displayQuote.currency} {totals.tax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount:</span>
                <span className="text-text-primary">
                  {displayQuote.currency} {totals.discount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-surface-border pt-3">
                <div className="flex justify-between">
                  <span className="text-text-primary font-semibold">Total:</span>
                  <span className="text-text-primary font-bold text-lg">
                    {displayQuote.currency} {totals.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(statusTransitions[displayQuote.status as keyof typeof statusTransitions] || []).map((status: string) => (
                <Button
                  key={status}
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange(status)}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Edit Actions */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={updateQuoteMutation.isPending}
                >
                  {updateQuoteMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quote Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="text-text-secondary">Created:</div>
                <div className="text-text-primary">
                  {displayQuote.createdAt ? new Date(displayQuote.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-text-secondary">Last Updated:</div>
                <div className="text-text-primary">
                  {displayQuote.updatedAt ? new Date(displayQuote.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
