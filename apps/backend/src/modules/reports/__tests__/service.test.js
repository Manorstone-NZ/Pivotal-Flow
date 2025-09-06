/**
 * Reports service tests
 * Unit tests for report generation and validation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportingService } from '../service.js';
// Mock dependencies
vi.mock('../../lib/db.js', () => ({
    getDatabase: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
    })),
}));
vi.mock('../metrics.js', () => ({
    ReportingMetrics: {
        getInstance: vi.fn(() => ({
            recordReportGenerated: vi.fn(),
            recordReportDuration: vi.fn(),
        })),
    },
}));
describe('ReportingService', () => {
    let reportingService;
    let mockPermissionService;
    beforeEach(() => {
        mockPermissionService = {
            hasPermission: vi.fn().mockResolvedValue({ hasPermission: true }),
        };
        reportingService = new ReportingService('test-org-id', 'test-user-id', mockPermissionService);
    });
    describe('generateQuoteCycleTimeSummary', () => {
        it('should generate summary with valid filters', async () => {
            const filters = {
                organizationId: 'test-org-id',
                fromDate: '2024-01-01',
                toDate: '2024-12-31',
                minCycleTimeDays: 1,
                maxCycleTimeDays: 30,
            };
            const result = await reportingService.generateQuoteCycleTimeSummary(filters);
            expect(result).toHaveProperty('totalQuotes');
            expect(result).toHaveProperty('averageCycleTimeDays');
            expect(result).toHaveProperty('medianCycleTimeDays');
            expect(result).toHaveProperty('minCycleTimeDays');
            expect(result).toHaveProperty('maxCycleTimeDays');
            expect(result).toHaveProperty('quotesByStatus');
            expect(result).toHaveProperty('quotesByProject');
            expect(result).toHaveProperty('cycleTimeDistribution');
        });
        it('should throw error when permission denied', async () => {
            mockPermissionService.hasPermission = vi.fn().mockResolvedValue({ hasPermission: false });
            const filters = {
                organizationId: 'test-org-id',
            };
            await expect(reportingService.generateQuoteCycleTimeSummary(filters))
                .rejects.toThrow('Permission denied: cannot view reports');
        });
        it('should handle empty results gracefully', async () => {
            const filters = {
                organizationId: 'test-org-id',
                fromDate: '2024-01-01',
                toDate: '2024-01-02',
            };
            const result = await reportingService.generateQuoteCycleTimeSummary(filters);
            expect(result.totalQuotes).toBe(0);
            expect(result.averageCycleTimeDays).toBe(0);
            expect(result.medianCycleTimeDays).toBe(0);
            expect(result.minCycleTimeDays).toBe(0);
            expect(result.maxCycleTimeDays).toBe(0);
        });
    });
    describe('generateInvoiceSettlementTimeSummary', () => {
        it('should generate summary with valid filters', async () => {
            const filters = {
                organizationId: 'test-org-id',
                fromDate: '2024-01-01',
                toDate: '2024-12-31',
                overdueOnly: true,
            };
            const result = await reportingService.generateInvoiceSettlementTimeSummary(filters);
            expect(result).toHaveProperty('totalInvoices');
            expect(result).toHaveProperty('averageSettlementTimeDays');
            expect(result).toHaveProperty('medianSettlementTimeDays');
            expect(result).toHaveProperty('overdueInvoices');
            expect(result).toHaveProperty('overdueAmount');
            expect(result).toHaveProperty('invoicesByStatus');
            expect(result).toHaveProperty('invoicesByCustomer');
            expect(result).toHaveProperty('settlementTimeDistribution');
        });
        it('should throw error when permission denied', async () => {
            mockPermissionService.hasPermission = vi.fn().mockResolvedValue({ hasPermission: false });
            const filters = {
                organizationId: 'test-org-id',
            };
            await expect(reportingService.generateInvoiceSettlementTimeSummary(filters))
                .rejects.toThrow('Permission denied: cannot view reports');
        });
    });
    describe('generateTimeApprovalsSummary', () => {
        it('should generate placeholder summary', async () => {
            const filters = {
                organizationId: 'test-org-id',
            };
            const result = await reportingService.generateTimeApprovalsSummary(filters);
            expect(result).toHaveProperty('totalEntries');
            expect(result).toHaveProperty('approvedEntries');
            expect(result).toHaveProperty('rejectedEntries');
            expect(result).toHaveProperty('averageLeadTimeHours');
            expect(result).toHaveProperty('rejectionRate');
            expect(result).toHaveProperty('entriesByUser');
            expect(result).toHaveProperty('entriesByProject');
            expect(result).toHaveProperty('leadTimeDistribution');
        });
        it('should throw error when permission denied', async () => {
            mockPermissionService.hasPermission = vi.fn().mockResolvedValue({ hasPermission: false });
            const filters = {
                organizationId: 'test-org-id',
            };
            await expect(reportingService.generateTimeApprovalsSummary(filters))
                .rejects.toThrow('Permission denied: cannot view reports');
        });
    });
    describe('generatePaymentsReceivedSummary', () => {
        it('should generate summary with valid filters', async () => {
            const filters = {
                organizationId: 'test-org-id',
                fromDate: '2024-01-01',
                toDate: '2024-12-31',
                minAmount: 100,
                maxAmount: 10000,
            };
            const result = await reportingService.generatePaymentsReceivedSummary(filters);
            expect(result).toHaveProperty('totalPayments');
            expect(result).toHaveProperty('totalAmount');
            expect(result).toHaveProperty('averageAmount');
            expect(result).toHaveProperty('paymentsByMethod');
            expect(result).toHaveProperty('paymentsByMonth');
            expect(result).toHaveProperty('paymentsByCustomer');
            expect(result).toHaveProperty('amountDistribution');
        });
        it('should throw error when permission denied', async () => {
            mockPermissionService.hasPermission = vi.fn().mockResolvedValue({ hasPermission: false });
            const filters = {
                organizationId: 'test-org-id',
            };
            await expect(reportingService.generatePaymentsReceivedSummary(filters))
                .rejects.toThrow('Permission denied: cannot view reports');
        });
    });
    describe('getQuoteCycleTimeData', () => {
        it('should return paginated data with proper envelope', async () => {
            const filters = {
                organizationId: 'test-org-id',
                page: 1,
                limit: 25,
            };
            const result = await reportingService.getQuoteCycleTimeData(filters);
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.pagination).toHaveProperty('page');
            expect(result.pagination).toHaveProperty('limit');
            expect(result.pagination).toHaveProperty('total');
            expect(result.pagination).toHaveProperty('totalPages');
            expect(result.pagination).toHaveProperty('hasNext');
            expect(result.pagination).toHaveProperty('hasPrev');
        });
        it('should apply cycle time filters correctly', async () => {
            const filters = {
                organizationId: 'test-org-id',
                minCycleTimeDays: 5,
                maxCycleTimeDays: 15,
            };
            const result = await reportingService.getQuoteCycleTimeData(filters);
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });
    });
    describe('calculateMedian', () => {
        it('should calculate median for odd number of values', () => {
            const values = [1, 2, 3, 4, 5];
            const median = reportingService.calculateMedian(values);
            expect(median).toBe(3);
        });
        it('should calculate median for even number of values', () => {
            const values = [1, 2, 3, 4];
            const median = reportingService.calculateMedian(values);
            expect(median).toBe(2.5);
        });
        it('should return 0 for empty array', () => {
            const values = [];
            const median = reportingService.calculateMedian(values);
            expect(median).toBe(0);
        });
    });
    describe('groupBy', () => {
        it('should group items by property', () => {
            const items = [
                { status: 'active', count: 1 },
                { status: 'inactive', count: 2 },
                { status: 'active', count: 3 },
            ];
            const result = reportingService.groupBy(items, 'status');
            expect(result).toEqual({
                'active': 2,
                'inactive': 1,
            });
        });
        it('should handle null values', () => {
            const items = [
                { status: 'active', count: 1 },
                { status: null, count: 2 },
                { status: 'active', count: 3 },
            ];
            const result = reportingService.groupBy(items, 'status');
            expect(result).toEqual({
                'active': 2,
                'Unknown': 1,
            });
        });
    });
    describe('calculateDistribution', () => {
        it('should calculate distribution correctly', () => {
            const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const ranges = [
                { min: 0, max: 5, label: '0-5' },
                { min: 6, max: 10, label: '6-10' },
            ];
            const result = reportingService.calculateDistribution(values, ranges);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                range: '0-5',
                count: 5,
                percentage: 50,
            });
            expect(result[1]).toEqual({
                range: '6-10',
                count: 5,
                percentage: 50,
            });
        });
        it('should handle empty values', () => {
            const values = [];
            const ranges = [
                { min: 0, max: 5, label: '0-5' },
            ];
            const result = reportingService.calculateDistribution(values, ranges);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                range: '0-5',
                count: 0,
                percentage: 0,
            });
        });
    });
});
//# sourceMappingURL=service.test.js.map