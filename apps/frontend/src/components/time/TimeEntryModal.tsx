import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { useCreateTimeEntry, type CreateTimeEntryData } from '../../features/time/api';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateTimeEntryData>({
    date: defaultDate || new Date().toISOString().split('T')[0],
    duration: 480, // 8 hours default
    description: '',
    activityType: 'development',
    billable: true,
    hourlyRate: 85,
    breakMinutes: 60,
    tags: [],
    notes: ''
  });

  const createTimeEntry = useCreateTimeEntry();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: defaultDate || new Date().toISOString().split('T')[0],
        duration: 480,
        description: '',
        activityType: 'development',
        billable: true,
        hourlyRate: 85,
        breakMinutes: 60,
        tags: [],
        notes: ''
      });
    }
  }, [isOpen, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTimeEntry.mutateAsync(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create time entry:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTimeEntryData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDurationToHours = (minutes: number): string => {
    return (minutes / 60).toFixed(1);
  };

  const parseDurationFromHours = (hours: string): number => {
    return Math.round(parseFloat(hours) * 60);
  };

  if (!isOpen) return null;

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
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Add Time Entry
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formatDurationToHours(formData.duration)}
                    onChange={(e) => handleInputChange('duration', parseDurationFromHours(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.duration} minutes total
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the work you performed..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    required
                  />
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => handleInputChange('activityType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  >
                    <option value="development">Development</option>
                    <option value="meeting">Meeting</option>
                    <option value="admin">Admin</option>
                    <option value="research">Research</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {/* Billable */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.billable}
                      onChange={(e) => handleInputChange('billable', e.target.checked)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Billable</span>
                  </label>

                  {formData.billable && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.hourlyRate || ''}
                        onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Break Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={formData.breakMinutes}
                    onChange={(e) => handleInputChange('breakMinutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    placeholder="frontend, react, dashboard"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or context..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                {/* Calculated Total */}
                {formData.billable && formData.hourlyRate && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <div className="text-sm text-green-800">
                      <strong>Billable Amount:</strong> ${((formData.hourlyRate * formData.duration) / 60).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={createTimeEntry.isPending}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={createTimeEntry.isPending || !formData.description.trim()}
                    className="bg-brand-primary hover:bg-brand-secondary text-white"
                  >
                    {createTimeEntry.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Time Entry'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
