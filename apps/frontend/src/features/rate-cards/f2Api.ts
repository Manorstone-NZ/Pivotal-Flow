import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { 
  RateCardResponse, 
  RateCardListResponse, 
  ServiceResponse,
  CreateRateCard,
  UpdateRateCard,
  CreateService,
  UpdateService,
  RateCardListQuery
} from './types';

// Query Keys
export const rateCardQueryKeys = {
  all: (tenantId: string) => ['rate-cards', tenantId] as const,
  lists: (tenantId: string) => [...rateCardQueryKeys.all(tenantId), 'list'] as const,
  list: (tenantId: string, query: RateCardListQuery) => [...rateCardQueryKeys.lists(tenantId), query] as const,
  details: (tenantId: string) => [...rateCardQueryKeys.all(tenantId), 'detail'] as const,
  detail: (tenantId: string, id: string) => [...rateCardQueryKeys.details(tenantId), id] as const,
  services: (tenantId: string, rateCardId: string) => [...rateCardQueryKeys.all(tenantId), 'services', rateCardId] as const,
  service: (tenantId: string, rateCardId: string, serviceId: string) => [...rateCardQueryKeys.services(tenantId, rateCardId), serviceId] as const,
};

// API Functions
export const rateCardApi = {
  // Rate Cards
  getAll: async (query: RateCardListQuery = {}): Promise<RateCardListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    
    const response = await apiClient.get(`/rate-cards?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<RateCardResponse> => {
    const response = await apiClient.get(`/rate-cards/${id}`);
    return response.data;
  },

  create: async (data: CreateRateCard): Promise<RateCardResponse> => {
    const response = await apiClient.post('/rate-cards', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRateCard): Promise<RateCardResponse> => {
    const response = await apiClient.put(`/rate-cards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rate-cards/${id}`);
  },

  // Services
  createService: async (rateCardId: string, data: CreateService): Promise<ServiceResponse> => {
    const response = await apiClient.post(`/rate-cards/${rateCardId}/services`, data);
    return response.data;
  },

  updateService: async (rateCardId: string, serviceId: string, data: UpdateService): Promise<ServiceResponse> => {
    const response = await apiClient.put(`/rate-cards/${rateCardId}/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (rateCardId: string, serviceId: string): Promise<void> => {
    await apiClient.delete(`/rate-cards/${rateCardId}/services/${serviceId}`);
  },

  getService: async (rateCardId: string, serviceId: string): Promise<ServiceResponse> => {
    const response = await apiClient.get(`/rate-cards/${rateCardId}/services/${serviceId}`);
    return response.data;
  },
};

// React Query Hooks
export function useRateCards(tenantId: string, query: RateCardListQuery = {}) {
  return useQuery({
    queryKey: rateCardQueryKeys.list(tenantId, query),
    queryFn: () => rateCardApi.getAll(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRateCard(tenantId: string, id: string) {
  return useQuery({
    queryKey: rateCardQueryKeys.detail(tenantId, id),
    queryFn: () => rateCardApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRateCard(tenantId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rateCardApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
    },
  });
}

export function useUpdateRateCard(tenantId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRateCard }) => 
      rateCardApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.detail(tenantId, id) });
    },
  });
}

export function useDeleteRateCard(tenantId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rateCardApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
    },
  });
}

export function useCreateService(tenantId: string, rateCardId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rateCardApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.detail(tenantId, rateCardId) });
    },
  });
}

export function useUpdateService(tenantId: string, rateCardId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateService }) => 
      rateCardApi.updateService(rateCardId, serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.detail(tenantId, rateCardId) });
    },
  });
}

export function useDeleteService(tenantId: string, rateCardId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serviceId: string) => rateCardApi.deleteService(rateCardId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.all(tenantId) });
      queryClient.invalidateQueries({ queryKey: rateCardQueryKeys.detail(tenantId, rateCardId) });
    },
  });
}
