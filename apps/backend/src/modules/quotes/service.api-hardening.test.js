import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateAuditLogData, validateAuditValues } from '../../lib/audit-schema.js';
import { IdempotencyService } from '../../lib/idempotency.js';
import { QuoteLockingService } from '../../lib/quote-locking.js';
import { QuoteVersioningService } from '../../lib/quote-versioning.js';
// Mock database
const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    eq: vi.fn(),
    and: vi.fn(),
    desc: vi.fn(),
    lt: vi.fn()
};
describe('IdempotencyService', () => {
    let idempotencyService;
    beforeEach(() => {
        idempotencyService = new IdempotencyService(mockDb);
        vi.clearAllMocks();
    });
    it('should generate consistent request hash', async () => {
        const result1 = await idempotencyService.checkIdempotency('test-key-1', 'org-1', 'user-1', 'POST', '/quotes', { title: 'Test Quote', amount: 1000 });
        const result2 = await idempotencyService.checkIdempotency('test-key-1', 'org-1', 'user-1', 'POST', '/quotes', { title: 'Test Quote', amount: 1000 });
        expect(result1.exists).toBe(result2.exists);
    });
    it('should detect duplicate requests', async () => {
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{
                            responseStatus: 201,
                            responseBody: { id: 'quote-1' },
                            expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
                        }])
                })
            })
        });
        const result = await idempotencyService.checkIdempotency('test-key', 'org-1', 'user-1', 'POST', '/v1/quotes', { title: 'Test Quote' });
        expect(result.isDuplicate).toBe(true);
        expect(result.responseStatus).toBe(201);
        expect(result.responseBody).toEqual({ id: 'quote-1' });
    });
    it('should store response for idempotency', async () => {
        const context = {
            organizationId: 'org-1',
            userId: 'user-1',
            route: '/v1/quotes',
            requestHash: 'abc123'
        };
        mockDb.insert.mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined)
        });
        await idempotencyService.storeResponse(context, 201, { id: 'quote-1' });
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
            organizationId: 'org-1',
            userId: 'user-1',
            route: '/v1/quotes',
            requestHash: 'abc123',
            responseStatus: 201,
            responseBody: { id: 'quote-1' }
        }));
    });
});
describe('QuoteVersioningService', () => {
    let versioningService;
    beforeEach(() => {
        versioningService = new QuoteVersioningService(mockDb);
        vi.clearAllMocks();
    });
    it('should create new version with incremented version number', async () => {
        const versionData = {
            quoteId: 'quote-1',
            organizationId: 'org-1',
            customerId: 'customer-1',
            title: 'Test Quote',
            status: 'draft',
            type: 'project',
            validFrom: new Date(),
            validUntil: new Date(),
            currency: 'NZD',
            exchangeRate: '1.000000',
            subtotal: '1000.00',
            taxRate: '0.1500',
            taxAmount: '150.00',
            discountType: 'percentage',
            discountValue: '0.0000',
            discountAmount: '0.00',
            totalAmount: '1150.00',
            createdBy: 'user-1',
            metadata: {},
            lineItems: []
        };
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{ versionNumber: 2 }])
                    })
                })
            })
        });
        mockDb.insert.mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined)
        });
        mockDb.update.mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined)
            })
        });
        const versionId = await versioningService.createVersion(versionData);
        expect(versionId).toBeDefined();
        expect(mockDb.insert).toHaveBeenCalledTimes(2); // Quote version + line items
    });
    it('should get quote versions in descending order', async () => {
        const mockVersions = [
            { id: 'v3', versionNumber: 3, title: 'Version 3' },
            { id: 'v2', versionNumber: 2, title: 'Version 2' },
            { id: 'v1', versionNumber: 1, title: 'Version 1' }
        ];
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue(mockVersions)
                })
            })
        });
        const versions = await versioningService.getQuoteVersions('quote-1', 'org-1');
        expect(versions).toEqual(mockVersions);
        expect(mockDb.orderBy).toHaveBeenCalled();
    });
});
describe('QuoteLockingService', () => {
    let lockingService;
    beforeEach(() => {
        lockingService = new QuoteLockingService(mockDb);
        vi.clearAllMocks();
    });
    it('should allow editing draft quotes', async () => {
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ status: 'draft' }])
                })
            })
        });
        const result = await lockingService.checkQuoteLock({
            quoteId: 'quote-1',
            organizationId: 'org-1',
            userId: 'user-1',
            newData: {}
        });
        expect(result.isLocked).toBe(false);
        expect(result.canForceEdit).toBe(false);
        expect(result.requiresVersioning).toBe(false);
    });
    it('should block editing approved quotes without permission', async () => {
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ status: 'approved' }])
                })
            })
        });
        // Mock no force_edit permission
        mockDb.select.mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([])
                        })
                    })
                })
            })
        });
        const result = await lockingService.checkQuoteLock({
            quoteId: 'quote-1',
            organizationId: 'org-1',
            userId: 'user-1',
            newData: {}
        });
        expect(result.isLocked).toBe(true);
        expect(result.canForceEdit).toBe(false);
        expect(result.requiresVersioning).toBe(false);
        expect(result.reason).toContain('approved');
    });
    it('should allow force editing with permission', async () => {
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ status: 'approved' }])
                })
            })
        });
        // Mock force_edit permission
        mockDb.select.mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([{ id: 'perm-1' }])
                        })
                    })
                })
            })
        });
        const result = await lockingService.checkQuoteLock({
            quoteId: 'quote-1',
            organizationId: 'org-1',
            userId: 'user-1',
            newData: {}
        });
        expect(result.isLocked).toBe(true);
        expect(result.canForceEdit).toBe(true);
        expect(result.requiresVersioning).toBe(true);
    });
});
describe('Audit Schema Validation', () => {
    it('should validate valid audit log data', () => {
        const validData = {
            id: 'audit-1',
            organizationId: 'org-1',
            entityType: 'Quote',
            entityId: 'quote-1',
            action: 'quotes.create',
            actorId: 'user-1',
            oldValues: { status: 'draft' },
            newValues: { status: 'pending' },
            metadata: { reason: 'Status update' },
            createdAt: new Date()
        };
        const result = validateAuditLogData(validData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    it('should reject invalid audit log data', () => {
        const invalidData = {
            id: 'audit-1',
            // Missing required fields
            action: 'quotes.create',
            oldValues: 'not-an-object', // Should be object
            newValues: 'not-an-object' // Should be object
        };
        const result = validateAuditLogData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
    it('should validate audit values', () => {
        const validValues = {
            title: 'Updated Quote',
            status: 'approved',
            totalAmount: 1500
        };
        const result = validateAuditValues(validValues, 'oldValues');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    it('should reject non-object audit values', () => {
        const invalidValues = 'not-an-object';
        const result = validateAuditValues(invalidValues, 'oldValues');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=service.api-hardening.test.js.map