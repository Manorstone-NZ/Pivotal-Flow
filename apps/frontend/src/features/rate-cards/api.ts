/**
 * Rate Cards API Hooks
 * React Query hooks for rate cards and items with Zod validation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '../../lib/api/client';
import type {
  RateCard,
  RateCardItem,
  CreateRateCard,
  UpdateRateCard,
  CreateRateCardItem,
  UpdateRateCardItem,
  RateCardsListResponse,
  RateCardItemsResponse,
  RateCardsFilters,
  RateCardItemsFilters,
} from './types';

// Zod schemas for validation
const RateCardSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  currency: z.string().length(3),
  effectiveFrom: z.string(),
  effectiveUntil: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const RateCardItemSchema = z.object({
  id: z.string(),
  rateCardId: z.string(),
  organizationId: z.string(),
  serviceCategoryId: z.string().optional(),
  roleId: z.string().optional(),
  itemCode: z.string(),
  unit: z.string(),
  baseRate: z.string(),
  currency: z.string().length(3),
  taxClass: z.string(),
  effectiveFrom: z.string(),
  effectiveUntil: z.string().optional(),
  isActive: z.boolean(),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const RateCardsListResponseSchema = z.object({
  data: z.array(RateCardSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }).optional(),
});

const RateCardItemsResponseSchema = z.object({
  data: z.array(RateCardItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }).optional(),
});

// Query keys factory
export const rateCardKeys = {
  all: ['rate-cards'] as const,
  lists: () => [...rateCardKeys.all, 'list'] as const,
  list: (filters: RateCardsFilters) => [...rateCardKeys.lists(), { filters }] as const,
  details: () => [...rateCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...rateCardKeys.details(), id] as const,
  items: (rateCardId: string) => [...rateCardKeys.detail(rateCardId), 'items'] as const,
  itemsList: (rateCardId: string, filters: RateCardItemsFilters) => 
    [...rateCardKeys.items(rateCardId), { filters }] as const,
};

// Rate Cards API hooks
export function useRateCards(filters: RateCardsFilters = {}) {
  return useQuery({
    queryKey: rateCardKeys.list(filters),
    queryFn: async (): Promise<RateCardsListResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.currency) params.set('currency', filters.currency);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await apiClient.get(`/rate-cards?${params.toString()}`);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      
      return RateCardsListResponseSchema.parse(response.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRateCard(id: string) {
  return useQuery({
    queryKey: rateCardKeys.detail(id),
    queryFn: async (): Promise<RateCard> => {
      const response = await apiClient.get(`/rate-cards/${id}`);
      return RateCardSchema.parse(response.data);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRateCardItems(rateCardId: string, filters: RateCardItemsFilters = {}) {
  return useQuery({
    queryKey: rateCardKeys.itemsList(rateCardId, filters),
    queryFn: async (): Promise<RateCardItemsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.unit) params.set('unit', filters.unit);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await apiClient.get(`/rate-cards/${rateCardId}/items?${params.toString()}`);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      
      return RateCardItemsResponseSchema.parse(response.data);
    },
    enabled: !!rateCardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Rate Cards mutations
export function useCreateRateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRateCard): Promise<RateCard> => {
      const response = await apiClient.post('/rate-cards', data);
      return RateCardSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardKeys.lists() });
    },
  });
}

export function useUpdateRateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRateCard }): Promise<RateCard> => {
      const response = await apiClient.put(`/rate-cards/${id}`, data);
      return RateCardSchema.parse(response.data);
    },
    onSuccess: (updatedRateCard) => {
      queryClient.setQueryData(rateCardKeys.detail(updatedRateCard.id), updatedRateCard);
      queryClient.invalidateQueries({ queryKey: rateCardKeys.lists() });
    },
  });
}

export function useDeleteRateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/rate-cards/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: rateCardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rateCardKeys.lists() });
    },
  });
}

// Rate Card Items mutations
export function useCreateRateCardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rateCardId, data }: { rateCardId: string; data: CreateRateCardItem }): Promise<RateCardItem> => {
      const response = await apiClient.post(`/rate-cards/${rateCardId}/items`, data);
      return RateCardItemSchema.parse(response.data);
    },
    onSuccess: (_, { rateCardId }) => {
      queryClient.invalidateQueries({ queryKey: rateCardKeys.items(rateCardId) });
    },
  });
}

export function useUpdateRateCardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRateCardItem }): Promise<RateCardItem> => {
      const response = await apiClient.put(`/rate-card-items/${id}`, data);
      return RateCardItemSchema.parse(response.data);
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: rateCardKeys.items(updatedItem.rateCardId) });
    },
  });
}

export function useDeleteRateCardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/rate-card-items/${id}`);
    },
    onSuccess: () => {
      // We need to invalidate all items queries since we don't know which rate card this item belonged to
      queryClient.invalidateQueries({ queryKey: rateCardKeys.all });
    },
  });
}
