/**
 * React Query Hooks for E4 SDK Integration
 * Provides type-safe hooks for all API endpoints with proper cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Cache key factory
export const queryKeys = {
  // Authentication
  auth: {
    me: ['auth', 'me'] as const,
    refresh: ['auth', 'refresh'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  
  // Quotes
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.quotes.lists(), filters] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.quotes.details(), id] as const,
  },
  
  // Rate Cards
  rateCards: {
    all: ['rate-cards'] as const,
    lists: () => [...queryKeys.rateCards.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.rateCards.lists(), filters] as const,
    details: () => [...queryKeys.rateCards.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rateCards.details(), id] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Currencies
  currencies: {
    all: ['currencies'] as const,
    lists: () => [...queryKeys.currencies.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.currencies.lists(), filters] as const,
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
    queryFn: () => apiClient.get('/auth/me').then((res: any) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes for user data
  });
};

export const useAuthRefresh = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

// Users Hooks
export const useUsersList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => apiClient.get('/users', { params }).then((res: any) => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes for user lists
  });
};

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiClient.get(`/users/${id}`).then((res: any) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for user details
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: any) => apiClient.post('/users', userData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & any) => 
      apiClient.put(`/users/${id}`, userData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

// Quotes Hooks
export const useQuotesList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.quotes.list(params),
    queryFn: () => apiClient.get('/quotes', { params }).then((res: any) => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute for quote lists
  });
};

export const useQuoteDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: () => apiClient.get(`/quotes/${id}`).then((res: any) => res.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for quote details
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quoteData: any) => apiClient.post('/quotes', quoteData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...quoteData }: { id: string } & any) => 
      apiClient.put(`/quotes/${id}`, quoteData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.details() });
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/quotes/${id}`).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.post(`/quotes/${id}/status`, { status }).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.details() });
    },
  });
};

// Rate Cards Hooks
export const useRateCardsList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.rateCards.list(params),
    queryFn: () => apiClient.get('/rate-cards', { params }).then((res: any) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes for rate cards
  });
};

export const useRateCardDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.rateCards.detail(id),
    queryFn: () => apiClient.get(`/rate-cards/${id}`).then((res: any) => res.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for rate card details
  });
};

export const useCreateRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rateCardData: any) => apiClient.post('/rate-cards', rateCardData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
    },
  });
};

export const useUpdateRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...rateCardData }: { id: string } & any) => 
      apiClient.put(`/rate-cards/${id}`, rateCardData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.details() });
    },
  });
};

export const useDeleteRateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/rate-cards/${id}`).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateCards.lists() });
    },
  });
};

// Payments Hooks
export const usePaymentsList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => apiClient.get('/payments', { params }).then((res: any) => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute for payment lists
  });
};

export const usePaymentDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => apiClient.get(`/payments/${id}`).then((res: any) => res.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for payment details
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData: any) => apiClient.post('/payments', paymentData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...paymentData }: { id: string } & any) => 
      apiClient.put(`/payments/${id}`, paymentData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.details() });
    },
  });
};

// Projects Hooks
export const useProjectsList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => apiClient.get('/projects', { params }).then((res: any) => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes for project lists
  });
};

export const useProjectDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiClient.get(`/projects/${id}`).then((res: any) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for project details
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: any) => apiClient.post('/projects', projectData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...projectData }: { id: string } & any) => 
      apiClient.put(`/projects/${id}`, projectData).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.details() });
    },
  });
};

// Currencies Hooks
export const useCurrenciesList = (params: PaginationParams & Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.currencies.list(params),
    queryFn: () => apiClient.get('/currencies', { params }).then((res: any) => res.data),
    staleTime: 30 * 60 * 1000, // 30 minutes for currencies (rarely change)
  });
};

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get('/health').then((res: any) => res.data),
    staleTime: 30 * 1000, // 30 seconds for health checks
  });
};

// Export all hooks
export * from './client';