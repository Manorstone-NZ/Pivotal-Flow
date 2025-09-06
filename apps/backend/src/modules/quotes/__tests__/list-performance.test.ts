import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { QuoteService } from '../service.js';

describe('Quote List Performance with Filters', () => {
  let quoteService: QuoteService;
  let testUserId: string;

  beforeAll(async () => {
    // Mock database setup for now
    const mockDb = {} as any;
    const organizationId = 'test-org-123';
    const userId = 'test-user-456';
    quoteService = new QuoteService(mockDb, { organizationId, userId });
    testUserId = userId;
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('List quotes with typed column filters', () => {
    it('should list quotes filtered by status', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { status: 'draft' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(25);
    });

    it('should list quotes filtered by customer ID', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { customerId: 'test-customer-123' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes filtered by project ID', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { projectId: 'test-project-456' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes filtered by type', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { type: 'project' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes filtered by created by', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { createdBy: testUserId }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes filtered by date range', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { 
          validFrom: '2025-01-01',
          validUntil: '2025-12-31'
        }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes with text search', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { q: 'test' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should list quotes with multiple filters', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { 
          status: 'draft',
          customerId: 'test-customer-123',
          type: 'project'
        }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const result = await quoteService.listQuotes(
        { page: 2, pageSize: 10 },
        { status: 'draft' }
      );

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should return empty results for non-existent filters', async () => {
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { status: 'non-existent-status' }
      );

      expect(result.quotes).toBeDefined();
      expect(Array.isArray(result.quotes)).toBe(true);
      expect(result.quotes.length).toBe(0);
    });
  });

  describe('Performance validation', () => {
    it('should complete list operation within performance budget', async () => {
      const startTime = performance.now();
      
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 25 },
        { status: 'draft' }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Performance budget: 250ms for list with 25 items
      expect(duration).toBeLessThan(250);
      expect(result.quotes).toBeDefined();
    });

    it('should handle large page sizes efficiently', async () => {
      const startTime = performance.now();
      
      const result = await quoteService.listQuotes(
        { page: 1, pageSize: 100 },
        { status: 'draft' }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should still be reasonable even with larger page size
      expect(duration).toBeLessThan(500);
      expect(result.pagination.pageSize).toBe(100);
    });
  });

  describe('Filter validation', () => {
    it('should reject JSONB metadata filters for core fields', async () => {
      await expect(
        quoteService.listQuotes(
          { page: 1, pageSize: 25 },
          { 'metadata.status': 'draft' }
        )
      ).rejects.toThrow('JSONB_FILTER_FORBIDDEN');
    });

    it('should reject JSONB metadata filters for monetary fields', async () => {
      await expect(
        quoteService.listQuotes(
          { page: 1, pageSize: 25 },
          { 'metadata.total_amount': 1000 }
        )
      ).rejects.toThrow('JSONB_FILTER_FORBIDDEN');
    });

    it('should reject JSONB metadata filters for date fields', async () => {
      await expect(
        quoteService.listQuotes(
          { page: 1, pageSize: 25 },
          { 'metadata.created_at': '2025-01-01' }
        )
      ).rejects.toThrow('JSONB_FILTER_FORBIDDEN');
    });
  });
});
