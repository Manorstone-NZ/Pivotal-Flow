import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../Button';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject', comments?: string, reason?: string) => void;
  action: 'approve' | 'reject';
  itemCount: number;
  isLoading?: boolean;
  title?: string;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  itemCount,
  isLoading = false,
  title
}) => {
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  // Common rejection reasons
  const rejectionReasons = [
    'Insufficient detail in description',
    'Time allocation seems excessive',
    'Activity not billable to client',
    'Missing project assignment',
    'Duplicate entry detected',
    'Incorrect date or time',
    'Requires additional documentation',
    'Not approved work category',
    'Custom reason'
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setComments('');
      setReason('');
      setSelectedReason('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const finalReason = action === 'reject' 
      ? (selectedReason === 'Custom reason' ? reason : selectedReason)
      : undefined;
    
    onConfirm(action, comments, finalReason);
  };

  const isValid = action === 'approve' || (action === 'reject' && (
    (selectedReason && selectedReason !== 'Custom reason') || 
    (selectedReason === 'Custom reason' && reason.trim())
  ));

  if (!isOpen) return null;

  const modalTitle = title || (action === 'approve' ? 'Approve Time Entries' : 'Reject Time Entries');
  const actionText = action === 'approve' ? 'Approve' : 'Reject';
  const itemText = itemCount === 1 ? 'entry' : 'entries';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
              action === 'approve' 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              {action === 'approve' ? (
                <CheckIcon className="h-6 w-6 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                {modalTitle}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to {action} {itemCount} time {itemText}?
                  {action === 'approve' && ' This action cannot be undone.'}
                </p>
              </div>

              {/* Rejection reason selection */}
              {action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    required
                  >
                    <option value="">Select a reason...</option>
                    {rejectionReasons.map((reasonOption) => (
                      <option key={reasonOption} value={reasonOption}>
                        {reasonOption}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom reason input */}
              {action === 'reject' && selectedReason === 'Custom reason' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom reason *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a specific reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    required
                  />
                </div>
              )}

              {/* Comments */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {action === 'approve' ? 'Comments (optional)' : 'Additional comments (optional)'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    action === 'approve' 
                      ? 'Add any comments about the approval...'
                      : 'Add any additional context or feedback...'
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              {/* Guidelines */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {action === 'approve' ? 'Approval Guidelines:' : 'Rejection Guidelines:'}
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {action === 'approve' ? (
                    <>
                      <li>• Verify time allocation is reasonable</li>
                      <li>• Confirm work was authorized</li>
                      <li>• Check billability is correct</li>
                    </>
                  ) : (
                    <>
                      <li>• Provide clear, actionable feedback</li>
                      <li>• Be specific about what needs correction</li>
                      <li>• Consider contacting the user directly for complex issues</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleConfirm}
              disabled={!isValid || isLoading}
              className={`w-full sm:w-auto sm:ml-3 ${
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {action === 'approve' ? (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 mr-2" />
                  )}
                  {actionText} {itemCount} {itemText}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

