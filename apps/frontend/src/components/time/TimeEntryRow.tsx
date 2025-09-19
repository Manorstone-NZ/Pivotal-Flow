import React from 'react';
import { format, parseISO } from 'date-fns';
import { 
  ClockIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { type TimeEntry } from '../../features/time/api';
import { getActivityTypeColor, getStatusColor } from '../../features/approvals/api';

interface TimeEntryRowProps {
  entry: TimeEntry;
  onEdit?: ((entry: TimeEntry) => void) | undefined;
  onSubmit?: ((entry: TimeEntry) => void) | undefined;
  onDelete?: ((entry: TimeEntry) => void) | undefined;
  compact?: boolean;
  showDate?: boolean;
  className?: string;
}

export const TimeEntryRow: React.FC<TimeEntryRowProps> = ({
  entry,
  onEdit,
  onSubmit,
  onDelete,
  compact = false,
  showDate = false,
  className = ''
}) => {
  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (compact) {
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h${mins}m`;
    }
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  // Format time range
  const formatTimeRange = (): string => {
    if (!entry.startTime || !entry.endTime) return '';
    
    try {
      const start = parseISO(entry.startTime);
      const end = parseISO(entry.endTime);
      return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    } catch {
      return '';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (entry.status) {
      case 'approved':
        return <CheckIcon className="h-4 w-4 text-semantic-success" />;
      case 'rejected':
        return <XMarkIcon className="h-4 w-4 text-semantic-error" />;
      case 'submitted':
        return <ClockIcon className="h-4 w-4 text-semantic-warning" />;
      default:
        return null;
    }
  };

  // Compact view for week grid
  if (compact) {
    return (
      <div 
        className={`p-2 border border-surface-border rounded-lg hover:bg-surface-hover transition-colors cursor-pointer ${className}`}
        onClick={() => onEdit?.(entry)}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <span className={`px-1.5 py-0.5 text-xs rounded ${getActivityTypeColor(entry.activityType)}`}>
              {entry.activityType}
            </span>
            {getStatusIcon()}
          </div>
          <div className="text-xs font-medium text-text-primary">
            {formatDuration(entry.duration)}
          </div>
        </div>
        
        <p className="text-xs text-text-secondary line-clamp-2 mb-1">
          {entry.description}
        </p>
        
        <div className="flex items-center justify-between">
          {formatTimeRange() && (
            <span className="text-xs text-text-secondary">
              {formatTimeRange()}
            </span>
          )}
          
          <div className="flex items-center space-x-1">
            {entry.billable && entry.billableAmount && (
              <span className="text-xs text-semantic-success font-medium">
                ${parseFloat(entry.billableAmount.toString()).toFixed(0)}
              </span>
            )}
            {!entry.billable && (
              <span className="text-xs text-text-secondary">
                Non-billable
              </span>
            )}
          </div>
        </div>
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            <TagIcon className="h-3 w-3 text-text-secondary" />
            <div className="flex flex-wrap gap-1">
              {entry.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs px-1 py-0.5 bg-gray-100 rounded">
                  {tag}
                </span>
              ))}
              {entry.tags.length > 2 && (
                <span className="text-xs text-text-secondary">
                  +{entry.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view for lists
  return (
    <div className={`p-4 border border-surface-border rounded-lg hover:bg-surface-hover transition-colors ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {showDate && (
              <span className="text-sm font-medium text-text-primary">
                {format(parseISO(entry.date), 'MMM d, yyyy')}
              </span>
            )}
            
            <span className={`px-2 py-1 text-xs rounded ${getActivityTypeColor(entry.activityType)}`}>
              {entry.activityType}
            </span>
            
            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(entry.status)}`}>
              {entry.status}
            </span>
            
            {getStatusIcon()}
          </div>
          
          <h3 className="font-medium text-text-primary mb-1">
            {entry.description}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDuration(entry.duration)}</span>
            </div>
            
            {formatTimeRange() && (
              <span>{formatTimeRange()}</span>
            )}
            
            {entry.billable ? (
              <div className="flex items-center space-x-1 text-semantic-success">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>
                  Billable
                  {entry.billableAmount && ` - $${parseFloat(entry.billableAmount.toString()).toFixed(2)}`}
                </span>
              </div>
            ) : (
              <span className="text-text-secondary">Non-billable</span>
            )}
          </div>
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <TagIcon className="h-4 w-4 text-text-secondary" />
              <div className="flex flex-wrap gap-1">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {entry.notes && (
            <p className="text-sm text-text-secondary mt-2 p-2 bg-gray-50 rounded">
              {entry.notes}
            </p>
          )}
          
          {entry.rejectionReason && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>Rejection reason:</strong> {entry.rejectionReason}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {entry.status === 'draft' && onSubmit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSubmit(entry)}
              className="text-xs"
            >
              Submit
            </Button>
          )}
          
          {(entry.status === 'draft' || entry.status === 'rejected') && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              className="p-2"
              data-testid="edit-entry"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          
          {entry.status === 'draft' && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry)}
              className="p-2 text-semantic-error hover:text-semantic-error"
              data-testid="delete-entry"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Timestamps */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border text-xs text-text-secondary">
        <span>
          Created {format(parseISO(entry.createdAt), 'MMM d, yyyy HH:mm')}
        </span>
        
        <div className="flex items-center space-x-4">
          {entry.submittedAt && (
            <span>
              Submitted {format(parseISO(entry.submittedAt), 'MMM d, HH:mm')}
            </span>
          )}
          
          {entry.approvedAt && entry.approvedBy && (
            <span className="text-semantic-success">
              Approved {format(parseISO(entry.approvedAt), 'MMM d, HH:mm')}
            </span>
          )}
          
          {entry.rejectedAt && entry.rejectedBy && (
            <span className="text-semantic-error">
              Rejected {format(parseISO(entry.rejectedAt), 'MMM d, HH:mm')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

