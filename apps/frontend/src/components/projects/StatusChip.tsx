/**
 * StatusChip Component
 * Displays project status with appropriate colors and accessibility features
 */

import React from 'react';
import { cn } from '../../lib/utils';
import type { ProjectStatus } from '../../features/projects/types';

interface StatusChipProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20',
    ariaLabel: 'Project is currently active and in progress'
  },
  completed: {
    label: 'Completed',
    className: 'bg-semantic-info/10 text-semantic-info border-semantic-info/20',
    ariaLabel: 'Project has been completed successfully'
  },
  'on-hold': {
    label: 'On Hold',
    className: 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20',
    ariaLabel: 'Project is temporarily paused or on hold'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-semantic-error/10 text-semantic-error border-semantic-error/20',
    ariaLabel: 'Project has been cancelled or terminated'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm'
};

export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  size = 'md', 
  className 
}) => {
  const config = statusConfig[status];
  
  if (!config) {
    console.warn(`Unknown project status: ${status}`);
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
    >
      <span className="sr-only">Status: </span>
      {config.label}
    </span>
  );
};

