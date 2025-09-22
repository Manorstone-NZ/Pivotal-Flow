/**
 * Quote Delivery API - SaaS Multi-Tenant
 * Frontend API integration for quote delivery system
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types for SaaS delivery system
export interface DeliveryOptions {
  recipientEmail?: string;
  customMessage?: string;
  expirationDays?: number;
}

export interface DeliveryResult {
  success: boolean;
  publicUrl: string;
  token: string;
  deliveredAt: string;
  expiresAt: string;
  message?: string;
}

export interface PublicQuoteData {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  status: string;
  validFrom: string;
  validUntil: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  termsConditions?: string;
  notes?: string;
  organization: {
    name: string;
    industry?: string;
    timezone: string;
    currency: string;
  };
  customer: {
    companyName: string;
    email?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface ApprovalData {
  name: string;
  role: string;
  checkedTerms: boolean;
}

export interface RejectionData {
  reason: string;
}

// API client with tenant context (same pattern as customers/organizations)
const createApiClient = () => {
  const baseURL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';
  
  const getAccessToken = () => {
    const authData = localStorage.getItem('pivotal-flow-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Handle both Zustand and direct formats
        return parsed.state?.accessToken || parsed.accessToken;
      } catch {
        return null;
      }
    }
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
        // F2B: No Authorization header needed - using secure cookies
        // headers['Authorization'] = `Bearer ${token}`;
      }
      return JSON.stringify(data);
    }],
  });
};

const api = createApiClient();

// Delivery API functions
export const deliveryApi = {
  // Deliver quote to customer
  deliverQuote: async (quoteId: string, options: DeliveryOptions): Promise<DeliveryResult> => {
    const response = await api.post(`/api/v1/quotes/${quoteId}/deliver`, options);
    return response.data;
  },

  // Get public quote (no auth required)
  getPublicQuote: async (token: string): Promise<{ success: boolean; data: PublicQuoteData }> => {
    const response = await axios.get(`/public/quotes/${token}`);
    return response.data;
  },

  // Accept quote (no auth required)
  acceptQuote: async (token: string, data: ApprovalData): Promise<{ success: boolean; message: string; timestamp: string }> => {
    const response = await axios.post(`/public/quotes/${token}/accept`, data);
    return response.data;
  },

  // Reject quote (no auth required)
  rejectQuote: async (token: string, data: RejectionData): Promise<{ success: boolean; message: string; timestamp: string }> => {
    const response = await axios.post(`/public/quotes/${token}/reject`, data);
    return response.data;
  }
};

// React Query hooks for SaaS delivery system
export const useDeliverQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, options }: { quoteId: string; options: DeliveryOptions }) =>
      deliveryApi.deliverQuote(quoteId, options),
    onSuccess: () => {
      // Invalidate quotes to refresh status
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};

export const usePublicQuote = (token: string) => {
  return {
    getQuote: () => deliveryApi.getPublicQuote(token),
    acceptQuote: (data: ApprovalData) => deliveryApi.acceptQuote(token, data),
    rejectQuote: (data: RejectionData) => deliveryApi.rejectQuote(token, data)
  };
};
