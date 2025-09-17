import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Quote } from '../../features/quotes/api';

interface QuoteSummaryCardProps {
  quote: Quote;
  className?: string;
  showDetailedBreakdown?: boolean;
}

export const QuoteSummaryCard: React.FC<QuoteSummaryCardProps> = ({
  quote,
  className,
  showDetailedBreakdown = true,
}) => {
  const formatCurrency = (amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'sent': return 'Sent to Customer';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const currency = quote.metadata['currency'] as string || 'NZD';

  return (
    <Card className={className || ''}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Quote Summary</h3>
            <Badge variant={getStatusVariant(quote.status)} size="sm">
              {getStatusLabel(quote.status)}
            </Badge>
          </div>

          {/* Quote Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Quote Number:</span>
              <span className="text-text-primary font-medium">{quote.quoteNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Line Items:</span>
              <span className="text-text-primary">{quote.lineItems?.length || 0} items</span>
            </div>
            {quote.validUntil && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Valid Until:</span>
                <span className="text-text-primary">
                  {new Date(quote.validUntil).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          {showDetailedBreakdown && (
            <div className="border-t border-surface-border pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal:</span>
                  <span className="text-text-primary">{formatCurrency(quote.subtotal, currency)}</span>
                </div>
                
                {/* Discount (if applied) */}
                {quote.metadata['discountAmount'] && parseFloat(quote.metadata['discountAmount'] as string) > 0 && (
                  <div className="flex justify-between text-semantic-success">
                    <span>
                      Discount 
                      {quote.metadata['discountType'] === 'percentage' && quote.metadata['discountValue'] && (
                        <span className="text-xs ml-1">({quote.metadata['discountValue'] as string}%)</span>
                      )}:
                    </span>
                    <span>-{formatCurrency(parseFloat(quote.metadata['discountAmount'] as string), currency)}</span>
                  </div>
                )}
                
                {/* Tax */}
                {quote.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Tax 
                      {quote.metadata['taxRate'] && (
                        <span className="text-xs ml-1">({(parseFloat(quote.metadata['taxRate'] as string) * 100).toFixed(1)}%)</span>
                      )}:
                    </span>
                    <span className="text-text-primary">{formatCurrency(quote.taxAmount, currency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-surface-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-text-primary">Total Amount:</span>
              <span className="text-xl font-bold text-text-primary">
                {formatCurrency(quote.totalAmount, currency)}
              </span>
            </div>
          </div>

          {/* Server Truth Indicator */}
          <div className="text-xs text-text-secondary italic border-t border-surface-border pt-2">
            * All calculations performed server-side for accuracy
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
