import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types for approvals
export interface ApprovalRequest {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  decidedAt?: string;
  reason?: string;
  notes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TimeApprovalItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  projectId?: string;
  projectName?: string;
  date: string;
  duration: number;
  description: string;
  activityType: string;
  billable: boolean;
  billableAmount?: number;
  submittedAt: string;
  createdAt: string;
  tags?: string[];
  notes?: string;
}

export interface ApprovalFilters {
  entityType?: string;
  status?: string;
  approverId?: string;
  page?: number;
  limit?: number;
}

export interface ApprovalAction {
  id: string;
  action: 'approve' | 'reject';
  reason?: string;
  comments?: string;
}

export interface BulkApprovalAction {
  ids: string[];
  action: 'approve' | 'reject';
  reason?: string;
  comments?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API base URL
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';

// Create axios instance with auth token
const createApiClient = () => {
  // Get token from auth store (persisted in localStorage)
  const authData = localStorage.getItem('pivotal-flow-auth');
  let token = null;
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed.state?.accessToken;
    } catch (error) {
      console.error('Failed to parse auth data:', error);
    }
  }
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      // F2B: No Authorization header needed - using secure cookies
      // 'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

// Approvals API
export const approvalsApi = {
  // List approval requests
  list: async (filters: ApprovalFilters = {}): Promise<ApiResponse<ApprovalRequest[]>> => {
    const api = createApiClient();
    const { data } = await api.get('/api/v1/approvals', { params: filters });
    return data;
  },

  // Get time approvals (pending time entries)
  getTimeApprovals: async (page = 1, limit = 20): Promise<ApiResponse<TimeApprovalItem[]>> => {
    const api = createApiClient();
    const { data } = await api.get('/api/v1/approvals/time', { params: { page, limit } });
    return data;
  },

  // Approve single item
  approve: async (id: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/approvals/${id}/approve`, { comments });
    return data;
  },

  // Reject single item
  reject: async (id: string, reason: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/approvals/${id}/reject`, { reason, comments });
    return data;
  },

  // Time entry specific approvals
  approveTimeEntry: async (id: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/time-entries/${id}/approve`, { comments });
    return data;
  },

  // Time entry specific rejection
  rejectTimeEntry: async (id: string, reason: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/time-entries/${id}/reject`, { reason, comments });
    return data;
  },

  // Bulk approve time entries
  bulkApproveTimeEntries: async (ids: string[], comments?: string): Promise<ApiResponse<{ approved: number; failed: number }>> => {
    const api = createApiClient();
    const promises = ids.map(id => 
      api.post(`/api/v1/time-entries/${id}/approve`, { comments }).catch(() => null)
    );
    const results = await Promise.all(promises);
    const approved = results.filter(result => result !== null).length;
    const failed = results.length - approved;
    
    return {
      success: true,
      data: { approved, failed }
    };
  },

  // Bulk reject time entries
  bulkRejectTimeEntries: async (ids: string[], reason: string, comments?: string): Promise<ApiResponse<{ rejected: number; failed: number }>> => {
    const api = createApiClient();
    const promises = ids.map(id => 
      api.post(`/api/v1/time-entries/${id}/reject`, { reason, comments }).catch(() => null)
    );
    const results = await Promise.all(promises);
    const rejected = results.filter(result => result !== null).length;
    const failed = results.length - rejected;
    
    return {
      success: true,
      data: { rejected, failed }
    };
  },

  // Get approval statistics
  getStats: async (): Promise<ApiResponse<{
    pending: number;
    approved: number;
    rejected: number;
    totalThisWeek: number;
    avgApprovalTime: number;
  }>> => {
    // This would need to be implemented in the backend
    // For now, return mock data
    return {
      success: true,
      data: {
        pending: 0,
        approved: 0,
        rejected: 0,
        totalThisWeek: 0,
        avgApprovalTime: 0,
      }
    };
  },
};

// React Query hooks
export const useApprovals = (filters: ApprovalFilters = {}) => {
  return useQuery({
    queryKey: ['approvals', filters],
    queryFn: () => approvalsApi.list(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTimeApprovals = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['timeApprovals', page, limit],
    queryFn: () => approvalsApi.getTimeApprovals(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });
};

export const useApproveTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => 
      approvalsApi.approveTimeEntry(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useRejectTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, comments }: { id: string; reason: string; comments?: string }) => 
      approvalsApi.rejectTimeEntry(id, reason, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useBulkApproveTimeEntries = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, comments }: { ids: string[]; comments?: string }) => 
      approvalsApi.bulkApproveTimeEntries(ids, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useBulkRejectTimeEntries = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, reason, comments }: { ids: string[]; reason: string; comments?: string }) => 
      approvalsApi.bulkRejectTimeEntries(ids, reason, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useApprovalStats = () => {
  return useQuery({
    queryKey: ['approvalStats'],
    queryFn: () => approvalsApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Utility functions
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const formatCurrency = (amount: number, currency = 'NZD'): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getActivityTypeColor = (activityType: string): string => {
  const colors: Record<string, string> = {
    development: 'bg-blue-100 text-blue-800',
    meeting: 'bg-green-100 text-green-800',
    admin: 'bg-gray-100 text-gray-800',
    research: 'bg-purple-100 text-purple-800',
    testing: 'bg-yellow-100 text-yellow-800',
    documentation: 'bg-indigo-100 text-indigo-800',
    support: 'bg-red-100 text-red-800',
  };
  
  return colors[activityType] || 'bg-gray-100 text-gray-800';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    invoiced: 'bg-purple-100 text-purple-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

