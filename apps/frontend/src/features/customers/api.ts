/**
 * Customer API Integration
 * React Query hooks for customer and contact management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Customer {
  id: string;
  organizationId: string;
  customerNumber: string;
  companyName: string;
  legalName?: string;
  industry?: string;
  website?: string;
  description?: string;
  status: 'active' | 'inactive' | 'prospect';
  customerType: 'business' | 'individual';
  source?: string;
  tags?: string[];
  rating?: number;
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
  contactExtras?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CustomerContact {
  id: string;
  customerId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  contactExtras?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCustomerData {
  companyName: string;
  legalName?: string;
  industry?: string;
  website?: string;
  description?: string;
  customerType?: 'business' | 'individual';
  source?: string;
  tags?: string[];
  rating?: number;
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
  contactExtras?: any;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  contactExtras?: any;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface CustomerFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'prospect';
  customerType?: 'business' | 'individual';
  industry?: string;
  source?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  data: Customer & { contacts?: CustomerContact[] };
}

export interface ContactListResponse {
  success: boolean;
  data: CustomerContact[];
}

// API Client
const createApiClient = () => {
  const baseURL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';
  
  // Check if user is authenticated (for opaque token system with cookies)
  const isAuthenticated = () => {
    const authData = localStorage.getItem('pivotal-flow-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Handle both Zustand persisted format and direct format
        if (parsed.state && parsed.state.sessionId) {
          return !!parsed.state.sessionId;
        } else if (parsed.sessionId) {
          return !!parsed.sessionId;
        }
      } catch (error) {
        console.error('🔍 Customers API: Failed to parse auth data:', error);
      }
    }
    return false;
  };

  return axios.create({
    baseURL,
    withCredentials: true, // Enable cookies for opaque token authentication
    headers: {
      'Content-Type': 'application/json',
    },
    transformRequest: [(data) => {
      // For opaque token system, authentication is handled via cookies
      // No need to add Authorization header - cookies are sent automatically
      if (isAuthenticated()) {
        console.log('🔍 Customers API: User authenticated, cookies will be sent automatically');
      } else {
        console.log('🔍 Customers API: User not authenticated, request without auth');
      }
      return JSON.stringify(data);
    }],
  });
};

const api = createApiClient();

// API Functions
const customersApi = {
  list: async (filters: CustomerFilters = {}): Promise<CustomerListResponse> => {
    console.log('🏢 CUSTOMER API LIST called with filters:', filters);
    
    // Using centralized API client with tenant context
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    console.log('🏢 Making customer API call to:', `/api/v1/customers?${params}`);
    const response = await api.get(`/api/v1/customers?${params}`);
    console.log('🏢 Customer API response received:', response.status);
    return response.data;
  },

  getById: async (id: string, includeContacts = false): Promise<CustomerDetailResponse> => {
    const params = includeContacts ? '?includeContacts=true' : '';
    const response = await api.get(`/api/v1/customers/${id}${params}`);
    return response.data;
  },

  create: async (data: CreateCustomerData): Promise<{ success: boolean; data: Customer; message: string }> => {
    const response = await api.post('/api/v1/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerData): Promise<{ success: boolean; data: Customer; message: string }> => {
    const response = await api.patch(`/api/v1/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/v1/customers/${id}`);
    return response.data;
  },
};

const contactsApi = {
  list: async (customerId: string): Promise<ContactListResponse> => {
    const response = await api.get(`/api/v1/customers/${customerId}/contacts`);
    return response.data;
  },

  getById: async (customerId: string, contactId: string): Promise<{ success: boolean; data: CustomerContact }> => {
    const response = await api.get(`/api/v1/customers/${customerId}/contacts/${contactId}`);
    return response.data;
  },

  create: async (customerId: string, data: CreateContactData): Promise<{ success: boolean; data: CustomerContact; message: string }> => {
    const response = await api.post(`/api/v1/customers/${customerId}/contacts`, data);
    return response.data;
  },

  update: async (customerId: string, contactId: string, data: UpdateContactData): Promise<{ success: boolean; data: CustomerContact; message: string }> => {
    const response = await api.patch(`/api/v1/customers/${customerId}/contacts/${contactId}`, data);
    return response.data;
  },

  delete: async (customerId: string, contactId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/v1/customers/${customerId}/contacts/${contactId}`);
    return response.data;
  },
};

// React Query Hooks

// Customer hooks
export const useCustomers = (filters: CustomerFilters = {}) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCustomer = (id: string, includeContacts = false) => {
  return useQuery({
    queryKey: ['customers', id, { includeContacts }],
    queryFn: () => customersApi.getById(id, includeContacts),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) => 
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Contact hooks
export const useCustomerContacts = (customerId: string) => {
  return useQuery({
    queryKey: ['customers', customerId, 'contacts'],
    queryFn: () => contactsApi.list(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useContact = (customerId: string, contactId: string) => {
  return useQuery({
    queryKey: ['customers', customerId, 'contacts', contactId],
    queryFn: () => contactsApi.getById(customerId, contactId),
    enabled: !!customerId && !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CreateContactData }) => 
      contactsApi.create(customerId, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, contactId, data }: { customerId: string; contactId: string; data: UpdateContactData }) => 
      contactsApi.update(customerId, contactId, data),
    onSuccess: (_, { customerId, contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'contacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, contactId }: { customerId: string; contactId: string }) => 
      contactsApi.delete(customerId, contactId),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    },
  });
};
