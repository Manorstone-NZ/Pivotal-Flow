/**
 * Quote Delivery Panel - SaaS Multi-Tenant
 * Staff interface for quote delivery management
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Type, type Static } from '@sinclair/typebox';
import { 
  PaperAirplaneIcon, 
  LinkIcon, 
  ClipboardDocumentIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { Button } from '../Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { FormModal } from '../ui/FormModal';
import { useToast } from '../ui/Toast';
import { QuoteStatusChip, canPerformAction } from './QuoteStatusChip';

// TypeBox schema for delivery form
const DeliveryFormSchema = Type.Object({
  recipientEmail: Type.Optional(Type.String({ format: 'email' })),
  customMessage: Type.Optional(Type.String({ maxLength: 500 })),
  expirationDays: Type.Optional(Type.Number({ minimum: 1, maximum: 30 }))
});

type DeliveryFormData = Static<typeof DeliveryFormSchema>;

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  deliveredAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  sentAt?: string;
  validUntil: string;
  customer: {
    companyName: string;
    email?: string;
  };
}

interface QuoteDeliveryPanelProps {
  quote: Quote;
  onDeliverySuccess: () => void;
}

interface DeliveryResult {
  success: boolean;
  publicUrl: string;
  token: string;
  deliveredAt: string;
  expiresAt: string;
  message?: string;
}

export const QuoteDeliveryPanel: React.FC<QuoteDeliveryPanelProps> = ({
  quote,
  onDeliverySuccess
}) => {
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const { success, error: showError } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DeliveryFormData>({
    defaultValues: {
      recipientEmail: quote.customer.email || '',
      customMessage: '',
      expirationDays: 30
    }
  });

  const canDeliver = canPerformAction(quote.status as any, 'deliver');
  const isDelivered = ['sent', 'viewed', 'accepted', 'rejected'].includes(quote.status);

  const handleDelivery = async (data: DeliveryFormData) => {
    setIsDelivering(true);
    try {
      // Call delivery API (would be implemented in features/quotes/api.ts)
      const response = await fetch(`/api/v1/quotes/${quote.id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth headers would be added by API client
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to deliver quote');
      }

      const result: DeliveryResult = await response.json();
      setDeliveryResult(result);
      success('Quote delivered successfully!');
      onDeliverySuccess();
      
    } catch (error) {
      showError('Failed to deliver quote. Please try again.');
    } finally {
      setIsDelivering(false);
    }
  };

  const copyPublicUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      success('Public URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      showError('Failed to copy URL to clipboard');
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not yet';
    return new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PaperAirplaneIcon className="w-5 h-5" />
          <span>Quote Delivery</span>
          <QuoteStatusChip status={quote.status as any} size="sm" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Delivery Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 text-text-secondary">
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Delivered</span>
            </div>
            <div className="font-medium text-text-primary">
              {formatDateTime(quote.deliveredAt || quote.sentAt)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 text-text-secondary">
              <EyeIcon className="w-4 h-4" />
              <span>Viewed</span>
            </div>
            <div className="font-medium text-text-primary">
              {formatDateTime(quote.viewedAt)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 text-text-secondary">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Accepted</span>
            </div>
            <div className="font-medium text-text-primary">
              {formatDateTime(quote.acceptedAt)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 text-text-secondary">
              <CalendarIcon className="w-4 h-4" />
              <span>Valid Until</span>
            </div>
            <div className="font-medium text-text-primary">
              {formatDateTime(quote.validUntil)}
            </div>
          </div>
        </div>

        {/* Delivery Actions */}
        <div className="flex space-x-3 pt-4 border-t border-border-subtle">
          {canDeliver && (
            <Button
              onClick={() => setIsDeliveryModalOpen(true)}
              className="flex items-center space-x-2"
              variant="primary"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Deliver Quote</span>
            </Button>
          )}
          
          {isDelivered && deliveryResult && (
            <Button
              onClick={() => copyPublicUrl(deliveryResult.publicUrl)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{copiedUrl ? 'Copied!' : 'Copy Public URL'}</span>
            </Button>
          )}
        </div>

        {/* Delivery Modal */}
        <FormModal
          open={isDeliveryModalOpen}
          onClose={() => {
            setIsDeliveryModalOpen(false);
            reset();
          }}
          title="Deliver Quote to Customer"
          description={`Send "${quote.title}" to ${quote.customer.companyName} for approval`}
          size="lg"
        >
          <form onSubmit={handleSubmit(handleDelivery)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-text-primary mb-1">
                  Recipient Email
                </label>
                <Input
                  id="recipientEmail"
                  type="email"
                  {...register('recipientEmail')}
                  placeholder="customer@company.com"
                  error={errors.recipientEmail?.message}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Email address where the quote will be sent
                </p>
              </div>

              <div>
                <label htmlFor="customMessage" className="block text-sm font-medium text-text-primary mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  id="customMessage"
                  {...register('customMessage')}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="Add a personal message for the customer..."
                />
                <p className="text-xs text-text-secondary mt-1">
                  Personal message to include with the quote
                </p>
              </div>

              <div>
                <label htmlFor="expirationDays" className="block text-sm font-medium text-text-primary mb-1">
                  Link Expiration (Days)
                </label>
                <Input
                  id="expirationDays"
                  type="number"
                  min={1}
                  max={30}
                  {...register('expirationDays', { 
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 30, message: 'Maximum 30 days for SaaS compliance' }
                  })}
                  error={errors.expirationDays?.message}
                />
                <p className="text-xs text-text-secondary mt-1">
                  How long the public link remains valid (max 30 days)
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border-subtle">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeliveryModalOpen(false)}
                disabled={isDelivering}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isDelivering}
                className="flex items-center space-x-2"
              >
                {isDelivering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Delivering...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Deliver Quote</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormModal>

        {/* Success Result Display */}
        {deliveryResult && (
          <div className="mt-4 p-4 bg-surface-success rounded-lg border border-border-success">
            <div className="flex items-center space-x-2 text-text-success mb-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">Quote Delivered Successfully</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Public URL:</span>
                <Button
                  onClick={() => copyPublicUrl(deliveryResult.publicUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <ClipboardDocumentIcon className="w-3 h-3" />
                  <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
              
              <div className="text-xs text-text-secondary bg-surface-card p-2 rounded font-mono break-all">
                {deliveryResult.publicUrl}
              </div>
              
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Delivered: {formatDateTime(deliveryResult.deliveredAt)}</span>
                <span>Expires: {formatDateTime(deliveryResult.expiresAt)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
