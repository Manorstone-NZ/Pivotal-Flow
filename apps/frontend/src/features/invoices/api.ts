import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface InvoiceStatus {
  draft: 'draft';
  sent: 'sent';
  part_paid: 'part_paid';
  paid: 'paid';
  overdue: 'overdue';
  written_off: 'written_off';
  void: 'void';
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  projectId?: string;
  quoteId?: string;
  
  // Financial data
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  
  // Status and dates
  status: keyof InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  overdueAt?: string;
  writtenOffAt?: string;
  
  // Content
  title: string;
  description?: string;
  termsConditions?: string;
  notes?: string;
  internalNotes?: string;
  metadata?: Record<string, any>;
  
  // Relations (populated when requested)
  customer?: InvoiceCustomer;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
  
  // Audit fields
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // ETag for caching
  etag?: string;
}

export interface CreateInvoiceData {
  customerId: string;
  projectId?: string;
  quoteId?: string;
  title: string;
  description?: string;
  termsConditions?: string;
  notes?: string;
  currency?: string;
  dueDate?: string;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  metadata?: Record<string, any>;
}

export interface UpdateInvoiceData {
  title?: string;
  description?: string;
  termsConditions?: string;
  notes?: string;
  dueDate?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceStatusTransition {
  status: keyof InvoiceStatus;
  reason?: string;
  effectiveDate?: string;
}

export interface MarkInvoicePaidData {
  paymentDate: string;
  amount?: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export interface VoidInvoiceData {
  reason: string;
  effectiveDate?: string;
}

export interface InvoiceListFilters {
  status?: keyof InvoiceStatus;
  customerId?: string;
  projectId?: string;
  currency?: string;
  issuedAfter?: string;
  issuedBefore?: string;
  dueAfter?: string;
  dueBefore?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  etag?: string;
}

// API client
const api = axios.create({
  baseURL: '/api/v1',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ETag-aware request interceptor
api.interceptors.request.use((config) => {
  // Add If-None-Match header for GET requests
  if (config.method === 'get' && config.url?.includes('/invoices/')) {
    const invoiceId = config.url.split('/invoices/')[1];
    if (invoiceId && !invoiceId.includes('?')) {
      // Check if we have cached ETag for this invoice
      const cachedETag = sessionStorage.getItem(`invoice-etag-${invoiceId}`);
      if (cachedETag) {
        config.headers['If-None-Match'] = cachedETag;
      }
    }
  }
  return config;
});

// Handle 304 Not Modified responses
api.interceptors.response.use(
  (response) => {
    // Store ETag for future requests
    if (response.headers.etag && response.config.url?.includes('/invoices/')) {
      const invoiceId = response.config.url.split('/invoices/')[1];
      if (invoiceId && !invoiceId.includes('?')) {
        sessionStorage.setItem(`invoice-etag-${invoiceId}`, response.headers.etag);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 304) {
      // Return cached data for 304 responses
      const invoiceId = error.config.url?.split('/invoices/')[1];
      if (invoiceId) {
        const cachedData = sessionStorage.getItem(`invoice-data-${invoiceId}`);
        if (cachedData) {
          return Promise.resolve({
            data: JSON.parse(cachedData),
            status: 304,
            headers: error.response.headers,
            config: error.config,
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

// Query keys
export const invoiceQueryKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceQueryKeys.all, 'list'] as const,
  list: (filters: InvoiceListFilters) => [...invoiceQueryKeys.lists(), filters] as const,
  details: () => [...invoiceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceQueryKeys.details(), id] as const,
};

// API functions
export const invoiceApi = {
  // List invoices
  list: async (filters: InvoiceListFilters = {}): Promise<InvoiceListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  },

  // Get invoice by ID
  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    
    // Cache the data for 304 responses
    if (response.status === 200) {
      sessionStorage.setItem(`invoice-data-${id}`, JSON.stringify(response.data));
    }
    
    return response.data;
  },

  // Create invoice
  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  // Update invoice
  update: async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}`, data);
    
    // Update cached data
    sessionStorage.setItem(`invoice-data-${id}`, JSON.stringify(response.data));
    
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, data: InvoiceStatusTransition): Promise<Invoice> => {
    const response = await api.post(`/invoices/${id}/status`, data);
    
    // Update cached data
    sessionStorage.setItem(`invoice-data-${id}`, JSON.stringify(response.data));
    
    return response.data;
  },

  // Mark as paid
  markPaid: async (id: string, data: MarkInvoicePaidData): Promise<Invoice> => {
    const response = await api.post(`/invoices/${id}/mark-paid`, data);
    
    // Update cached data
    sessionStorage.setItem(`invoice-data-${id}`, JSON.stringify(response.data));
    
    return response.data;
  },

  // Void invoice
  void: async (id: string, data: VoidInvoiceData): Promise<Invoice> => {
    const response = await api.post(`/invoices/${id}/void`, data);
    
    // Update cached data
    sessionStorage.setItem(`invoice-data-${id}`, JSON.stringify(response.data));
    
    return response.data;
  },
};

// React Query hooks

/**
 * Hook to list invoices with filtering
 */
export const useInvoices = (
  filters: InvoiceListFilters = {},
  options?: Omit<UseQueryOptions<InvoiceListResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: invoiceQueryKeys.list(filters),
    queryFn: () => invoiceApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to get invoice by ID with ETag caching
 */
export const useInvoice = (
  id: string,
  options?: Omit<UseQueryOptions<Invoice>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(id),
    queryFn: () => invoiceApi.getById(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create invoice
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.create,
    onSuccess: () => {
      // Invalidate and refetch invoice lists
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
  });
};

/**
 * Hook to update invoice
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceData }) =>
      invoiceApi.update(id, data),
    onSuccess: (updatedInvoice) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(
        invoiceQueryKeys.detail(updatedInvoice.id),
        updatedInvoice
      );
      
      // Invalidate lists to ensure they reflect the update
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
  });
};

/**
 * Hook to update invoice status
 */
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceStatusTransition }) =>
      invoiceApi.updateStatus(id, data),
    onSuccess: (updatedInvoice) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(
        invoiceQueryKeys.detail(updatedInvoice.id),
        updatedInvoice
      );
      
      // Invalidate lists to ensure they reflect the status change
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
  });
};

/**
 * Hook to mark invoice as paid
 */
export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkInvoicePaidData }) =>
      invoiceApi.markPaid(id, data),
    onSuccess: (updatedInvoice) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(
        invoiceQueryKeys.detail(updatedInvoice.id),
        updatedInvoice
      );
      
      // Invalidate lists to ensure they reflect the payment
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
  });
};

/**
 * Hook to void invoice
 */
export const useVoidInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidInvoiceData }) =>
      invoiceApi.void(id, data),
    onSuccess: (updatedInvoice) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(
        invoiceQueryKeys.detail(updatedInvoice.id),
        updatedInvoice
      );
      
      // Invalidate lists to ensure they reflect the void status
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
  });
};
