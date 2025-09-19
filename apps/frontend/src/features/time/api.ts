import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types for time entries
export interface TimeEntry {
  id: string;
  organizationId: string;
  userId: string;
  projectId?: string;
  date: string;
  startTime?: string | undefined;
  endTime?: string | undefined;
  duration: number;
  breakMinutes: number;
  description: string;
  activityType: string;
  billable: boolean;
  hourlyRate?: number | undefined;
  billableAmount?: number | undefined;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced';
  submittedAt?: string | undefined;
  approvedAt?: string | undefined;
  approvedBy?: string | undefined;
  rejectedAt?: string | undefined;
  rejectedBy?: string | undefined;
  rejectionReason?: string | undefined;
  tags?: string[] | undefined;
  notes?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryData {
  projectId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  breakMinutes?: number;
  description: string;
  activityType?: string;
  billable?: boolean;
  hourlyRate?: number;
  tags?: string[];
  notes?: string;
}

export interface TimeEntryFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  status?: string;
  billable?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface PendingApproval {
  id: string;
  userId: string;
  userName?: string;
  projectId?: string;
  date: string;
  duration: number;
  description: string;
  activityType: string;
  billable: boolean;
  billableAmount?: number;
  submittedAt: string;
  createdAt: string;
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
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

// Time Entries API
export const timeEntriesApi = {
  // List time entries
  list: async (filters: TimeEntryFilters = {}): Promise<ApiResponse<TimeEntry[]>> => {
    const api = createApiClient();
    const { data } = await api.get('/api/v1/time-entries', { params: filters });
    return data;
  },

  // Create time entry
  create: async (entryData: CreateTimeEntryData): Promise<ApiResponse<TimeEntry>> => {
    const api = createApiClient();
    const { data } = await api.post('/api/v1/time-entries', entryData);
    return data;
  },

  // Update time entry
  update: async (id: string, entryData: Partial<CreateTimeEntryData>): Promise<ApiResponse<TimeEntry>> => {
    const api = createApiClient();
    const { data } = await api.put(`/api/v1/time-entries/${id}`, entryData);
    return data;
  },

  // Delete time entry
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const api = createApiClient();
    const { data } = await api.delete(`/api/v1/time-entries/${id}`);
    return data;
  },

  // Submit time entry for approval
  submit: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/time-entries/${id}/submit`);
    return data;
  },

  // Approve time entry
  approve: async (id: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/time-entries/${id}/approve`, { comments });
    return data;
  },

  // Reject time entry
  reject: async (id: string, reason: string, comments?: string): Promise<ApiResponse<{ message: string }>> => {
    const api = createApiClient();
    const { data } = await api.post(`/api/v1/time-entries/${id}/reject`, { reason, comments });
    return data;
  },

  // Get pending approvals
  getPendingApprovals: async (page = 1, limit = 20): Promise<ApiResponse<PendingApproval[]>> => {
    const api = createApiClient();
    const { data } = await api.get('/api/v1/approvals/time', { params: { page, limit } });
    return data;
  },
};

// React Query hooks
export const useTimeEntries = (filters: TimeEntryFilters = {}) => {
  return useQuery({
    queryKey: ['timeEntries', filters],
    queryFn: () => timeEntriesApi.list(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: timeEntriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimeEntryData> }) => 
      timeEntriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: timeEntriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};

export const useSubmitTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: timeEntriesApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
};

export const useApproveTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => 
      timeEntriesApi.approve(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
};

export const useRejectTimeEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, comments }: { id: string; reason: string; comments?: string }) => 
      timeEntriesApi.reject(id, reason, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
};

export const usePendingApprovals = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['pendingApprovals', page, limit],
    queryFn: () => timeEntriesApi.getPendingApprovals(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Utility hooks for time calculations
export const useWeeklyTimeEntries = (startDate: string, endDate: string, userId?: string) => {
  return useTimeEntries({
    startDate,
    endDate,
    ...(userId && { userId }),
    limit: 100, // Get all entries for the week
  });
};

export const useTimeEntryTotals = (timeEntries: TimeEntry[]) => {
  const totals = timeEntries.reduce(
    (acc, entry) => {
      acc.totalMinutes += entry.duration;
      acc.billableMinutes += entry.billable ? entry.duration : 0;
      acc.nonBillableMinutes += entry.billable ? 0 : entry.duration;
      if (entry.billableAmount) {
        acc.totalAmount += parseFloat(entry.billableAmount.toString());
      }
      return acc;
    },
    {
      totalMinutes: 0,
      billableMinutes: 0,
      nonBillableMinutes: 0,
      totalAmount: 0,
    }
  );

  return {
    ...totals,
    totalHours: Math.round((totals.totalMinutes / 60) * 100) / 100,
    billableHours: Math.round((totals.billableMinutes / 60) * 100) / 100,
    nonBillableHours: Math.round((totals.nonBillableMinutes / 60) * 100) / 100,
  };
};

