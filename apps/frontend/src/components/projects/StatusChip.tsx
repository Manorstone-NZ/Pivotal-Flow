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
    className: 'bg-green-100 text-green-800 border-green-200',
    ariaLabel: 'Project is currently active and in progress'
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    ariaLabel: 'Project has been completed successfully'
  },
  'on-hold': {
    label: 'On Hold',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ariaLabel: 'Project is temporarily paused or on hold'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200',
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

