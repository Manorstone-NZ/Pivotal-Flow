import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { QuoteLineTable } from '../../components/quotes/QuoteLineTable';
import { QuoteSummaryCard } from '../../components/quotes/QuoteSummaryCard';
import { DiscountEditor } from '../../components/quotes/DiscountEditor';
import { CustomerSelector } from '../../components/quotes/CustomerSelector';
import { QuoteDeliveryPanel } from '../../components/quotes/QuoteDeliveryPanel';
import { QuoteStatusChip } from '../../components/quotes/QuoteStatusChip';
import { useAuth } from '../../features/auth/store';
import { 
  useQuote, 
  useUpdateQuote, 
  useUpdateQuoteStatus,
  useSubmitQuote,
  type Quote,
  type UpdateQuote 
} from '../../features/quotes/api';

export const QuoteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateQuote>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: quote, isLoading, error, refetch } = useQuote(id!);
  const updateQuoteMutation = useUpdateQuote();
  const updateStatusMutation = useUpdateQuoteStatus();
  const submitQuoteMutation = useSubmitQuote();

  const handleQuoteUpdate = useCallback((_updatedQuote: Quote) => {
    // Refetch to ensure we have the latest server-calculated totals
    refetch();
  }, [refetch]);

  const handleEditClick = useCallback(() => {
    if (!quote) return;
    
    setIsEditing(true);
    setFormData({
      title: quote.title,
      description: quote.description || undefined,
      type: quote.type as any,
      validUntil: quote.validUntil || undefined,
    });
    setErrors({});
  }, [quote]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setFormData({});
    setErrors({});
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!quote) return;

    // Basic validation
    const validationErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      validationErrors['title'] = 'Title is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateQuoteMutation.mutateAsync({
        id: quote.id,
        data: formData,
      });
      
      setIsEditing(false);
      setFormData({});
      setErrors({});
      refetch();
    } catch (error) {
      console.error('Failed to update quote:', error);
      setErrors({ submit: 'Failed to update quote. Please try again.' });
    }
  }, [quote, formData, updateQuoteMutation, refetch]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!quote) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: quote.id,
        status: newStatus,
      });
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, [quote, updateStatusMutation, refetch]);

  const handleSubmitQuote = useCallback(async () => {
    if (!quote) return;

    if (!confirm('Are you sure you want to submit this quote for approval?')) return;

    try {
      await submitQuoteMutation.mutateAsync(quote.id);
      refetch();
    } catch (error) {
      console.error('Failed to submit quote:', error);
    }
  }, [quote, submitQuoteMutation, refetch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Quote Not Found
            </h2>
            <p className="text-text-secondary mb-4">
              The quote you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/quotes')}>
              Back to Quotes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'sent': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const canEdit = quote.status === 'draft' || quote.status === 'pending';
  const canSubmit = quote.status === 'draft' && (quote.lineItems?.length || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/quotes')}
            aria-label="Back to quotes list"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quotes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{quote.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-text-secondary">#{quote.quoteNumber}</span>
              <QuoteStatusChip status={quote.status as any} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canSubmit && (
            <Button
              onClick={handleSubmitQuote}
              disabled={submitQuoteMutation.isPending}
            >
              {submitQuoteMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
          
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              onClick={handleEditClick}
            >
              Edit Quote
            </Button>
          )}
          
          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                disabled={updateQuoteMutation.isPending}
              >
                {updateQuoteMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateQuoteMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Quote Details</h2>
              
              {isEditing ? (
                <div className="space-y-4" onKeyDown={handleKeyPress}>
                  <Input
                    label="Title"
                    value={formData.title || ''}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                    error={errors['title']}
                    required
                  />
                  
                  <TextArea
                    label="Description"
                    value={formData.description || ''}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    rows={3}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type"
                      value={formData.type || ''}
                      onChange={(value) => setFormData({ ...formData, type: value as any })}
                      options={[
                        { value: 'project', label: 'Project' },
                        { value: 'service', label: 'Service' },
                        { value: 'product', label: 'Product' },
                        { value: 'maintenance', label: 'Maintenance' },
                      ]}
                    />
                    
                    <Input
                      label="Valid Until"
                      type="date"
                      value={formData.validUntil?.split('T')[0] || ''}
                      onChange={(value) => setFormData({ ...formData, validUntil: value ? `${value}T23:59:59Z` : '' })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-text-secondary text-sm">Description:</span>
                    <p className="text-text-primary">{quote.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Type:</span>
                      <span className="text-text-primary ml-2 capitalize">{quote.type}</span>
                    </div>
                    
                    {quote.validUntil && (
                      <div>
                        <span className="text-text-secondary">Valid Until:</span>
                        <span className="text-text-primary ml-2">
                          {new Date(quote.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Created:</span>
                      <span className="text-text-primary ml-2">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-text-secondary">Last Updated:</span>
                      <span className="text-text-primary ml-2">
                        {new Date(quote.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error display */}
              {errors['submit'] && (
                <div className="mt-4 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
                  <p className="text-semantic-error text-sm">{errors['submit']}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardContent className="p-6">
              <QuoteLineTable
                quote={quote}
                onQuoteUpdate={handleQuoteUpdate}
                isEditable={canEdit}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quote Delivery Panel */}
          <QuoteDeliveryPanel
            quote={{
              id: quote.id,
              quoteNumber: quote.quoteNumber,
              title: quote.title,
              status: quote.status,
              deliveredAt: quote.deliveredAt,
              viewedAt: quote.viewedAt,
              acceptedAt: quote.acceptedAt,
              sentAt: quote.sentAt,
              validUntil: quote.validUntil,
              customer: {
                companyName: quote.clientId, // Using clientId as company name fallback
                email: undefined // Would need to join customer data
              }
            }}
            onDeliverySuccess={() => {
              // Refresh quote data after delivery
              window.location.reload();
            }}
          />
          
          {/* Quote Summary */}
          <QuoteSummaryCard quote={quote} />

          {/* Discount Editor */}
          <DiscountEditor
            quote={quote}
            onQuoteUpdate={handleQuoteUpdate}
            isEditable={canEdit}
          />

          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Customer</h3>
              <CustomerSelector
                value={quote.clientId}
                onChange={(customerId, customer) => {
                  // In a real implementation, this would update the quote's customer
                  console.log('Customer changed:', customerId, customer);
                }}
                disabled={!canEdit}
                label="Customer"
              />
            </CardContent>
          </Card>

          {/* Status Management */}
          {canEdit && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Status</h3>
                <Select
                  label="Quote Status"
                  value={quote.status}
                  onChange={(value) => handleStatusChange(String(value))}
                  disabled={updateStatusMutation.isPending}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'pending', label: 'Pending Approval' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'sent', label: 'Sent to Customer' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      console.log('PDF Download - Access Token:', accessToken ? 'Present' : 'Missing');
                      const response = await fetch(`http://localhost:3000/api/v1/quotes/${quote.id}/pdf`, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${accessToken}`,
                        },
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `quote-${quote.quoteNumber}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } else {
                        const errorText = await response.text();
                        console.error('Failed to generate PDF:', response.status, errorText);
                      }
                    } catch (error) {
                      console.error('Error generating PDF:', error);
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // In real implementation, this would send email
                    console.log('Send quote via email:', quote.id);
                  }}
                  disabled={quote.status === 'draft'}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send via Email
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // In real implementation, this would duplicate the quote
                    console.log('Duplicate quote:', quote.id);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
