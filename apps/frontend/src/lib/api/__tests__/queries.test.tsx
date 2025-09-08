import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { useUsersList, useCreateUser, useQuotesList, useCreateQuote } from '@/lib/api/queries';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('API Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUsersList', () => {
    it('fetches users list successfully', async () => {
      const mockUsers = {
        data: [
          { id: '1', email: 'user1@example.com', name: 'User 1', role: 'admin' },
          { id: '2', email: 'user2@example.com', name: 'User 2', role: 'user' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUsers });

      const { result } = renderHook(() => useUsersList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUsers);
      expect(apiClient.get).toHaveBeenCalledWith('/users', {
        params: {},
      });
    });

    it('handles users list error', async () => {
      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Failed to fetch users'));

      const { result } = renderHook(() => useUsersList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('applies search and pagination parameters', async () => {
      const mockUsers = { data: [], pagination: { page: 2, limit: 5, total: 0, totalPages: 0 } };
      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUsers });

      const { result } = renderHook(() => useUsersList({
        search: 'test',
        page: 2,
        limit: 5,
      }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/users', {
        params: { search: 'test', page: 2, limit: 5 },
      });
    });
  });

  describe('useCreateUser', () => {
    it('creates user successfully', async () => {
      const mockNewUser = {
        id: '3',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      };

      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockNewUser });

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          email: 'newuser@example.com',
          name: 'New User',
          role: 'user',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockNewUser);
      expect(apiClient.post).toHaveBeenCalledWith('/users', {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      });
    });

    it('handles create user error', async () => {
      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Failed to create user'));

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            email: 'invalid@example.com',
            name: 'Invalid User',
            role: 'user',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useQuotesList', () => {
    it('fetches quotes list successfully', async () => {
      const mockQuotes = {
        data: [
          { id: '1', quoteNumber: 'Q-0001', title: 'Quote 1', total: 1000 },
          { id: '2', quoteNumber: 'Q-0002', title: 'Quote 2', total: 2000 },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockQuotes });

      const { result } = renderHook(() => useQuotesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockQuotes);
      expect(apiClient.get).toHaveBeenCalledWith('/quotes', {
        params: {},
      });
    });

    it('applies status filter', async () => {
      const mockQuotes = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockQuotes });

      const { result } = renderHook(() => useQuotesList({
        status: 'pending',
      }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/quotes', {
        params: { status: 'pending' },
      });
    });
  });

  describe('useCreateQuote', () => {
    it('creates quote successfully', async () => {
      const mockNewQuote = {
        id: '3',
        quoteNumber: 'Q-0003',
        title: 'New Quote',
        status: 'draft',
      };

      const { apiClient } = await import('@/lib/api/client');
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockNewQuote });

      const { result } = renderHook(() => useCreateQuote(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          title: 'New Quote',
          customerId: 'customer-1',
          currency: 'USD',
          lineItems: [],
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockNewQuote);
      expect(apiClient.post).toHaveBeenCalledWith('/quotes', {
        title: 'New Quote',
        customerId: 'customer-1',
        currency: 'USD',
        lineItems: [],
      });
    });
  });
});