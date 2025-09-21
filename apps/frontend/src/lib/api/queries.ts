/**
 * React Query Hooks for E4 SDK Integration
 * Provides type-safe hooks for all API endpoints with proper cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useTenantId } from '../../features/tenancy/context';

// Filter types for different entities
type UserFilters = Record<string, string | number | boolean>;
type QuoteFilters = Record<string, string | number | boolean>;
type RateCardFilters = Record<string, string | number | boolean>;
type PaymentFilters = Record<string, string | number | boolean>;
type ProjectFilters = Record<string, string | number | boolean>;
type CurrencyFilters = Record<string, string | number | boolean>;

// Entity types
interface UserData {
  email: string;
  name: string;
  role: string;
  status?: string;
}

interface QuoteData {
  id?: string;
  title: string;
  description?: string;
  status: string;
  validFrom: string;
  validUntil: string;
  lineItems?: LineItem[];
  customerId?: string;
  currency?: string;
  quoteNumber?: string;
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RateCardData {
  name: string;
  description?: string;
  validFrom: string;
  validUntil: string;
  items?: unknown[];
}

interface PaymentData {
  amount: number;
  currency: string;
  status: string;
  method: string;
  reference?: string;
}

interface ProjectData {
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

// API Response types
interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

// F1.5: Cache key factory with tenant isolation
export const queryKeys = {
  // Authentication (global, no tenant isolation needed)
  auth: {
    me: ['auth', 'me'] as const,
    refresh: ['auth', 'refresh'] as const,
  },
  
  // Users (tenant-scoped)
  users: {
    all: (tenantId: string | null) => ['users', tenantId] as const,
    lists: (tenantId: string | null) => [...queryKeys.users.all(tenantId), 'list'] as const,
    list: (tenantId: string | null, filters: UserFilters) => [...queryKeys.users.lists(tenantId), filters] as const,
    details: (tenantId: string | null) => [...queryKeys.users.all(tenantId), 'detail'] as const,
    detail: (tenantId: string | null, id: string) => [...queryKeys.users.details(tenantId), id] as const,
  },
  
  // Quotes (tenant-scoped - critical for monetary data)
  quotes: {
    all: (tenantId: string | null) => ['quotes', tenantId] as const,
    lists: (tenantId: string | null) => [...queryKeys.quotes.all(tenantId), 'list'] as const,
    list: (tenantId: string | null, filters: QuoteFilters) => [...queryKeys.quotes.lists(tenantId), filters] as const,
    details: (tenantId: string | null) => [...queryKeys.quotes.all(tenantId), 'detail'] as const,
    detail: (tenantId: string | null, id: string) => [...queryKeys.quotes.details(tenantId), id] as const,
  },
  
  // Rate Cards (tenant-scoped - critical for pricing data)
  rateCards: {
    all: (tenantId: string | null) => ['rate-cards', tenantId] as const,
    lists: (tenantId: string | null) => [...queryKeys.rateCards.all(tenantId), 'list'] as const,
    list: (tenantId: string | null, filters: RateCardFilters) => [...queryKeys.rateCards.lists(tenantId), filters] as const,
    details: (tenantId: string | null) => [...queryKeys.rateCards.all(tenantId), 'detail'] as const,
    detail: (tenantId: string | null, id: string) => [...queryKeys.rateCards.details(tenantId), id] as const,
  },
  
  // Payments (tenant-scoped - critical for financial data)
  payments: {
    all: (tenantId: string | null) => ['payments', tenantId] as const,
    lists: (tenantId: string | null) => [...queryKeys.payments.all(tenantId), 'list'] as const,
    list: (tenantId: string | null, filters: PaymentFilters) => [...queryKeys.payments.lists(tenantId), filters] as const,
    details: (tenantId: string | null) => [...queryKeys.payments.all(tenantId), 'detail'] as const,
    detail: (tenantId: string | null, id: string) => [...queryKeys.payments.details(tenantId), id] as const,
  },
  
  // Projects (tenant-scoped)
  projects: {
    all: (tenantId: string | null) => ['projects', tenantId] as const,
    lists: (tenantId: string | null) => [...queryKeys.projects.all(tenantId), 'list'] as const,
    list: (tenantId: string | null, filters: ProjectFilters) => [...queryKeys.projects.lists(tenantId), filters] as const,
    details: (tenantId: string | null) => [...queryKeys.projects.all(tenantId), 'detail'] as const,
    detail: (tenantId: string | null, id: string) => [...queryKeys.projects.details(tenantId), id] as const,
  },
  
  // Currencies (global - same across tenants)
  currencies: {
    all: ['currencies'] as const,
    lists: () => [...queryKeys.currencies.all, 'list'] as const,
    list: (filters: CurrencyFilters) => [...queryKeys.currencies.lists(), filters] as const,
  },
} as const;

// Pagination helpers
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Hooks
export const useAuthMe = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.get('/auth/me').then((res: ApiResponse) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes for user data
  });
};

export const useAuthRefresh = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }).then((res: ApiResponse) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

// F1.5: Users Hooks with tenant isolation
export const useUsersList = (params: PaginationParams & UserFilters = {}) => {
  const tenantId = useTenantId();
  
  return useQuery({
    queryKey: queryKeys.users.list(tenantId, params),
    queryFn: () => apiClient.get('/users', { params }).then((res: ApiResponse) => res.data),
    enabled: !!tenantId, // Only fetch when tenant is available
    staleTime: 2 * 60 * 1000, // 2 minutes for user lists
  });
};

export const useUserDetail = (id: string) => {
  const tenantId = useTenantId();
  
  return useQuery({
    queryKey: queryKeys.users.detail(tenantId, id),
    queryFn: () => apiClient.get(`/users/${id}`).then((res: ApiResponse) => res.data),
    enabled: !!id && !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes for user details
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: (userData: UserData) => apiClient.post('/users', userData).then((res: ApiResponse) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(tenantId) });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & Partial<UserData>) => 
      apiClient.put(`/users/${id}`, userData).then((res: ApiResponse) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(tenantId) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`).then((res: ApiResponse) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(tenantId) });
    },
  });
};

// Quotes Hooks
export const useQuotesList = (params: PaginationParams & QuoteFilters = {}) => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: queryKeys.quotes.list(tenantId, params),
    queryFn: () => apiClient.get('/quotes', { params }).then((res: ApiResponse) => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute for quote lists
  });
};

export const useQuoteDetail = (id: string) => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: queryKeys.quotes.detail(tenantId, id),
    queryFn: () => apiClient.get(`/quotes/${id}`).then((res: ApiResponse<QuoteData>) => res.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for quote details
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: (quoteData: QuoteData) => apiClient.post('/quotes', quoteData).then((res: ApiResponse<QuoteData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists(tenantId) });
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: ({ id, ...quoteData }: { id: string } & Partial<QuoteData>) => 
      apiClient.put(`/quotes/${id}`, quoteData).then((res: ApiResponse<QuoteData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.details(tenantId) });
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/quotes/${id}`).then((res: ApiResponse<{ success: boolean }>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists(tenantId) });
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.post(`/quotes/${id}/status`, { status }).then((res: ApiResponse<{ status: string }>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.details() });
    },
  });
};

// Rate Cards Hooks
export const useRateCardsList = (params: PaginationParams & RateCardFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.rateCards.list(params),
    queryFn: () => apiClient.get('/rate-cards', { params }).then((res: ApiResponse<RateCardData[]>) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes for rate cards
  });
};

export const useRateCardDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.rateCards.detail(id),
    queryFn: () => apiClient.get(`/rate-cards/${id}`).then((res: ApiResponse<RateCardData>) => res.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for rate card details
  });
};

export const useCreateRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rateCardData: RateCardData) => apiClient.post('/rate-cards', rateCardData).then((res: ApiResponse<RateCardData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
    },
  });
};

export const useUpdateRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...rateCardData }: { id: string } & Partial<RateCardData>) => 
      apiClient.put(`/rate-cards/${id}`, rateCardData).then((res: ApiResponse<RateCardData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.details() });
    },
  });
};

export const useDeleteRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/rate-cards/${id}`).then((res: ApiResponse<{ success: boolean }>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
    },
  });
};

// Payments Hooks
export const usePaymentsList = (params: PaginationParams & PaymentFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => apiClient.get('/payments', { params }).then((res: ApiResponse<PaymentData[]>) => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute for payment lists
  });
};

export const usePaymentDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => apiClient.get(`/payments/${id}`).then((res: ApiResponse<PaymentData>) => res.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for payment details
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData: PaymentData) => apiClient.post('/payments', paymentData).then((res: ApiResponse<PaymentData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...paymentData }: { id: string } & Partial<PaymentData>) => 
      apiClient.put(`/payments/${id}`, paymentData).then((res: ApiResponse<PaymentData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.details() });
    },
  });
};

// Projects Hooks
export const useProjectsList = (params: PaginationParams & ProjectFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => apiClient.get('/projects', { params }).then((res: ApiResponse<ProjectData[]>) => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes for project lists
  });
};

export const useProjectDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiClient.get(`/projects/${id}`).then((res: ApiResponse<ProjectData>) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for project details
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: ProjectData) => apiClient.post('/projects', projectData).then((res: ApiResponse<ProjectData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...projectData }: { id: string } & Partial<ProjectData>) => 
      apiClient.put(`/projects/${id}`, projectData).then((res: ApiResponse<ProjectData>) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.details() });
    },
  });
};

// Currencies Hooks
export const useCurrenciesList = (params: PaginationParams & CurrencyFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.currencies.list(params),
    queryFn: () => apiClient.get('/currencies', { params }).then((res: ApiResponse<CurrencyData[]>) => res.data),
    staleTime: 30 * 60 * 1000, // 30 minutes for currencies (rarely change)
  });
};

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get('/health').then((res: ApiResponse<{ status: string; timestamp: string }>) => res.data),
    staleTime: 30 * 1000, // 30 seconds for health checks
  });
};

// Export all hooks
export * from './client';