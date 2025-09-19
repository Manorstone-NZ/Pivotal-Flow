import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  UserIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { DecisionModal } from './DecisionModal';
import { 
  useTimeApprovals, 
  useApproveTimeEntry, 
  useRejectTimeEntry,
  useBulkApproveTimeEntries,
  useBulkRejectTimeEntries,
  formatDuration,
  formatCurrency,
  getActivityTypeColor,
  type TimeApprovalItem
} from '../../features/approvals/api';

interface ApprovalQueueProps {
  className?: string;
}

interface ApprovalAction {
  type: 'approve' | 'reject';
  item: TimeApprovalItem;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ className = '' }) => {
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<ApprovalAction | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch pending approvals
  const { data: approvalsResponse, isLoading, error, refetch } = useTimeApprovals(page, 20);
  const approvals = approvalsResponse?.data || [];
  const pagination = approvalsResponse?.pagination;

  // Mutations
  const approveTimeEntry = useApproveTimeEntry();
  const rejectTimeEntry = useRejectTimeEntry();
  const bulkApprove = useBulkApproveTimeEntries();
  const bulkReject = useBulkRejectTimeEntries();

  // Calculate totals
  const totals = useMemo(() => {
    return approvals.reduce(
      (acc, item) => {
        acc.totalHours += item.duration / 60;
        acc.billableHours += item.billable ? item.duration / 60 : 0;
        if (item.billableAmount) {
          acc.totalAmount += item.billableAmount;
        }
        return acc;
      },
      { totalHours: 0, billableHours: 0, totalAmount: 0 }
    );
  }, [approvals]);

  // Handle item selection
  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(new Set(approvals.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle expand/collapse
  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Handle individual approval actions
  const handleApprove = (item: TimeApprovalItem) => {
    setPendingAction({ type: 'approve', item });
  };

  const handleReject = (item: TimeApprovalItem) => {
    setPendingAction({ type: 'reject', item });
  };

  // Handle bulk actions
  const handleBulkApprove = () => {
    if (selectedItems.size === 0) return;
    setBulkAction('approve');
  };

  const handleBulkReject = () => {
    if (selectedItems.size === 0) return;
    setBulkAction('reject');
  };

  // Execute approval/rejection
  const executeAction = async (action: 'approve' | 'reject', comments?: string, reason?: string) => {
    try {
      if (pendingAction) {
        // Single item action
        if (action === 'approve') {
          await approveTimeEntry.mutateAsync({ 
            id: pendingAction.item.id, 
            ...(comments && { comments })
          });
        } else {
          await rejectTimeEntry.mutateAsync({ 
            id: pendingAction.item.id, 
            reason: reason || 'No reason provided',
            ...(comments && { comments })
          });
        }
      } else if (bulkAction && selectedItems.size > 0) {
        // Bulk action
        const ids = Array.from(selectedItems);
        if (action === 'approve') {
          await bulkApprove.mutateAsync({ 
            ids, 
            ...(comments && { comments })
          });
        } else {
          await bulkReject.mutateAsync({ 
            ids, 
            reason: reason || 'No reason provided',
            ...(comments && { comments })
          });
        }
        setSelectedItems(new Set());
      }
      
      setPendingAction(null);
      setBulkAction(null);
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-600">
            <p>Failed to load pending approvals</p>
            <Button onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Entry Approvals</CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {approvals.length} pending approval{approvals.length !== 1 ? 's' : ''}
                {pagination && ` (${pagination.total} total)`}
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-medium text-text-primary">
                  {Math.round(totals.totalHours * 100) / 100}h
                </div>
                <div className="text-text-secondary">Total</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-semantic-success">
                  {Math.round(totals.billableHours * 100) / 100}h
                </div>
                <div className="text-text-secondary">Billable</div>
              </div>
              {totals.totalAmount > 0 && (
                <div className="text-center">
                  <div className="font-medium text-text-primary">
                    {formatCurrency(totals.totalAmount)}
                  </div>
                  <div className="text-text-secondary">Value</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk actions */}
      {approvals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === approvals.length && approvals.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    Select all ({selectedItems.size} selected)
                  </span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={selectedItems.size === 0 || bulkApprove.isPending}
                  className="text-semantic-success border-semantic-success hover:bg-semantic-success hover:text-white"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Approve Selected ({selectedItems.size})
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={selectedItems.size === 0 || bulkReject.isPending}
                  className="text-semantic-error border-semantic-error hover:bg-semantic-error hover:text-white"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Reject Selected ({selectedItems.size})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval items */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <LoadingSpinner className="mx-auto mb-2" />
              <p className="text-text-secondary">Loading approvals...</p>
            </CardContent>
          </Card>
        ) : approvals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No pending approvals
              </h3>
              <p className="text-text-secondary">
                All time entries have been reviewed
              </p>
            </CardContent>
          </Card>
        ) : (
          approvals.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isSelected = selectedItems.has(item.id);
            
            return (
              <Card key={item.id} className={`${isSelected ? 'ring-2 ring-brand-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-text-secondary" />
                          <span className="font-medium text-text-primary">
                            {item.userName || `User ${item.userId}`}
                          </span>
                          <span className="text-text-secondary">•</span>
                          <span className="text-sm text-text-secondary">
                            {format(parseISO(item.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text-primary">
                            {formatDuration(item.duration)}
                          </span>
                          {item.billableAmount && (
                            <span className="text-semantic-success font-medium">
                              {formatCurrency(item.billableAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${getActivityTypeColor(item.activityType)}`}>
                          {item.activityType}
                        </span>
                        
                        {item.billable ? (
                          <span className="text-xs text-semantic-success">Billable</span>
                        ) : (
                          <span className="text-xs text-text-secondary">Non-billable</span>
                        )}
                        
                        {item.projectId && (
                          <div className="flex items-center space-x-1 text-xs text-text-secondary">
                            <FolderIcon className="h-3 w-3" />
                            <span>Project</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-text-primary mb-3">
                        {item.description}
                      </p>
                      
                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded">
                          <div className="text-xs text-text-secondary">
                            <strong>Submitted:</strong> {format(parseISO(item.submittedAt), 'MMM d, yyyy HH:mm')}
                          </div>
                          <div className="text-xs text-text-secondary">
                            <strong>Created:</strong> {format(parseISO(item.createdAt), 'MMM d, yyyy HH:mm')}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="text-xs text-text-secondary">
                              <strong>Tags:</strong> {item.tags.join(', ')}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-xs text-text-secondary">
                              <strong>Notes:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpand(item.id)}
                          className="text-xs"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="h-3 w-3 mr-1" />
                              Less details
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="h-3 w-3 mr-1" />
                              More details
                            </>
                          )}
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(item)}
                            disabled={rejectTimeEntry.isPending}
                            className="text-semantic-error border-semantic-error hover:bg-semantic-error hover:text-white"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(item)}
                            disabled={approveTimeEntry.isPending}
                            className="text-semantic-success border-semantic-success hover:bg-semantic-success hover:text-white"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-text-secondary">
                  Page {page} of {pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Modal */}
      <DecisionModal
        isOpen={!!pendingAction || !!bulkAction}
        onClose={() => {
          setPendingAction(null);
          setBulkAction(null);
        }}
        onConfirm={executeAction}
        action={pendingAction?.type || bulkAction || 'approve'}
        itemCount={pendingAction ? 1 : selectedItems.size}
        isLoading={approveTimeEntry.isPending || rejectTimeEntry.isPending || bulkApprove.isPending || bulkReject.isPending}
      />
    </div>
  );
};

