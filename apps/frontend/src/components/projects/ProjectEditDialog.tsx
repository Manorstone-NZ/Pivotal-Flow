/**
 * Project Edit Dialog Component
 * Modal dialog for editing project details
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useUpdateProject } from '../../features/projects/api';
import type { ProjectDetailResponse, UpdateProject } from '../../features/projects/types';

interface ProjectEditDialogProps {
  open: boolean;
  onClose: () => void;
  project: ProjectDetailResponse;
  onSuccess?: () => void;
}

const PROJECT_STATUSES: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  open,
  onClose,
  project,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UpdateProject>({
    name: project.name,
    code: project.code || '',
    description: project.description || '',
    status: project.status,
    startDate: project.startDate || '',
    endDate: project.endDate || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProjectMutation = useUpdateProject();

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code || '',
        description: project.description || '',
        status: project.status,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });
      setErrors({});
    }
  }, [project]);

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
      // Clean up form data - always send required fields, optional fields only if they have values
      const cleanedData: UpdateProject = {
        // Always send name as it's required
        name: formData.name || project.name,
        // Always send status
        status: formData.status || project.status,
      };
      
      // Optional fields - send if they have values
      if (formData.code) {
        cleanedData.code = formData.code;
      }
      if (formData.description) {
        cleanedData.description = formData.description;
      }
      if (formData.startDate) {
        cleanedData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        cleanedData.endDate = formData.endDate;
      }
      
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: cleanedData
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      setErrors({ ['submit']: 'Failed to update project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: keyof UpdateProject, value: string) => {
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
      name: project.name,
      code: project.code || '',
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    });
    setErrors({});
    onClose();
  }, [project, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="Edit Project"
      description="Update project details and settings"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6" key="edit-project-form">
        {/* Project Name */}
        <Input
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
          label="Project Code"
          value={formData.code || ''}
          onChange={handleCodeChange}
          placeholder="Enter project code (optional)"
          error={errors['code']}
          disabled={isSubmitting}
        />

        {/* Description */}
        <TextArea
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
            type="date"
            label="Start Date"
            value={formData.startDate || ''}
            onChange={handleStartDateChange}
            error={errors['startDate']}
            disabled={isSubmitting}
          />
          
          <Input
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
