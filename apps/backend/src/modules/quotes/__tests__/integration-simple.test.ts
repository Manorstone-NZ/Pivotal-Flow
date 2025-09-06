import { guardTypedFilters } from '@pivotal-flow/shared';
import { describe, it, expect } from 'vitest';

describe('Integration Tests - Quote Filter Validation', () => {
  describe('guardTypedFilters integration', () => {
    it('should validate quote filters correctly', () => {
      // Test valid filters
      const validFilters = {
        status: 'draft',
        customerId: 'customer-123',
        projectId: 'project-456',
        type: 'project',
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        createdBy: 'user-789'
      };

      const validResult = guardTypedFilters(validFilters);
      expect(validResult.ok).toBe(true);

      // Test invalid metadata filters
      const invalidFilters = {
        status: 'draft',
        'metadata.status': 'draft', // Should be rejected
        'metadata.total_amount': 1000, // Should be rejected
        customerId: 'customer-123'
      };

      const invalidResult = guardTypedFilters(invalidFilters);
      expect(invalidResult.ok).toBe(false);
      expect(invalidResult.reason).toContain('metadata');
    });

    it('should handle edge cases', () => {
      // Empty filters
      expect(guardTypedFilters({})).toEqual({ ok: true });

      // Filters with only metadata for non-core fields
      const nonCoreMetadata = {
        'metadata.custom_field': 'value',
        'metadata.tags': ['urgent', 'review']
      };
      expect(guardTypedFilters(nonCoreMetadata)).toEqual({ ok: true });

      // Mixed valid and invalid
      const mixedFilters = {
        status: 'draft',
        'metadata.status': 'draft', // Invalid
        'metadata.notes': 'Customer note' // Valid
      };
      const result = guardTypedFilters(mixedFilters);
      expect(result.ok).toBe(false);
      expect(result.reason).toContain('metadata.status');
    });
  });
});
