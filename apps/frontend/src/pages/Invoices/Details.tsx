import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useInvoice,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
  useMarkInvoicePaid,
  useVoidInvoice,
  type Invoice,
  type InvoiceStatusTransition,
  type MarkInvoicePaidData,
} from '../../features/invoices/api';
import {
  StatusBadge,
  InvoiceTotals,
  PaymentTimeline,
  getStatusTransitionOptions,
  isStatusEditable,
  isStatusPayable,
} from '../../components/invoices';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

/**
 * Format date for display
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for input
 */
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

/**
 * InvoiceDetailsPage component
 */
export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);

  // Form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    notes: '',
    dueDate: '',
  });

  const [statusForm, setStatusForm] = useState({
    status: '' as any,
    reason: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: '',
    reference: '',
    notes: '',
  });

  const [voidForm, setVoidForm] = useState({
    reason: '',
  });

  // API hooks
  const { data: invoice, isLoading, error } = useInvoice(id!);
  const updateInvoiceMutation = useUpdateInvoice();
  const updateStatusMutation = useUpdateInvoiceStatus();
  const markPaidMutation = useMarkInvoicePaid();
  const voidInvoiceMutation = useVoidInvoice();

  // Initialize edit form when invoice loads
  React.useEffect(() => {
    if (invoice && !isEditing) {
      setEditForm({
        title: invoice.title,
        description: invoice.description || '',
        notes: invoice.notes || '',
        dueDate: formatDateForInput(invoice.dueAt),
      });
    }
  }, [invoice, isEditing]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-surface-background p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">
                Invoice not found
              </h2>
              <p className="text-text-secondary mb-4">
                The invoice you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/invoices')}>
                Back to Invoices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: invoice.title,
      description: invoice.description || '',
      notes: invoice.notes || '',
      dueDate: formatDateForInput(invoice.dueAt),
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id: invoice.id,
        data: {
          title: editForm.title,
          description: editForm.description || undefined,
          notes: editForm.notes || undefined,
          dueDate: editForm.dueDate || undefined,
        },
      });

      setIsEditing(false);
      success('Invoice updated successfully');
    } catch (err) {
      showError('Failed to update invoice');
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: invoice.id,
        data: {
          status: statusForm.status,
          reason: statusForm.reason || undefined,
        },
      });

      setShowStatusModal(false);
      setStatusForm({ status: '' as any, reason: '' });
      success('Invoice status updated successfully');
    } catch (err) {
      showError('Failed to update invoice status');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync({
        id: invoice.id,
        data: {
          paymentDate: paymentForm.paymentDate,
          amount: paymentForm.amount ? parseFloat(paymentForm.amount) : undefined,
          paymentMethod: paymentForm.paymentMethod || undefined,
          reference: paymentForm.reference || undefined,
          notes: paymentForm.notes || undefined,
        },
      });

      setShowPaymentModal(false);
      setPaymentForm({
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: '',
        reference: '',
        notes: '',
      });
      success('Payment recorded successfully');
    } catch (err) {
      showError('Failed to record payment');
    }
  };

  const handleVoid = async () => {
    try {
      await voidInvoiceMutation.mutateAsync({
        id: invoice.id,
        data: {
          reason: voidForm.reason,
        },
      });

      setShowVoidModal(false);
      setVoidForm({ reason: '' });
      success('Invoice voided successfully');
    } catch (err) {
      showError('Failed to void invoice');
    }
  };

  const canEdit = isStatusEditable(invoice.status);
  const canPay = isStatusPayable(invoice.status);
  const statusTransitionOptions = getStatusTransitionOptions(invoice.status);

  return (
    <div className="min-h-screen bg-surface-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/invoices')}
              className="text-text-secondary hover:text-text-primary"
            >
              ← Back to Invoices
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-text-primary">
                  {invoice.invoiceNumber}
                </h1>
                <StatusBadge status={invoice.status} />
                {invoice.etag && (
                  <Badge variant="secondary" size="sm" title="ETag cached">
                    Cached
                  </Badge>
                )}
              </div>
              <p className="text-text-secondary">
                Created {formatDate(invoice.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {canPay && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                variant="success"
                size="sm"
              >
                Record Payment
              </Button>
            )}

            {statusTransitionOptions.length > 0 && (
              <Button
                onClick={() => setShowStatusModal(true)}
                variant="outline"
                size="sm"
              >
                Change Status
              </Button>
            )}

            {canEdit && (
              <Button
                onClick={isEditing ? handleSaveEdit : handleEdit}
                loading={updateInvoiceMutation.isPending}
                size="sm"
              >
                {isEditing ? 'Save Changes' : 'Edit'}
              </Button>
            )}

            {isEditing && (
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Title
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Invoice title"
                    />
                  ) : (
                    <p className="text-text-primary font-medium">{invoice.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Invoice description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-text-secondary">
                      {invoice.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Customer
                  </label>
                  <div className="bg-surface-secondary p-3 rounded-md">
                    <div className="font-medium">{invoice.customer?.name || 'Unknown Customer'}</div>
                    {invoice.customer?.email && (
                      <div className="text-sm text-text-secondary">{invoice.customer.email}</div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Issued Date
                    </label>
                    <p className="text-text-secondary">
                      {formatDate(invoice.issuedAt) || 'Not issued'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Due Date
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      />
                    ) : (
                      <p className="text-text-secondary">
                        {formatDate(invoice.dueAt) || 'No due date set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Notes
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Internal notes"
                      rows={2}
                    />
                  ) : (
                    <p className="text-text-secondary">
                      {invoice.notes || 'No notes added'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoice.lineItems.map((item, index) => (
                      <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-text-secondary">
                              {item.quantity} × {new Intl.NumberFormat('en-NZ', {
                                style: 'currency',
                                currency: invoice.currency,
                              }).format(item.unitPrice)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {new Intl.NumberFormat('en-NZ', {
                                style: 'currency',
                                currency: invoice.currency,
                              }).format(item.totalAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            {invoice.payments && (
              <PaymentTimeline
                payments={invoice.payments}
                invoice={invoice}
              />
            )}
          </div>

          {/* Right Column - Totals and Actions */}
          <div className="space-y-6">
            {/* Invoice Totals */}
            <InvoiceTotals invoice={invoice} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canPay && (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full"
                    variant="success"
                  >
                    Record Payment
                  </Button>
                )}

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full"
                >
                  Print Invoice
                </Button>

                {invoice.status !== 'void' && (
                  <Button
                    onClick={() => setShowVoidModal(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    Void Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Change Invoice Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    New Status
                  </label>
                  <Select
                    value={statusForm.status}
                    onValueChange={(value) => setStatusForm({ ...statusForm, status: value as any })}
                  >
                    <option value="">Select status...</option>
                    {statusTransitionOptions.map((option) => (
                      <option key={option.status} value={option.status}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Reason (Optional)
                  </label>
                  <Textarea
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                    placeholder="Reason for status change"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleStatusChange}
                    loading={updateStatusMutation.isPending}
                    disabled={!statusForm.status}
                    className="flex-1"
                  >
                    Update Status
                  </Button>
                  <Button
                    onClick={() => setShowStatusModal(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Record Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Payment Date
                    </label>
                    <Input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={`${invoice.balanceAmount.toFixed(2)} (balance)`}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Payment Method
                  </label>
                  <Select
                    value={paymentForm.paymentMethod}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                  >
                    <option value="">Select method...</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="eftpos">EFTPOS</option>
                    <option value="direct_debit">Direct Debit</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Reference
                  </label>
                  <Input
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="Transaction reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Notes
                  </label>
                  <Textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Payment notes"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleMarkPaid}
                    loading={markPaidMutation.isPending}
                    className="flex-1"
                  >
                    Record Payment
                  </Button>
                  <Button
                    onClick={() => setShowPaymentModal(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Void Modal */}
        {showVoidModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Void Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> Voiding an invoice cannot be undone. The invoice will be marked as void and cannot be paid or modified.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Reason for Voiding <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={voidForm.reason}
                    onChange={(e) => setVoidForm({ ...voidForm, reason: e.target.value })}
                    placeholder="Explain why this invoice is being voided"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleVoid}
                    loading={voidInvoiceMutation.isPending}
                    disabled={!voidForm.reason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    Void Invoice
                  </Button>
                  <Button
                    onClick={() => setShowVoidModal(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
