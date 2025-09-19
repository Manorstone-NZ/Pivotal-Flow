import React, { useState } from 'react';
import { PlusIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { WeekGrid } from '../../components/time/WeekGrid';
import { TimeEntryModal } from '../../components/time/TimeEntryModal';
import { useAuth } from '../../features/auth/store';
import { useSubmitTimeEntry, type TimeEntry } from '../../features/time/api';

export const TimePage: React.FC = () => {
  const { user } = useAuth();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const submitTimeEntry = useSubmitTimeEntry();

  const handleAddEntry = (date?: string) => {
    setSelectedDate(date);
    setShowAddEntry(true);
  };

  const handleEditEntry = (entry: any) => {
    // In a real implementation, this would open an edit modal or navigate to edit form
    console.log('Edit time entry:', entry);
  };

  const handleSubmitEntry = async (entry: TimeEntry) => {
    try {
      await submitTimeEntry.mutateAsync(entry.id);
      console.log('Time entry submitted for approval:', entry.id);
    } catch (error) {
      console.error('Failed to submit time entry:', error);
    }
  };

  const handleModalClose = () => {
    setShowAddEntry(false);
    setSelectedDate(undefined);
  };

  const handleEntryCreated = () => {
    // Modal will close automatically, and React Query will refetch data
    console.log('Time entry created successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Time Tracking
          </h1>
          <p className="text-text-secondary mt-2">
            Track your time, manage entries, and submit for approval
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleAddEntry()}
            className="flex items-center space-x-2"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Quick Add</span>
          </Button>
          
          <Button
            onClick={() => handleAddEntry()}
            className="flex items-center space-x-2"
            data-testid="add-time-entry-button"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Time Entry</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">This Week</p>
                <p className="text-2xl font-semibold text-text-primary">32.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Billable</p>
                <p className="text-2xl font-semibold text-text-primary">28.0h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Pending</p>
                <p className="text-2xl font-semibold text-text-primary">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">$</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">This Week</p>
                <p className="text-2xl font-semibold text-text-primary">$2,240</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Time Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Time Grid</CardTitle>
          <p className="text-sm text-text-secondary">
            Track your time across the week. Click + to add entries, use copy/paste to duplicate days.
          </p>
        </CardHeader>
        <CardContent>
          <WeekGrid
            userId={user?.id || undefined}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onSubmitEntry={handleSubmitEntry}
          />
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Entries</CardTitle>
              <p className="text-sm text-text-secondary">
                Your latest time entries and their status
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Placeholder for recent entries - would be replaced with actual TimeEntryRow components */}
            <div className="text-center py-8 text-text-secondary">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Recent time entries will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Add new entry</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">N</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Copy day</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">C</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Paste day</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">V</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Navigate weeks</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">←</kbd>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">→</kbd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entry Modal */}
      <TimeEntryModal
        isOpen={showAddEntry}
        onClose={handleModalClose}
        defaultDate={selectedDate}
        onSuccess={handleEntryCreated}
      />
    </div>
  );
};

