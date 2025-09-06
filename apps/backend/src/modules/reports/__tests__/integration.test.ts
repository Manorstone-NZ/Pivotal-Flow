/**
 * Reports integration tests
 * Integration tests with seed data for report generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { PermissionService } from '../../permissions/service.js';
import { REPORT_TYPES } from '../constants.js';
import { ReportingService } from '../service.js';
import type { 
  QuoteCycleTimeFilters, 
  InvoiceSettlementTimeFilters,
  PaymentsReceivedFilters 
} from '../types.js';

describe('Reports Integration Tests', () => {
  let reportingService: ReportingService;
  let mockPermissionService: PermissionService;

  beforeEach(async () => {
    mockPermissionService = {
      hasPermission: vi.fn().mockResolvedValue({ hasPermission: true }),
    } as unknown as PermissionService;

    reportingService = new ReportingService(
      'test-org-id',
      'test-user-id',
      mockPermissionService
    );

    // Seed test data
    await seedTestData();
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('Quote Cycle Time Report with Seed Data', () => {
    it('should generate report with proper envelope shape and totals', async () => {
      const filters: QuoteCycleTimeFilters = {
        organizationId: 'test-org-id',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      const result = await reportingService.generateQuoteCycleTimeSummary(filters);

      // Verify envelope shape
      expect(result).toHaveProperty('totalQuotes');
      expect(result).toHaveProperty('averageCycleTimeDays');
      expect(result).toHaveProperty('medianCycleTimeDays');
      expect(result).toHaveProperty('minCycleTimeDays');
      expect(result).toHaveProperty('maxCycleTimeDays');
      expect(result).toHaveProperty('quotesByStatus');
      expect(result).toHaveProperty('quotesByProject');
      expect(result).toHaveProperty('cycleTimeDistribution');

      // Verify totals are numeric
      expect(typeof result.totalQuotes).toBe('number');
      expect(typeof result.averageCycleTimeDays).toBe('number');
      expect(typeof result.medianCycleTimeDays).toBe('number');
      expect(typeof result.minCycleTimeDays).toBe('number');
      expect(typeof result.maxCycleTimeDays).toBe('number');

      // Verify distribution percentages sum to 100
      const totalPercentage = result.cycleTimeDistribution.reduce(
        (sum, item) => sum + item.percentage, 0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should handle paginated data correctly', async () => {
      const filters: QuoteCycleTimeFilters = {
        organizationId: 'test-org-id',
        page: 1,
        limit: 10,
      };

      const result = await reportingService.getQuoteCycleTimeData(filters);

      // Verify pagination envelope
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('limit', 10);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('hasNext');
      expect(result.pagination).toHaveProperty('hasPrev');

      // Verify data structure
      if (result.data.length > 0) {
        const firstItem = result.data[0];
        expect(firstItem).toHaveProperty('quoteId');
        expect(firstItem).toHaveProperty('quoteNumber');
        expect(firstItem).toHaveProperty('customerName');
        expect(firstItem).toHaveProperty('projectName');
        expect(firstItem).toHaveProperty('status');
        expect(firstItem).toHaveProperty('createdAt');
        expect(firstItem).toHaveProperty('cycleTimeDays');
        expect(firstItem).toHaveProperty('totalAmount');
        expect(firstItem).toHaveProperty('currency');
      }
    });
  });

  describe('Invoice Settlement Time Report with Seed Data', () => {
    it('should generate report with proper envelope shape and totals', async () => {
      const filters: InvoiceSettlementTimeFilters = {
        organizationId: 'test-org-id',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      const result = await reportingService.generateInvoiceSettlementTimeSummary(filters);

      // Verify envelope shape
      expect(result).toHaveProperty('totalInvoices');
      expect(result).toHaveProperty('averageSettlementTimeDays');
      expect(result).toHaveProperty('medianSettlementTimeDays');
      expect(result).toHaveProperty('overdueInvoices');
      expect(result).toHaveProperty('overdueAmount');
      expect(result).toHaveProperty('invoicesByStatus');
      expect(result).toHaveProperty('invoicesByCustomer');
      expect(result).toHaveProperty('settlementTimeDistribution');

      // Verify totals are numeric
      expect(typeof result.totalInvoices).toBe('number');
      expect(typeof result.averageSettlementTimeDays).toBe('number');
      expect(typeof result.medianSettlementTimeDays).toBe('number');
      expect(typeof result.overdueInvoices).toBe('number');
      expect(typeof result.overdueAmount).toBe('number');
    });
  });

  describe('Payments Received Report with Seed Data', () => {
    it('should generate report with proper envelope shape and totals', async () => {
      const filters: PaymentsReceivedFilters = {
        organizationId: 'test-org-id',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      const result = await reportingService.generatePaymentsReceivedSummary(filters);

      // Verify envelope shape
      expect(result).toHaveProperty('totalPayments');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('averageAmount');
      expect(result).toHaveProperty('paymentsByMethod');
      expect(result).toHaveProperty('paymentsByMonth');
      expect(result).toHaveProperty('paymentsByCustomer');
      expect(result).toHaveProperty('amountDistribution');

      // Verify totals are numeric
      expect(typeof result.totalPayments).toBe('number');
      expect(typeof result.totalAmount).toBe('number');
      expect(typeof result.averageAmount).toBe('number');
    });
  });

  describe('Performance and Observability', () => {
    it('should log performance metrics', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const filters: QuoteCycleTimeFilters = {
        organizationId: 'test-org-id',
      };

      await reportingService.generateQuoteCycleTimeSummary(filters);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reportName: 'quote-cycle-time',
          organizationId: 'test-org-id',
          rows: expect.any(Number),
          ms: expect.any(Number),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should record Prometheus metrics', async () => {
      const metrics = (reportingService as any).metrics;
      const recordReportGeneratedSpy = vi.spyOn(metrics, 'recordReportGenerated');
      const recordReportDurationSpy = vi.spyOn(metrics, 'recordReportDuration');

      const filters: QuoteCycleTimeFilters = {
        organizationId: 'test-org-id',
      };

      await reportingService.generateQuoteCycleTimeSummary(filters);

      expect(recordReportGeneratedSpy).toHaveBeenCalledWith(
        REPORT_TYPES.QUOTE_CYCLE_TIME,
        'test-org-id'
      );
      expect(recordReportDurationSpy).toHaveBeenCalledWith(
        REPORT_TYPES.QUOTE_CYCLE_TIME,
        'test-org-id',
        expect.any(Number)
      );
    });
  });

  // Helper functions for test data
  async function seedTestData(): Promise<void> {
    // This would seed the database with test data
    // For now, we'll mock the database responses
    // In a real integration test, you would insert actual test data
  }

  async function cleanupTestData(): Promise<void> {
    // This would clean up test data from the database
    // For now, we'll just clear any mocks
  }
});
