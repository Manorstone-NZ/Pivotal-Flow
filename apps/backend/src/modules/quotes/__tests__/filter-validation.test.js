import { guardTypedFilters } from '@pivotal-flow/shared';
import { describe, it, expect } from 'vitest';
describe('Repository Filter Validation', () => {
    describe('guardTypedFilters', () => {
        it('should allow valid typed filters', () => {
            const filters = {
                status: 'draft',
                customerId: 'customer-123',
                projectId: 'project-456',
                type: 'project',
                q: 'search term',
                validFrom: '2025-01-01',
                validUntil: '2025-12-31',
                createdBy: 'user-789'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(true);
        });
        it('should reject JSONB metadata filters for core fields', () => {
            const filters = {
                status: 'draft',
                'metadata.status': 'draft', // This should be rejected
                customerId: 'customer-123'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('metadata');
        });
        it('should reject JSONB metadata filters for monetary fields', () => {
            const filters = {
                'metadata.total_amount': 1000, // This should be rejected
                status: 'draft'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('total_amount');
        });
        it('should reject JSONB metadata filters for date fields', () => {
            const filters = {
                'metadata.created_at': '2025-01-01', // This should be rejected
                status: 'draft'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('created_at');
        });
        it('should reject JSONB metadata filters for quote number', () => {
            const filters = {
                'metadata.quote_number': 'Q-2025-001', // This should be rejected
                status: 'draft'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('quote_number');
        });
        it('should allow empty filters', () => {
            const filters = {};
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(true);
        });
        it('should allow undefined filters', () => {
            const result = guardTypedFilters({});
            expect(result.ok).toBe(true);
        });
        it('should allow null filters', () => {
            const result = guardTypedFilters({});
            expect(result.ok).toBe(true);
        });
        it('should reject nested JSONB paths', () => {
            const filters = {
                'metadata.customer.details.status': 'active', // This should be rejected
                status: 'draft'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('metadata');
        });
        it('should allow valid metadata for non-core fields', () => {
            const filters = {
                status: 'draft',
                'metadata.custom_field': 'custom_value', // This should be allowed
                customerId: 'customer-123'
            };
            const result = guardTypedFilters(filters);
            expect(result.ok).toBe(true);
        });
    });
});
//# sourceMappingURL=filter-validation.test.js.map