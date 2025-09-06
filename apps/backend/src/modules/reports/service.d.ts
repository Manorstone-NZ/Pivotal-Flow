/**
 * Reporting service
 * Core business logic for generating reports and summaries
 */
import type { PermissionService } from '../permissions/service.js';
import type { QuoteCycleTimeFilters, InvoiceSettlementTimeFilters, TimeApprovalsFilters, PaymentsReceivedFilters, QuoteCycleTimeSummary, InvoiceSettlementTimeSummary, TimeApprovalsSummary, PaymentsReceivedSummary, QuoteCycleTimeRow, PaginatedResponse } from './types.js';
/**
 * Reporting service for generating compliance reports and summaries
 */
export declare class ReportingService {
    private organizationId;
    private userId;
    private permissionService;
    private db;
    private metrics;
    constructor(organizationId: string, userId: string, permissionService: PermissionService);
    /**
     * Generate quote cycle time summary
     */
    generateQuoteCycleTimeSummary(filters: QuoteCycleTimeFilters): Promise<QuoteCycleTimeSummary>;
    /**
     * Generate invoice settlement time summary
     */
    generateInvoiceSettlementTimeSummary(filters: InvoiceSettlementTimeFilters): Promise<InvoiceSettlementTimeSummary>;
    /**
     * Generate time approvals summary
     */
    generateTimeApprovalsSummary(_filters: TimeApprovalsFilters): Promise<TimeApprovalsSummary>;
    /**
     * Generate payments received summary
     */
    generatePaymentsReceivedSummary(filters: PaymentsReceivedFilters): Promise<PaymentsReceivedSummary>;
    /**
     * Get quote cycle time data for export
     */
    getQuoteCycleTimeData(filters: QuoteCycleTimeFilters, page?: number, limit?: number): Promise<PaginatedResponse<QuoteCycleTimeRow>>;
    /**
     * Helper method to calculate median
     */
    private calculateMedian;
    /**
     * Helper method to group by property
     */
    private groupBy;
    /**
     * Helper method to calculate distribution
     */
    private calculateDistribution;
}
//# sourceMappingURL=service.d.ts.map