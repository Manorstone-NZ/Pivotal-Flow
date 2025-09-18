import React from 'react';
import { Badge } from '../ui/Badge';
import type { Invoice } from '../../features/invoices/api';

// Status color mapping
const statusColors: Record<Invoice['status'], 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'secondary',
  sent: 'info',
  part_paid: 'warning',
  paid: 'success',
  overdue: 'error',
  written_off: 'error',
  void: 'default',
};

// Status labels
const statusLabels: Record<Invoice['status'], string> = {
  draft: 'Draft',
  sent: 'Sent',
  part_paid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  written_off: 'Written Off',
  void: 'Void',
};

// Status descriptions for accessibility
const statusDescriptions: Record<Invoice['status'], string> = {
  draft: 'Invoice is in draft status and can be edited',
  sent: 'Invoice has been sent to customer',
  part_paid: 'Invoice has been partially paid',
  paid: 'Invoice has been fully paid',
  overdue: 'Invoice payment is overdue',
  written_off: 'Invoice has been written off as uncollectible',
  void: 'Invoice has been voided and is no longer valid',
};

export interface StatusBadgeProps {
  status: Invoice['status'];
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * StatusBadge component for displaying invoice status with appropriate colors and accessibility
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const variant = statusColors[status];
  const label = statusLabels[status];
  const description = statusDescriptions[status];

  return (
    <Badge
      variant={variant}
      size={size}
      className={className}
      aria-label={`Invoice status: ${label}. ${description}`}
      role="status"
      title={description}
    >
      {showLabel ? label : status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

/**
 * Get status transition options based on current status
 */
export const getStatusTransitionOptions = (currentStatus: Invoice['status']): Array<{
  status: Invoice['status'];
  label: string;
  description: string;
  disabled?: boolean;
  reason?: string;
}> => {
  const baseTransitions = [
    {
      status: 'draft' as const,
      label: 'Draft',
      description: 'Move back to draft for editing',
    },
    {
      status: 'sent' as const,
      label: 'Send',
      description: 'Mark as sent to customer',
    },
    {
      status: 'part_paid' as const,
      label: 'Partially Paid',
      description: 'Mark as partially paid',
    },
    {
      status: 'paid' as const,
      label: 'Paid',
      description: 'Mark as fully paid',
    },
    {
      status: 'overdue' as const,
      label: 'Overdue',
      description: 'Mark as overdue',
    },
    {
      status: 'written_off' as const,
      label: 'Write Off',
      description: 'Write off as uncollectible',
    },
    {
      status: 'void' as const,
      label: 'Void',
      description: 'Void this invoice',
    },
  ];

  // Filter based on current status and business rules
  return baseTransitions.filter((transition) => {
    // Can't transition to the same status
    if (transition.status === currentStatus) {
      return false;
    }

    switch (currentStatus) {
      case 'draft':
        // From draft, can go to sent or void
        return ['sent', 'void'].includes(transition.status);
      
      case 'sent':
        // From sent, can go to part_paid, paid, overdue, or void
        return ['part_paid', 'paid', 'overdue', 'void'].includes(transition.status);
      
      case 'part_paid':
        // From part_paid, can go to paid, overdue, or written_off
        return ['paid', 'overdue', 'written_off'].includes(transition.status);
      
      case 'paid':
        // Paid invoices can only be written off or voided in special cases
        return ['written_off'].includes(transition.status);
      
      case 'overdue':
        // From overdue, can go to part_paid, paid, or written_off
        return ['part_paid', 'paid', 'written_off'].includes(transition.status);
      
      case 'written_off':
        // Written off is usually final
        return false;
      
      case 'void':
        // Void is final
        return false;
      
      default:
        return false;
    }
  });
};

/**
 * Check if an invoice status allows editing
 */
export const isStatusEditable = (status: Invoice['status']): boolean => {
  return status === 'draft';
};

/**
 * Check if an invoice status allows payments
 */
export const isStatusPayable = (status: Invoice['status']): boolean => {
  return ['sent', 'part_paid', 'overdue'].includes(status);
};

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export const getStatusPriority = (status: Invoice['status']): number => {
  const priorities: Record<Invoice['status'], number> = {
    overdue: 1,
    sent: 2,
    part_paid: 3,
    draft: 4,
    paid: 5,
    written_off: 6,
    void: 7,
  };
  
  return priorities[status] || 999;
};
