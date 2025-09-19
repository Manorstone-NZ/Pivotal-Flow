import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { TimeEntryRow } from './TimeEntryRow';
import { useTimeEntries, useTimeEntryTotals, useSubmitTimeEntry, type TimeEntry } from '../../features/time/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface WeekGridProps {
  userId?: string | undefined;
  onAddEntry?: (date: string) => void;
  onEditEntry?: (entry: TimeEntry) => void;
  onSubmitEntry?: (entry: TimeEntry) => void;
  className?: string;
}

export const WeekGrid: React.FC<WeekGridProps> = ({
  userId,
  onAddEntry,
  onEditEntry,
  onSubmitEntry,
  className = ''
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Calculate week boundaries
  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]); // Monday start
  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  // Fetch time entries for the week
  const {
    data: timeEntriesResponse,
    isLoading,
    error,
    refetch
  } = useTimeEntries({
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
    ...(userId && { userId }),
    limit: 100
  });

  const timeEntries = timeEntriesResponse?.data || [];
  const totals = useTimeEntryTotals(timeEntries);
  const submitTimeEntry = useSubmitTimeEntry();

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, TimeEntry[]> = {};
    timeEntries.forEach(entry => {
      const dateKey = entry.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  }, [timeEntries]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  // Handle add entry
  const handleAddEntry = useCallback((date: Date) => {
    if (onAddEntry) {
      onAddEntry(format(date, 'yyyy-MM-dd'));
    }
  }, [onAddEntry]);

  // Handle copy/paste functionality
  const handleCopyDay = useCallback((sourceDate: string) => {
    const entries = entriesByDate[sourceDate] || [];
    if (entries.length === 0) return;

    // Store in localStorage for simple copy/paste
    localStorage.setItem('copiedTimeEntries', JSON.stringify(entries.map(entry => ({
      projectId: entry.projectId,
      duration: entry.duration,
      description: entry.description,
      activityType: entry.activityType,
      billable: entry.billable,
      hourlyRate: entry.hourlyRate,
      tags: entry.tags,
      notes: entry.notes
    }))));
  }, [entriesByDate]);

  const handlePasteDay = useCallback((targetDate: string) => {
    const copiedData = localStorage.getItem('copiedTimeEntries');
    if (!copiedData) return;

    try {
      const copiedEntries = JSON.parse(copiedData);
      // In a real implementation, you would create new entries for each copied item
      console.log('Pasting entries to', targetDate, copiedEntries);
      // This would trigger the create time entry mutation for each entry
    } catch (error) {
      console.error('Failed to paste entries:', error);
    }
  }, []);

  // Calculate daily totals
  const getDayTotals = useCallback((date: string) => {
    const dayEntries = entriesByDate[date] || [];
    return dayEntries.reduce(
      (acc, entry) => {
        acc.totalMinutes += entry.duration;
        acc.billableMinutes += entry.billable ? entry.duration : 0;
        return acc;
      },
      { totalMinutes: 0, billableMinutes: 0 }
    );
  }, [entriesByDate]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Failed to load time entries</p>
          <Button onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="week-grid">
      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousWeek}
                className="p-2"
                aria-label="Previous week"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold text-text-primary">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </h2>
                <p className="text-sm text-text-secondary">
                  Week {format(weekStart, 'w')} of {format(weekStart, 'yyyy')}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextWeek}
                className="p-2"
                aria-label="Next week"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToCurrentWeek}
              >
                Today
              </Button>
              
              {/* Weekly Totals */}
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{totals.totalHours}h total</span>
                </div>
                <div className="text-semantic-success">
                  {totals.billableHours}h billable
                </div>
                {totals.totalAmount > 0 && (
                  <div className="font-medium text-text-primary">
                    ${totals.totalAmount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEntries = entriesByDate[dateKey] || [];
          const dayTotals = getDayTotals(dateKey);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <Card
              key={dateKey}
              className={`min-h-[300px] ${isToday ? 'ring-2 ring-brand-primary' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {format(day, 'EEE')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {format(day, 'MMM d')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddEntry(day)}
                      className="p-1"
                      data-testid="add-time-entry"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                    
                    {dayEntries.length > 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyDay(dateKey)}
                          className="p-1 text-xs"
                          data-testid="copy-day"
                        >
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePasteDay(dateKey)}
                          className="p-1 text-xs"
                          data-testid="paste-day"
                        >
                          Paste
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Daily totals */}
                {dayTotals.totalMinutes > 0 && (
                  <div className="text-xs text-text-secondary">
                    {Math.round((dayTotals.totalMinutes / 60) * 100) / 100}h
                    {dayTotals.billableMinutes > 0 && (
                      <span className="text-semantic-success ml-1">
                        ({Math.round((dayTotals.billableMinutes / 60) * 100) / 100}h billable)
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : dayEntries.length > 0 ? (
                  dayEntries.map(entry => (
                    <TimeEntryRow
                      key={entry.id}
                      entry={entry}
                      onEdit={onEditEntry}
                      onSubmit={onSubmitEntry}
                      compact
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No time logged</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddEntry(day)}
                      className="mt-2 text-xs"
                    >
                      Add Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Add Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Quick actions: Click + to add entry, use Copy/Paste to duplicate days
          </div>
          
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl+C</kbd>
            <span className="text-xs text-text-secondary">Copy</span>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl+V</kbd>
            <span className="text-xs text-text-secondary">Paste</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

