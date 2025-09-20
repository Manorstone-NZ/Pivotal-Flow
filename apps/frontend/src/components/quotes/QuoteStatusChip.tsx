/**
 * Quote Status Chip Component - SaaS Multi-Tenant
 * Enhanced status display for quote delivery system
 */

import React from 'react';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  PaperAirplaneIcon,
  EyeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StopIcon
} from '@heroicons/react/24/outline';

export type QuoteStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected' 
  | 'expired' 
  | 'cancelled';

interface QuoteStatusChipProps {
  status: QuoteStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<QuoteStatus, {
  label: string;
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: DocumentTextIcon,
    description: 'Quote is being prepared'
  },
  pending: {
    label: 'Pending Approval',
    variant: 'warning',
    icon: ClockIcon,
    description: 'Awaiting internal approval'
  },
  approved: {
    label: 'Approved',
    variant: 'info',
    icon: CheckCircleIcon,
    description: 'Ready to send to customer'
  },
  sent: {
    label: 'Sent',
    variant: 'primary',
    icon: PaperAirplaneIcon,
    description: 'Delivered to customer'
  },
  viewed: {
    label: 'Viewed',
    variant: 'info',
    icon: EyeIcon,
    description: 'Customer has opened the quote'
  },
  accepted: {
    label: 'Accepted',
    variant: 'success',
    icon: CheckCircleIcon,
    description: 'Customer approved the quote'
  },
  rejected: {
    label: 'Rejected',
    variant: 'error',
    icon: XCircleIcon,
    description: 'Customer declined the quote'
  },
  expired: {
    label: 'Expired',
    variant: 'warning',
    icon: ExclamationTriangleIcon,
    description: 'Quote validity period has ended'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'default',
    icon: StopIcon,
    description: 'Quote was cancelled'
  }
};

export const QuoteStatusChip: React.FC<QuoteStatusChipProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md'
}) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantClasses = {
    default: 'border-gray-200 bg-gray-50 text-gray-700',
    primary: 'border-blue-200 bg-blue-50 text-blue-700',
    secondary: 'border-gray-200 bg-gray-100 text-gray-600',
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700'
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${sizeClasses[size]} ${variantClasses[config.variant]} ${className || ''}`}
      title={config.description}
    >
      <div className="flex items-center space-x-1.5">
        {showIcon && (
          <IconComponent className={iconSizes[size]} />
        )}
        <span>{config.label}</span>
      </div>
    </div>
  );
};

/**
 * Get status progression for SaaS workflow visualization
 */
export const getStatusProgression = (currentStatus: QuoteStatus): {
  completed: QuoteStatus[];
  current: QuoteStatus;
  remaining: QuoteStatus[];
} => {
  const normalFlow: QuoteStatus[] = ['draft', 'approved', 'sent', 'viewed', 'accepted'];
  const currentIndex = normalFlow.indexOf(currentStatus);
  
  if (currentIndex === -1) {
    // Handle terminal states
    if (currentStatus === 'rejected') {
      return {
        completed: ['draft', 'approved', 'sent', 'viewed'],
        current: 'rejected',
        remaining: []
      };
    }
    if (currentStatus === 'expired') {
      return {
        completed: ['draft', 'approved', 'sent'],
        current: 'expired', 
        remaining: []
      };
    }
    return {
      completed: [],
      current: currentStatus,
      remaining: normalFlow
    };
  }

  return {
    completed: normalFlow.slice(0, currentIndex),
    current: currentStatus,
    remaining: normalFlow.slice(currentIndex + 1)
  };
};

/**
 * Check if status allows specific actions in SaaS context
 */
export const canPerformAction = (status: QuoteStatus, action: string): boolean => {
  const actionMap: Record<string, QuoteStatus[]> = {
    deliver: ['draft', 'approved'],
    edit: ['draft'],
    approve: ['pending'],
    cancel: ['draft', 'pending', 'approved', 'sent', 'viewed'],
    expire: ['sent', 'viewed'],
    resend: ['sent', 'viewed', 'rejected']
  };

  return actionMap[action]?.includes(status) || false;
};
