import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';

// Note: Backend uses TypeBox for validation, frontend relies on TypeScript types

// TypeScript interfaces for quotes
export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata: Record<string, unknown>;
}

export interface Quote {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  validUntil?: string;
  metadata: Record<string, unknown>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdBy: string;
  quoteNumber: string;
}

export interface CreateQuote {
  clientId: string;
  title: string;
  description?: string;
  type: 'project' | 'service' | 'product' | 'maintenance';
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
  validUntil?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateQuote {
  clientId?: string;
  title?: string;
  description?: string;
  type?: 'project' | 'service' | 'product' | 'maintenance';
  status?: 'draft' | 'pending' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
  validUntil?: string;
  metadata?: Record<string, unknown>;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceCategoryId?: string;
  roleId?: string;
  rateCardItemId?: string;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface QuotesListResponse {
  data: Quote[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

export interface QuotesFilters {
  search?: string;
  status?: string;
  customerId?: string;
  projectId?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query keys factory
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: QuotesFilters) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
  lineItems: (quoteId: string) => [...quoteKeys.detail(quoteId), 'lineItems'] as const,
};

// Quotes queries
export function useQuotes(filters: QuotesFilters) {
  return useQuery({
    queryKey: quoteKeys.list(filters),
    queryFn: async (): Promise<QuotesListResponse> => {
      const response = await apiClient.get('/quotes', { params: filters });
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        return { data: response.data } as QuotesListResponse;
      }
      
      return response.data as QuotesListResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: async (): Promise<Quote> => {
      const response = await apiClient.get(`/quotes/${id}`);
      return response.data as Quote;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Quote mutations
export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateQuote): Promise<Quote> => {
      const response = await apiClient.post('/quotes', data);
      return response.data as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuote }): Promise<Quote> => {
      const response = await apiClient.put(`/quotes/${id}`, data);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<Quote> => {
      const response = await apiClient.post(`/quotes/${id}/status`, { status });
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Line item mutations
export function useAddLineItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quoteId, data }: { quoteId: string; data: LineItem }): Promise<Quote> => {
      const response = await apiClient.post(`/quotes/${quoteId}/line-items`, data);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useUpdateLineItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      quoteId, 
      lineItemId, 
      data 
    }: { 
      quoteId: string; 
      lineItemId: string; 
      data: Partial<LineItem> 
    }): Promise<Quote> => {
      const response = await apiClient.put(`/quotes/${quoteId}/line-items/${lineItemId}`, data);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useDeleteLineItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quoteId, lineItemId }: { quoteId: string; lineItemId: string }): Promise<Quote> => {
      const response = await apiClient.delete(`/quotes/${quoteId}/line-items/${lineItemId}`);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Discount mutations
export function useSetDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quoteId, discount }: { quoteId: string; discount: Discount }): Promise<Quote> => {
      const response = await apiClient.put(`/quotes/${quoteId}/discount`, discount);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

// Submit quote for approval
export function useSubmitQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quoteId: string): Promise<Quote> => {
      const response = await apiClient.post(`/quotes/${quoteId}/submit`);
      return response.data as Quote;
    },
    onSuccess: () => {
      // F1.5: No optimistic updates for monetary data - always show server truth
      queryClient.invalidateQueries({ queryKey: quoteKeys.all() });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}
