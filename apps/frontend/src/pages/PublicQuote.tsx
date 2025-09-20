/**
 * Public Quote Page - SaaS Multi-Tenant Customer Portal
 * Customer-facing quote approval interface with organization branding
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Type, type Static } from '@sinclair/typebox';
import {
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// TypeBox schemas for customer approval
const ApprovalFormSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  role: Type.String({ minLength: 2, maxLength: 100 }),
  checkedTerms: Type.Boolean()
});

const RejectionFormSchema = Type.Object({
  reason: Type.String({ minLength: 10, maxLength: 500 })
});

type ApprovalFormData = Static<typeof ApprovalFormSchema>;
type RejectionFormData = Static<typeof RejectionFormSchema>;

interface PublicQuoteData {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  status: string;
  validFrom: string;
  validUntil: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  termsConditions?: string;
  notes?: string;
  organization: {
    name: string;
    industry?: string;
    timezone: string;
    currency: string;
  };
  customer: {
    companyName: string;
    email?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const PublicQuotePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<PublicQuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionComplete, setActionComplete] = useState<'accepted' | 'rejected' | null>(null);

  const approvalForm = useForm<ApprovalFormData>({
    defaultValues: {
      name: '',
      role: '',
      checkedTerms: false
    }
  });

  const rejectionForm = useForm<RejectionFormData>({
    defaultValues: {
      reason: ''
    }
  });

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      if (!token) {
        setError('Invalid quote link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/public/quotes/${token}`);
        
        if (response.status === 410) {
          setError('This quote has expired');
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Quote not found');
        }

        const result = await response.json();
        setQuote(result.data);
        
      } catch (err) {
        setError('Failed to load quote. Please check your link.');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [token]);

  const handleApproval = async (data: ApprovalFormData) => {
    if (!data.checkedTerms) {
      approvalForm.setError('checkedTerms', {
        message: 'You must accept the terms and conditions'
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/public/quotes/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to accept quote');
      }

      setActionComplete('accepted');
      setShowApprovalForm(false);
      
    } catch (err) {
      approvalForm.setError('root', {
        message: 'Failed to accept quote. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejection = async (data: RejectionFormData) => {
    setProcessing(true);
    try {
      const response = await fetch(`/public/quotes/${token}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to reject quote');
      }

      setActionComplete('rejected');
      setShowRejectionForm(false);
      
    } catch (err) {
      rejectionForm.setError('root', {
        message: 'Failed to reject quote. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency || 'NZD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'long'
    }).format(new Date(dateString));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading quote...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <XCircleIcon className="w-16 h-16 text-status-error mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-text-primary mb-2">Quote Not Available</h1>
            <p className="text-text-secondary">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (actionComplete) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            {actionComplete === 'accepted' ? (
              <>
                <CheckCircleIcon className="w-16 h-16 text-status-success mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-text-primary mb-2">Quote Accepted!</h1>
                <p className="text-text-secondary">
                  Thank you for accepting our quote. We'll be in touch soon to get started.
                </p>
              </>
            ) : (
              <>
                <XCircleIcon className="w-16 h-16 text-status-warning mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-text-primary mb-2">Quote Declined</h1>
                <p className="text-text-secondary">
                  Thank you for your feedback. We appreciate you taking the time to review our quote.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const canTakeAction = ['sent', 'viewed'].includes(quote.status);
  const isExpired = new Date() > new Date(quote.validUntil);

  return (
    <div className="min-h-screen bg-surface-background">
      {/* Organization Header */}
      <div className="bg-surface-card border-b border-border-default">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="w-8 h-8 text-brand-primary" />
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{quote.organization.name}</h1>
              {quote.organization.industry && (
                <p className="text-sm text-text-secondary">{quote.organization.industry}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quote Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{quote.title}</CardTitle>
                <p className="text-text-secondary mt-1">Quote #{quote.quoteNumber}</p>
              </div>
              <Badge 
                variant={quote.status === 'viewed' ? 'info' : 'primary'}
                className="text-sm"
              >
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {quote.description && (
              <p className="text-text-primary mb-4">{quote.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary">Valid until:</span>
                <span className="font-medium text-text-primary">{formatDate(quote.validUntil)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary">Currency:</span>
                <span className="font-medium text-text-primary">{quote.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Totals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="font-medium">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-status-success">
                  <span>Discount:</span>
                  <span>-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax ({(quote.taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(quote.taxAmount, quote.currency)}</span>
              </div>
              
              <div className="border-t border-border-default pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-brand-primary">{formatCurrency(quote.totalAmount, quote.currency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        {quote.termsConditions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Terms and Conditions</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="prose prose-sm max-w-none text-text-primary">
                {quote.termsConditions.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {canTakeAction && !isExpired && (
          <div className="flex space-x-4 justify-center">
            <Button
              onClick={() => setShowApprovalForm(true)}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2 px-8"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Accept Quote</span>
            </Button>
            
            <Button
              onClick={() => setShowRejectionForm(true)}
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 px-8"
            >
              <XCircleIcon className="w-5 h-5" />
              <span>Decline Quote</span>
            </Button>
          </div>
        )}

        {isExpired && (
          <div className="text-center py-8">
            <div className="bg-surface-warning border border-border-warning rounded-lg p-6 max-w-md mx-auto">
              <CalendarIcon className="w-12 h-12 text-status-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Quote Expired</h3>
              <p className="text-text-secondary">
                This quote expired on {formatDate(quote.validUntil)}. 
                Please contact us for an updated quote.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accept Quote</CardTitle>
              <p className="text-text-secondary">
                Please provide your details to accept this quote
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={approvalForm.handleSubmit(handleApproval)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    {...approvalForm.register('name', { required: 'Name is required' })}
                    placeholder="John Smith"
                    error={approvalForm.formState.errors.name?.message}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1">
                    Role/Title *
                  </label>
                  <Input
                    id="role"
                    {...approvalForm.register('role', { required: 'Role is required' })}
                    placeholder="Project Manager"
                    error={approvalForm.formState.errors.role?.message}
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="checkedTerms"
                    {...approvalForm.register('checkedTerms', { 
                      required: 'You must accept the terms and conditions' 
                    })}
                    className="mt-1 h-4 w-4 text-brand-primary border-border-default rounded focus:ring-brand-primary"
                  />
                  <label htmlFor="checkedTerms" className="text-sm text-text-primary">
                    I accept the terms and conditions outlined in this quote *
                  </label>
                </div>
                
                {approvalForm.formState.errors.checkedTerms && (
                  <p className="text-sm text-status-error">
                    {approvalForm.formState.errors.checkedTerms.message}
                  </p>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApprovalForm(false)}
                    disabled={processing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Accept Quote</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Decline Quote</CardTitle>
              <p className="text-text-secondary">
                Please let us know why you're declining this quote
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={rejectionForm.handleSubmit(handleRejection)} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-text-primary mb-1">
                    Reason for declining *
                  </label>
                  <textarea
                    id="reason"
                    {...rejectionForm.register('reason', { 
                      required: 'Please provide a reason',
                      minLength: { value: 10, message: 'Please provide more detail (minimum 10 characters)' }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="Please let us know your concerns or feedback..."
                  />
                  {rejectionForm.formState.errors.reason && (
                    <p className="text-sm text-status-error mt-1">
                      {rejectionForm.formState.errors.reason.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectionForm(false)}
                    disabled={processing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="error"
                    disabled={processing}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4" />
                        <span>Decline Quote</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
