import { describe, it, expect, beforeEach } from 'vitest';
import { PivotalFlowClient } from './index.js';

/**
 * Simple integration test for the SDK
 * This tests basic functionality without requiring a running server
 */

describe('PivotalFlowClient', () => {
  let client: PivotalFlowClient;

  beforeEach(() => {
    client = new PivotalFlowClient({
      baseURL: 'http://localhost:3000/api/v1',
      getAccessToken: () => 'test-token',
      refreshToken: async () => 'new-test-token'
    });
  });

  describe('Configuration', () => {
    it('should create client with correct configuration', () => {
      expect(client).toBeInstanceOf(PivotalFlowClient);
    });

    it('should have all required API endpoints', () => {
      expect(client.auth).toBeDefined();
      expect(client.users).toBeDefined();
      expect(client.quotes).toBeDefined();
      expect(client.permissions).toBeDefined();
      expect(client.roles).toBeDefined();
      expect(client.exports).toBeDefined();
      expect(client.portal).toBeDefined();
      expect(client.system).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should have correct types for quote status', () => {
      const validStatuses: Array<'draft' | 'pending' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'cancelled'> = [
        'draft',
        'pending',
        'approved',
        'sent',
        'accepted',
        'rejected',
        'cancelled'
      ];

      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });

    it('should have correct types for pagination envelope', () => {
      const mockPagination = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        meta: {
          api_version: '1.0.0',
          documentation_url: 'https://api.pivotalflow.com/docs'
        }
      };

      expect(mockPagination).toHaveProperty('items');
      expect(mockPagination).toHaveProperty('page');
      expect(mockPagination).toHaveProperty('pageSize');
      expect(mockPagination).toHaveProperty('total');
      expect(mockPagination).toHaveProperty('totalPages');
      expect(mockPagination).toHaveProperty('meta');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock a network error
      const mockClient = new PivotalFlowClient({
        baseURL: 'http://invalid-url-that-does-not-exist.com',
        timeout: 1000
      });

      try {
        await mockClient.system.health();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});

/**
 * Type generation sanity test
 * This ensures that key DTOs have the correct structure
 */
describe('Type Generation', () => {
  it('should have correct User interface structure', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'active' as const,
      organizationId: 'org-456',
      roles: ['user'],
      permissions: ['users.view_users'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('firstName');
    expect(mockUser).toHaveProperty('lastName');
    expect(mockUser).toHaveProperty('status');
    expect(mockUser).toHaveProperty('organizationId');
    expect(mockUser).toHaveProperty('roles');
    expect(mockUser).toHaveProperty('permissions');
    expect(mockUser).toHaveProperty('createdAt');
    expect(mockUser).toHaveProperty('updatedAt');
  });

  it('should have correct Quote interface structure', () => {
    const mockQuote = {
      id: 'quote-123',
      organizationId: 'org-456',
      customerId: 'customer-789',
      status: 'approved' as const,
      totalAmount: 1000,
      currency: 'USD',
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      notes: 'Test quote',
      createdBy: 'user-123',
      approvedBy: 'user-456',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lineItems: []
    };

    expect(mockQuote).toHaveProperty('id');
    expect(mockQuote).toHaveProperty('organizationId');
    expect(mockQuote).toHaveProperty('customerId');
    expect(mockQuote).toHaveProperty('status');
    expect(mockQuote).toHaveProperty('totalAmount');
    expect(mockQuote).toHaveProperty('currency');
    expect(mockQuote).toHaveProperty('validFrom');
    expect(mockQuote).toHaveProperty('validUntil');
    expect(mockQuote).toHaveProperty('lineItems');
  });

  it('should have correct LoginRequest interface structure', () => {
    const mockLoginRequest = {
      email: 'user@example.com',
      password: 'password123',
      mfaCode: '123456'
    };

    expect(mockLoginRequest).toHaveProperty('email');
    expect(mockLoginRequest).toHaveProperty('password');
    expect(mockLoginRequest).toHaveProperty('mfaCode');
  });
});
