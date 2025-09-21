import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Payment, Invoice } from '../../features/invoices/api';

export interface PaymentTimelineProps {
  payments: Payment[];
  invoice: Pick<Invoice, 'currency' | 'totalAmount' | 'status'>;
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
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time for display
 */
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-NZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get payment method display name
 */
const getPaymentMethodLabel = (method?: string): string => {
  if (!method) return 'Not specified';
  
  const methods: Record<string, string> = {
    cash: 'Cash',
    cheque: 'Cheque',
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    eftpos: 'EFTPOS',
    direct_debit: 'Direct Debit',
    paypal: 'PayPal',
    other: 'Other',
  };
  
  return methods[method] || method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * PaymentTimeline component for displaying payment history
 */
export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({
  payments,
  invoice,
  className,
}) => {
  const { currency } = invoice;

  // Sort payments by date (most recent first)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // Calculate running balance for each payment
  const paymentsWithBalance = sortedPayments.reduce((acc, payment, index) => {
    const previousBalance = index === 0 ? 
      invoice.totalAmount : 
      acc[index - 1].runningBalance;
    
    const runningBalance = previousBalance - payment.amount;
    
    acc.push({
      ...payment,
      runningBalance,
    });
    
    return acc;
  }, [] as Array<Payment & { runningBalance: number }>);

  if (payments.length === 0) {
    return (
      <Card {...(className && { className })}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-secondary">
            <div className="mb-2">💳</div>
            <p>No payments recorded yet</p>
            <p className="text-sm mt-1">
              Payments will appear here once recorded
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...(className && { className })}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Payment History
          <Badge variant="secondary" size="sm">
            {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline */}
          <div 
            className="relative"
            role="list"
            aria-label="Payment history timeline"
          >
            {paymentsWithBalance.map((payment, index) => (
              <div
                key={payment.id}
                className="relative pb-6 last:pb-0"
                role="listitem"
                aria-label={`Payment ${index + 1}: ${formatCurrency(payment.amount, currency)} on ${formatDate(payment.paymentDate)}`}
              >
                {/* Timeline line */}
                {index < paymentsWithBalance.length - 1 && (
                  <div 
                    className="absolute left-4 top-8 w-0.5 h-full bg-border"
                    aria-hidden="true"
                  />
                )}

                {/* Payment item */}
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div 
                      className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Payment details */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-surface-secondary rounded-lg p-4 border">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(payment.amount, currency)}
                          </span>
                          <Badge variant="success" size="sm">
                            Received
                          </Badge>
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatDate(payment.paymentDate)}
                        </div>
                      </div>

                      {/* Payment details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Method:</span>
                          <span className="ml-2 font-medium">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </span>
                        </div>
                        
                        {payment.reference && (
                          <div>
                            <span className="text-text-secondary">Reference:</span>
                            <span className="ml-2 font-mono text-xs bg-surface-background px-2 py-1 rounded">
                              {payment.reference}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-text-secondary">Time:</span>
                          <span className="ml-2">
                            {formatTime(payment.paymentDate)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-text-secondary">Balance After:</span>
                          <span 
                            className={`ml-2 font-medium ${
                              payment.runningBalance <= 0 ? 'text-green-600' : 'text-text-primary'
                            }`}
                          >
                            {formatCurrency(payment.runningBalance, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {payment.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-text-secondary text-sm">Notes:</span>
                          <p className="mt-1 text-sm text-text-primary">
                            {payment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Total Payments:</span>
                <div className="font-semibold text-green-600">
                  {formatCurrency(
                    payments.reduce((sum, payment) => sum + payment.amount, 0),
                    currency
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-text-secondary">Last Payment:</span>
                <div className="font-medium">
                  {formatDate(sortedPayments[0].paymentDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Compact payment summary for list views
 */
export const PaymentSummary: React.FC<{
  payments: Payment[];
  currency: string;
  className?: string;
}> = ({ payments, currency, className }) => {
  if (payments.length === 0) {
    return (
      <div className={`text-sm text-text-secondary ${className || ''}`}>
        No payments
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const lastPayment = payments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )[0];

  return (
    <div className={`space-y-1 ${className || ''}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-green-600 font-medium">
          {formatCurrency(totalPaid, currency)} paid
        </span>
        <Badge variant="success" size="sm">
          {payments.length}
        </Badge>
      </div>
      
      <div className="text-xs text-text-secondary">
        Last: {formatDate(lastPayment.paymentDate)}
      </div>
    </div>
  );
};
