/**
 * Tenancy API Integration
 * React Query hooks for organization/tenant management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone: string;
  currency: string;
  taxId?: string;
  // Address
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  // Metadata
  contactExtras?: any;
  settings: any;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone?: string;
  currency?: string;
  taxId?: string;
  // Address
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  // Settings
  settings?: any;
  subscriptionPlan?: string;
}

export interface UpdateOrganizationData extends Partial<CreateOrganizationData> {
  subscriptionStatus?: 'active' | 'inactive' | 'trial' | 'expired';
}

export interface InviteUserData {
  email: string;
  roleIds: string[];
  firstName?: string;
  lastName?: string;
}

export interface OrganizationFilters {
  search?: string;
  industry?: string;
  size?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Response types
export interface OrganizationListResponse {
  success: boolean;
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrganizationDetailResponse {
  success: boolean;
  data: Organization;
}

export interface OrganizationSettingsResponse {
  success: boolean;
  data: any;
}

// API Client
const createApiClient = () => {
  const baseURL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';
  
  // Get token from localStorage
  const getAccessToken = () => {
    const authData = localStorage.getItem('pivotal-flow-auth');
    console.log('🔍 Organizations API: Getting access token from localStorage');
    console.log('🔍 Organizations API: Auth data exists:', !!authData);
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        console.log('🔍 Organizations API: Parsed auth data keys:', Object.keys(parsed));
        
        // Handle both Zustand persisted format and direct format
        let accessToken = null;
        if (parsed.state && parsed.state.accessToken) {
          // Zustand persisted format: { state: { accessToken, user, ... }, version: 0 }
          accessToken = parsed.state.accessToken;
          console.log('🔍 Organizations API: Found token in Zustand format');
        } else if (parsed.accessToken) {
          // Direct format: { accessToken, user, isAuthenticated }
          accessToken = parsed.accessToken;
          console.log('🔍 Organizations API: Found token in direct format');
        }
        
        console.log('🔍 Organizations API: Access token exists:', !!accessToken);
        return accessToken;
      } catch (error) {
        console.error('🔍 Organizations API: Failed to parse auth data:', error);
        return null;
      }
    }
    console.log('🔍 Organizations API: No auth data found');
    return null;
  };

  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    transformRequest: [(data, headers) => {
      const token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return JSON.stringify(data);
    }],
  });
};

const api = createApiClient();

// API functions
const organizationApi = {
  // List organizations
  list: async (filters: OrganizationFilters = {}, pagination: PaginationOptions = {}): Promise<OrganizationListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.size) params.append('size', filters.size);
    if (filters.subscriptionPlan) params.append('subscriptionPlan', filters.subscriptionPlan);
    if (filters.subscriptionStatus) params.append('subscriptionStatus', filters.subscriptionStatus);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());

    const response = await api.get(`/api/v1/organizations?${params}`);
    return response.data;
  },

  // Get organization by ID
  getById: async (id: string): Promise<OrganizationDetailResponse> => {
    const response = await api.get(`/api/v1/organizations/${id}`);
    return response.data;
  },

  // Create organization
  create: async (data: CreateOrganizationData): Promise<OrganizationDetailResponse> => {
    const response = await api.post('/api/v1/organizations', data);
    return response.data;
  },

  // Update organization
  update: async (id: string, data: UpdateOrganizationData): Promise<OrganizationDetailResponse> => {
    const response = await api.patch(`/api/v1/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/v1/organizations/${id}`);
    return response.data;
  },

  // Get organization settings
  getSettings: async (id: string): Promise<OrganizationSettingsResponse> => {
    const response = await api.get(`/api/v1/organizations/${id}/settings`);
    return response.data;
  },

  // Update organization settings
  updateSettings: async (id: string, settings: any): Promise<OrganizationSettingsResponse> => {
    const response = await api.post(`/api/v1/organizations/${id}/settings`, { settings });
    return response.data;
  },

  // Invite user to organization
  inviteUser: async (id: string, inviteData: InviteUserData): Promise<{ success: boolean; message: string; data: { inviteId: string; email: string } }> => {
    const response = await api.post(`/api/v1/organizations/${id}/invite-user`, inviteData);
    return response.data;
  },
};

// React Query Hooks

// List organizations
export const useOrganizations = (filters: OrganizationFilters = {}, pagination: PaginationOptions = {}) => {
  return useQuery({
    queryKey: ['organizations', filters, pagination],
    queryFn: () => organizationApi.list(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get organization by ID
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create organization
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Update organization
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationData }) =>
      organizationApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', id] });
    },
  });
};

// Delete organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Get organization settings
export const useOrganizationSettings = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id, 'settings'],
    queryFn: () => organizationApi.getSettings(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Update organization settings
export const useUpdateOrganizationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: any }) =>
      organizationApi.updateSettings(id, settings),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', id] });
    },
  });
};

// Invite user to organization
export const useInviteUser = () => {
  return useMutation({
    mutationFn: ({ id, inviteData }: { id: string; inviteData: InviteUserData }) =>
      organizationApi.inviteUser(id, inviteData),
  });
};

