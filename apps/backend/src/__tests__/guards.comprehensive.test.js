import { describe, it, expect } from 'vitest';
import { throwIfMonetaryInMetadata, assertNoMonetaryInMetadata } from '@pivotal-flow/shared/guards/jsonbMonetaryGuard.js';
import { guardTypedFilters } from '@pivotal-flow/shared/db/filterGuard.js';
import { validateTenantContext, requireOrganizationId, validateResourceOwnership } from '@pivotal-flow/shared/tenancy/guard.js';
describe('Comprehensive Guard Test Suite', () => {
    describe('JSONB Monetary Guard', () => {
        describe('throwIfMonetaryInMetadata', () => {
            it('should allow valid metadata', () => {
                expect(() => throwIfMonetaryInMetadata({ note: "ok", tags: ["x"] })).not.toThrow();
                expect(() => throwIfMonetaryInMetadata({})).not.toThrow();
                expect(() => throwIfMonetaryInMetadata(null)).not.toThrow();
            });
            it('should reject forbidden monetary fields', () => {
                const forbiddenFields = [
                    'subtotal', 'taxTotal', 'grandTotal', 'unitPrice', 'discount',
                    'currency', 'status', 'totals', 'amount', 'price'
                ];
                forbiddenFields.forEach(field => {
                    expect(() => throwIfMonetaryInMetadata({ [field]: 100 }))
                        .toThrow('Forbidden monetary or status field');
                });
            });
            it('should reject nested forbidden fields', () => {
                expect(() => throwIfMonetaryInMetadata({
                    config: { pricing: { unitPrice: 100, discount: 10 } }
                })).toThrow('Forbidden monetary or status field');
            });
            it('should reject array items with forbidden fields', () => {
                expect(() => throwIfMonetaryInMetadata([
                    { metadata: { amount: 50 } },
                    { metadata: { discount: 10 } }
                ])).toThrow('Forbidden monetary or status field');
            });
        });
        describe('assertNoMonetaryInMetadata', () => {
            it('should return empty violations for valid metadata', () => {
                const violations = assertNoMonetaryInMetadata({ note: "ok", tags: ["x"] });
                expect(violations).toEqual([]);
            });
            it('should return violations for forbidden fields', () => {
                const violations = assertNoMonetaryInMetadata({ subtotal: 100, unitPrice: 50 });
                expect(violations).toHaveLength(2);
                expect(violations[0]?.key).toBe('subtotal');
                expect(violations[1]?.key).toBe('unitPrice');
            });
            it('should track paths correctly for nested violations', () => {
                const violations = assertNoMonetaryInMetadata({
                    config: { pricing: { unitPrice: 100 } }
                });
                expect(violations).toHaveLength(1);
                expect(violations[0]?.path).toBe('metadata.config.pricing.unitPrice');
                expect(violations[0]?.key).toBe('unitPrice');
            });
        });
    });
    describe('Filter Guard', () => {
        describe('guardTypedFilters', () => {
            it('should block metadata paths for core fields', () => {
                const result = guardTypedFilters({ "metadata.subtotal": 100 });
                expect(result.ok).toBe(false);
                expect(result.reason).toContain("metadata.subtotal");
            });
            it('should block metadata arrow syntax', () => {
                const result = guardTypedFilters({ "metadata->subtotal": 100 });
                expect(result.ok).toBe(false);
                expect(result.reason).toContain("metadata->subtotal");
            });
            it('should pass normal typed filters', () => {
                const result = guardTypedFilters({ status: "draft", customerId: "abc" });
                expect(result.ok).toBe(true);
            });
            it('should allow nested non-metadata paths', () => {
                const result = guardTypedFilters({
                    "customer.name": "John",
                    "project.code": "PRJ-001"
                });
                expect(result.ok).toBe(true);
            });
            it('should block all forbidden core fields in metadata', () => {
                const forbiddenFields = [
                    "metadata.status", "metadata.currency", "metadata.subtotal",
                    "metadata.taxTotal", "metadata.grandTotal", "metadata.unitPrice",
                    "metadata.discount", "metadata.quoteNumber", "metadata.customerId",
                    "metadata.projectId", "metadata.createdAt"
                ];
                forbiddenFields.forEach(field => {
                    const result = guardTypedFilters({ [field]: "value" });
                    expect(result.ok).toBe(false);
                    expect(result.reason).toContain(field);
                });
            });
        });
    });
    describe('Tenancy Guard', () => {
        describe('validateTenantContext', () => {
            it('should validate valid tenant context', () => {
                const context = {
                    organizationId: 'org-123',
                    userId: 'user-456'
                };
                const result = validateTenantContext(context);
                expect(result.isValid).toBe(true);
            });
            it('should reject invalid tenant context', () => {
                const context = {
                    organizationId: '',
                    userId: 'user-456'
                };
                const result = validateTenantContext(context);
                expect(result.isValid).toBe(false);
                expect(result.error).toContain('Organization context required');
            });
        });
        describe('requireOrganizationId', () => {
            it('should add organizationId to data', () => {
                const data = { name: 'test' };
                const result = requireOrganizationId(data, 'org-123');
                expect(result).toEqual({
                    name: 'test',
                    organizationId: 'org-123'
                });
            });
            it('should preserve existing organizationId', () => {
                const data = { name: 'test', organizationId: 'org-456' };
                const result = requireOrganizationId(data, 'org-123');
                expect(result).toEqual({
                    name: 'test',
                    organizationId: 'org-123' // Should be overridden
                });
            });
        });
        describe('validateResourceOwnership', () => {
            it('should validate resource ownership', () => {
                const resource = { organizationId: 'org-123' };
                const result = validateResourceOwnership(resource, 'org-123');
                expect(result).toBe(true);
            });
            it('should reject mismatched ownership', () => {
                const resource = { organizationId: 'org-456' };
                const result = validateResourceOwnership(resource, 'org-123');
                expect(result).toBe(false);
            });
            it('should reject null resource', () => {
                const result = validateResourceOwnership(null, 'org-123');
                expect(result).toBe(false);
            });
        });
    });
    describe('Integration Tests', () => {
        it('should work together - valid quote creation', () => {
            // Test that all guards work together for a valid quote
            const quoteData = {
                organizationId: 'org-123',
                customerId: 'customer-456',
                metadata: {
                    tags: ['urgent'],
                    notes: 'Customer requested expedited processing'
                },
                lines: [
                    {
                        serviceCategoryId: 'cat-1',
                        quantity: 10,
                        unitPrice: 100,
                        metadata: {
                            customFields: { priority: 'high' }
                        }
                    }
                ]
            };
            // Should not throw any guard violations
            expect(() => {
                requireOrganizationId(quoteData, 'org-123');
                throwIfMonetaryInMetadata(quoteData.metadata);
                quoteData.lines.forEach(line => {
                    if (line.metadata) {
                        throwIfMonetaryInMetadata(line.metadata);
                    }
                });
            }).not.toThrow();
        });
        it('should catch violations - invalid quote creation', () => {
            // Test that guards catch violations
            const invalidQuoteData = {
                organizationId: 'org-123',
                customerId: 'customer-456',
                metadata: {
                    subtotal: 1000, // This should be caught
                    tags: ['urgent']
                }
            };
            // Should throw for monetary data in metadata
            expect(() => {
                requireOrganizationId(invalidQuoteData, 'org-123');
                throwIfMonetaryInMetadata(invalidQuoteData.metadata);
            }).toThrow('Forbidden monetary or status field');
        });
        it('should catch filter violations', () => {
            // Test that filter guards catch metadata queries
            const invalidFilters = {
                status: 'draft',
                'metadata.subtotal': 1000 // This should be caught
            };
            const result = guardTypedFilters(invalidFilters);
            expect(result.ok).toBe(false);
            expect(result.reason).toContain('metadata.subtotal');
        });
    });
});
//# sourceMappingURL=guards.comprehensive.test.js.map