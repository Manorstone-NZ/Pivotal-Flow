/**
 * Project Create Dialog Component
 * Modal dialog for creating new projects
 */

import React, { useState, useCallback } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useCreateProject } from '../../features/projects/api';
import type { CreateProject } from '../../features/projects/types';

interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PROJECT_STATUSES: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateProject>({
    name: '',
    code: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProjectMutation = useCreateProject();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors['name'] = 'Project name is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate > endDate) {
        newErrors['endDate'] = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean up form data - remove empty strings for optional fields
      const cleanedData: CreateProject = {
        name: formData.name || '',
        ...(formData.code && { code: formData.code }),
        ...(formData.description && { description: formData.description }),
        status: formData.status || 'active',
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
      };

      await createProjectMutation.mutateAsync(cleanedData);

      onSuccess?.();
      handleCancel();
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ ['submit']: 'Failed to create project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: keyof CreateProject, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing - only if there's actually an error to clear
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Individual handlers to prevent re-renders
  const handleNameChange = useCallback((value: string) => handleInputChange('name', value), [handleInputChange]);
  const handleCodeChange = useCallback((value: string) => handleInputChange('code', value), [handleInputChange]);
  const handleDescriptionChange = useCallback((value: string) => handleInputChange('description', value), [handleInputChange]);
  const handleStatusChange = useCallback((value: string) => handleInputChange('status', value), [handleInputChange]);
  const handleStartDateChange = useCallback((value: string) => handleInputChange('startDate', value), [handleInputChange]);
  const handleEndDateChange = useCallback((value: string) => handleInputChange('endDate', value), [handleInputChange]);

  const handleCancel = useCallback(() => {
    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'active',
      startDate: '',
      endDate: '',
    });
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="Create New Project"
      description="Create a new project with the details below"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6" key="create-project-form">
        {/* Project Name */}
        <Input
          key="project-name"
          label="Project Name"
          value={formData.name || ''}
          onChange={handleNameChange}
          placeholder="Enter project name"
          required
          error={errors['name']}
          disabled={isSubmitting}
        />

        {/* Project Code */}
        <Input
          key="project-code"
          label="Project Code"
          value={formData.code || ''}
          onChange={handleCodeChange}
          placeholder="Enter project code (optional)"
          error={errors['code']}
          disabled={isSubmitting}
        />

        {/* Description */}
        <TextArea
          key="project-description"
          label="Description"
          value={formData.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Enter project description"
          rows={3}
          error={errors['description']}
          disabled={isSubmitting}
        />

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Status
          </label>
          <Select
            value={String(formData.status || 'active')}
            onValueChange={(value: string) => handleStatusChange(String(value))}
            options={PROJECT_STATUSES}
            disabled={isSubmitting}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            key="project-start-date"
            type="date"
            label="Start Date"
            value={formData.startDate || ''}
            onChange={handleStartDateChange}
            error={errors['startDate']}
            disabled={isSubmitting}
          />
          
          <Input
            key="project-end-date"
            type="date"
            label="End Date"
            value={formData.endDate || ''}
            onChange={handleEndDateChange}
            error={errors['endDate']}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Error */}
        {errors['submit'] && (
          <div className="text-sm text-semantic-error bg-semantic-error/10 p-3 rounded-lg">
            {errors['submit']}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
