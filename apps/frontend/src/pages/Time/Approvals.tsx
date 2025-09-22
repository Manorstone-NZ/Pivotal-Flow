import React, { useState } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import { ApprovalQueue } from '../../components/approvals/ApprovalQueue';
import { useApprovalStats, useTimeApprovals, useBulkApproveTimeEntries } from '../../features/approvals/api';
import { useTimeEntries, useSubmitTimeEntry } from '../../features/time/api';

export const TimeApprovalsPage: React.FC = () => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportOptions, setExportOptions] = useState({
    includeApproved: true,
    includePending: true,
    includeRejected: true,
    includeDrafts: false,
    dateFilter: false
  });
  
  const { data: statsResponse } = useApprovalStats();
  const { data: approvalsResponse } = useTimeApprovals(1, 20);
  const { data: timeEntriesResponse } = useTimeEntries({ status: 'draft', limit: 100 });
  const bulkApprove = useBulkApproveTimeEntries();
  const submitTimeEntry = useSubmitTimeEntry();
  
  const stats = statsResponse?.data || {
    pending: 0,
    approved: 0,
    rejected: 0,
    totalThisWeek: 0,
    avgApprovalTime: 0
  };

  const pendingApprovals = approvalsResponse?.data || [];
  const draftEntries = timeEntriesResponse?.data || [];

  // Quick action handlers
  const handleBulkApproveAll = async () => {
    if (pendingApprovals.length === 0) {
      alert('No pending approvals to approve');
      return;
    }

    const confirmed = confirm(`Are you sure you want to approve all ${pendingApprovals.length} pending time entries?`);
    if (!confirmed) return;

    try {
      const allIds = pendingApprovals.map(item => item.id);
      await bulkApprove.mutateAsync({ 
        ids: allIds, 
        comments: 'Bulk approved via quick action' 
      });
      alert(`Successfully approved ${pendingApprovals.length} time entries`);
    } catch (error) {
      console.error('Bulk approve failed:', error);
      alert('Failed to approve entries. Please try again.');
    }
  };

  const handleShowDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const handleSubmitAllDrafts = async () => {
    if (draftEntries.length === 0) {
      alert('No draft entries to submit');
      return;
    }

    const confirmed = confirm(`Submit all ${draftEntries.length} draft time entries for approval?`);
    if (!confirmed) return;

    try {
      // Submit each draft entry
      for (const entry of draftEntries) {
        await submitTimeEntry.mutateAsync(entry.id);
      }
      alert(`Successfully submitted ${draftEntries.length} time entries for approval`);
    } catch (error) {
      console.error('Failed to submit entries:', error);
      alert('Failed to submit some entries. Please try again.');
    }
  };

  const handleExportReport = async () => {
    if (showExportOptions) {
      // Actually perform the export
      setIsExporting(true);
      try {
        // Fetch all entries using pagination (backend limits to max 100 per page)
        let allEntries: any[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          // Build query parameters based on export options
          const params = new URLSearchParams();
          params.append('limit', '100'); // Backend maximum
          params.append('page', page.toString());
          
          if (exportOptions.dateFilter && dateRange.start && dateRange.end) {
            params.append('startDate', dateRange.start);
            params.append('endDate', dateRange.end);
          }
          
          // Get time entries for this page
          const response = await fetch(`${import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000'}/api/v1/time-entries?${params}`, {
            headers: {
              // F2B: No Authorization header needed - using secure cookies
              // 'Authorization': `Bearer ${getAuthToken()}`
            },
            credentials: 'include' // F2B: Essential for cookie-based auth
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch time entries (page ${page})`);
          }
          
          const pageData = await response.json();
          const entries = pageData.data || [];
          
          allEntries = [...allEntries, ...entries];
          
          // Check if we have more pages
          hasMore = entries.length === 100; // If we got full page, there might be more
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 50) {
            console.warn('Export stopped at page 50 to prevent infinite loop');
            break;
          }
        }
        
        // Filter entries based on export options
        const filteredEntries = allEntries.filter((entry: any) => {
          if (entry.status === 'approved' && !exportOptions.includeApproved) return false;
          if (entry.status === 'submitted' && !exportOptions.includePending) return false;
          if (entry.status === 'rejected' && !exportOptions.includeRejected) return false;
          if (entry.status === 'draft' && !exportOptions.includeDrafts) return false;
          return true;
        });
        
        // Generate CSV content
        const csvContent = generateApprovalReportCSV(filteredEntries);
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `time-approvals-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`Approval report downloaded successfully! (${filteredEntries.length} entries)`);
        setShowExportOptions(false);
      } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export report. Please try again.');
      } finally {
        setIsExporting(false);
      }
    } else {
      // Show export options
      setShowExportOptions(true);
    }
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    const authData = localStorage.getItem('pivotal-flow-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken;
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }
    return null;
  };

  // Generate CSV content for approval report
  const generateApprovalReportCSV = (entries: any[]) => {
    const headers = [
      'Entry ID',
      'Date', 
      'User ID',
      'Description',
      'Duration (hours)',
      'Activity Type',
      'Billable',
      'Billable Amount',
      'Status',
      'Created At',
      'Submitted At',
      'Approved At',
      'Approved By',
      'Rejected At',
      'Rejected By',
      'Rejection Reason'
    ];

    const csvRows = [headers.join(',')];
    
    entries.forEach(entry => {
      const row = [
        entry.id || '',
        entry.date || '',
        entry.userId || '',
        `"${(entry.description || '').replace(/"/g, '""')}"`, // Escape quotes
        entry.duration ? (entry.duration / 60).toFixed(2) : '0',
        entry.activityType || '',
        entry.billable ? 'Yes' : 'No',
        entry.billableAmount || '0',
        entry.status || '',
        entry.createdAt || '',
        entry.submittedAt || '',
        entry.approvedAt || '',
        entry.approvedBy || '',
        entry.rejectedAt || '',
        entry.rejectedBy || '',
        `"${(entry.rejectionReason || '').replace(/"/g, '""')}"` // Escape quotes
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Time Approvals
          </h1>
          <p className="text-text-secondary mt-2">
            Review and approve time entries from your team
          </p>
          {draftEntries.length > 0 && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                💡 <strong>{draftEntries.length} draft entries</strong> need to be submitted before they appear in the approval queue.
                Use the "Submit All Drafts" quick action below.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSubmitAllDrafts}
            disabled={draftEntries.length === 0 || submitTimeEntry.isPending}
            className="flex items-center space-x-2"
          >
            <ClockIcon className="h-4 w-4" />
            <span>Submit {draftEntries.length} Drafts</span>
          </Button>
          
          <Button
            onClick={handleBulkApproveAll}
            disabled={pendingApprovals.length === 0 || bulkApprove.isPending}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Approve All ({pendingApprovals.length})</span>
          </Button>
        </div>
      </div>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Pending</p>
                <p className="text-2xl font-semibold text-text-primary">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Approved Today</p>
                <p className="text-2xl font-semibold text-text-primary">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-surface-border hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Rejected</p>
                <p className="text-2xl font-semibold text-text-primary">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-2xl font-semibold text-text-primary">{stats.totalThisWeek}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-text-primary mb-3">✅ When to Approve</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Time allocation is reasonable for the task</li>
                <li>• Work was authorized and within scope</li>
                <li>• Description provides sufficient detail</li>
                <li>• Billability is correctly categorized</li>
                <li>• Dates and times are accurate</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-3">❌ When to Reject</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Insufficient description or detail</li>
                <li>• Time seems excessive for the work</li>
                <li>• Work was not pre-approved</li>
                <li>• Incorrect project or billability</li>
                <li>• Duplicate or overlapping entries</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Best Practices</h4>
                <p className="text-sm text-blue-800 mt-1">
                  When rejecting entries, provide clear, actionable feedback. Consider reaching out 
                  to team members directly for complex issues. Aim to process approvals within 24-48 hours 
                  to maintain team productivity.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Queue */}
      <ApprovalQueue />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-text-secondary">
            Quick tools for managing approvals efficiently
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={handleBulkApproveAll}
              disabled={pendingApprovals.length === 0 || bulkApprove.isPending}
              className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-text-primary mb-1">Approve All</h3>
              <p className="text-sm text-text-secondary">
                {pendingApprovals.length > 0 
                  ? `Approve all ${pendingApprovals.length} pending entries`
                  : 'No pending entries to approve'
                }
              </p>
              {bulkApprove.isPending && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mx-auto" />
                </div>
              )}
            </button>
            
            <button 
              onClick={handleShowDateFilter}
              className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <FunnelIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-text-primary mb-1">Filter by Date</h3>
              <p className="text-sm text-text-secondary">
                {showDateFilter ? 'Hide date filter' : 'Show date filter options'}
              </p>
            </button>
            
            <button 
              onClick={handleSubmitAllDrafts}
              disabled={draftEntries.length === 0 || submitTimeEntry.isPending}
              className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClockIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-text-primary mb-1">Submit All Drafts</h3>
              <p className="text-sm text-text-secondary">
                {draftEntries.length > 0 
                  ? `Submit ${draftEntries.length} draft entries for approval`
                  : 'No draft entries to submit'
                }
              </p>
              {submitTimeEntry.isPending && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent mx-auto" />
                </div>
              )}
            </button>

            <button 
              onClick={handleExportReport}
              disabled={isExporting}
              className={`text-center p-4 border border-dashed border-gray-300 rounded-lg transition-colors ${
                isExporting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-yellow-50 hover:border-yellow-300'
              }`}
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-600 border-t-transparent mx-auto mb-2" />
              ) : (
                <DocumentArrowDownIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              )}
              <h3 className="font-medium text-text-primary mb-1">
                {isExporting 
                  ? 'Exporting...' 
                  : showExportOptions 
                    ? 'Configure Export' 
                    : 'Export CSV Report'
                }
              </h3>
              <p className="text-sm text-text-secondary">
                {isExporting 
                  ? 'Fetching data and generating CSV file...'
                  : showExportOptions 
                    ? 'Click "Download CSV" below to export with your selected options'
                    : 'Download time entries and approval data as CSV file'
                }
              </p>
            </button>
          </div>

          {/* Date Filter (conditionally shown) */}
          {showDateFilter && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-text-primary mb-3">Filter by Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Apply filter logic here
                      alert(`Filtering from ${dateRange.start} to ${dateRange.end}`);
                    }}
                    disabled={!dateRange.start || !dateRange.end}
                  >
                    Apply Filter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange({ start: '', end: '' })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Export Options (conditionally shown) */}
          {showExportOptions && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-text-primary mb-3">Export Options</h4>
              
              <div className="space-y-4">
                {/* Status Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Entry Types:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeApproved}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeApproved: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm">Approved Entries</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePending}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includePending: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm">Pending Approvals</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeRejected}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeRejected: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm">Rejected Entries</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeDrafts}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeDrafts: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm">Draft Entries</span>
                    </label>
                  </div>
                </div>

                {/* Date Filter Option */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.dateFilter}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateFilter: e.target.checked }))}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Use date range filter</span>
                  </label>
                  {exportOptions.dateFilter && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="Start date"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="End date"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExportOptions(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportReport}
                    disabled={isExporting || (!exportOptions.includeApproved && !exportOptions.includePending && !exportOptions.includeRejected && !exportOptions.includeDrafts)}
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-1" />
                    ) : (
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {isExporting ? 'Exporting...' : 'Download CSV'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Approve selected</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">A</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Reject selected</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">R</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Select all</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Ctrl</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Shift</kbd>
                <span className="text-text-secondary">+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">A</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Refresh queue</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">F5</kbd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

