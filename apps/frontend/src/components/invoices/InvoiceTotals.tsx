import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Invoice } from '../../features/invoices/api';

export interface InvoiceTotalsProps {
  invoice: Invoice;
  showPaymentInfo?: boolean;
  className?: string;
}

/**
 * Format currency value for display
 */
const formatCurrency = (amount: number, currency: string = 'NZD'): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * InvoiceTotals component for displaying financial breakdown
 */
export const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  invoice,
  showPaymentInfo = true,
  className,
}) => {
  const {
    currency,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    paidAmount,
    balanceAmount,
    status,
  } = invoice;

  // Calculate tax rate for display
  const taxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;

  // Determine if invoice is fully paid
  const isFullyPaid = status === 'paid' || balanceAmount <= 0;
  const isPartiallyPaid = paidAmount > 0 && balanceAmount > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Invoice Totals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial Breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              Subtotal
            </span>
            <span className="font-medium">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          {/* Discount (if applicable) */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>
                Discount
              </span>
              <span className="font-medium">
                -{formatCurrency(discountAmount, currency)}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              Tax ({taxRate.toFixed(1)}%)
            </span>
            <span className="font-medium">
              {formatCurrency(taxAmount, currency)}
            </span>
          </div>

          {/* Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Total Amount
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(totalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {showPaymentInfo && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-text-primary">
              Payment Status
            </h4>

            {/* Amount Paid */}
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">
                Amount Paid
              </span>
              <span 
                className={`font-medium ${
                  paidAmount > 0 ? 'text-green-600' : 'text-text-secondary'
                }`}
              >
                {formatCurrency(paidAmount, currency)}
              </span>
            </div>

            {/* Balance Due */}
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">
                Balance Due
              </span>
              <span 
                className={`font-medium ${
                  isFullyPaid ? 'text-green-600' : 
                  balanceAmount > 0 ? 'text-red-600' : 'text-text-secondary'
                }`}
              >
                {formatCurrency(balanceAmount, currency)}
              </span>
            </div>

            {/* Payment Status Indicator */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-text-secondary">
                Payment Status:
              </span>
              <div className="flex items-center">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isFullyPaid ? 'bg-green-500' :
                    isPartiallyPaid ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  aria-hidden="true"
                />
                <span 
                  className={`text-sm font-medium ${
                    isFullyPaid ? 'text-green-600' :
                    isPartiallyPaid ? 'text-yellow-600' :
                    'text-red-600'
                  }`}
                >
                  {isFullyPaid ? 'Fully Paid' :
                   isPartiallyPaid ? 'Partially Paid' :
                   'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm text-text-secondary">
              <span>Line Items:</span>
              <span>{invoice.lineItems.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Simplified totals component for list views
 */
export const InvoiceTotalsSummary: React.FC<{
  invoice: Pick<Invoice, 'totalAmount' | 'paidAmount' | 'balanceAmount' | 'currency' | 'status'>;
  className?: string;
}> = ({ invoice, className }) => {
  const { totalAmount, paidAmount, balanceAmount, currency, status } = invoice;
  const isFullyPaid = status === 'paid' || balanceAmount <= 0;

  return (
    <div className={`space-y-1 ${className || ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">Total:</span>
        <span className="font-medium">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>
      
      {paidAmount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Paid:</span>
          <span className="text-sm text-green-600">
            {formatCurrency(paidAmount, currency)}
          </span>
        </div>
      )}
      
      {!isFullyPaid && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Due:</span>
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(balanceAmount, currency)}
          </span>
        </div>
      )}
    </div>
  );
};
