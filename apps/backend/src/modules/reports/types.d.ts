/**
 * Reporting module types
 * TypeScript interfaces for reporting data structures
 */
import type { ExportJobStatus, ReportType, ExportFormat } from './constants.js';
export interface BaseReportFilters {
    organizationId: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export interface QuoteCycleTimeFilters extends BaseReportFilters {
    customerId?: string;
    projectId?: string;
    status?: string[];
    minCycleTimeDays?: number;
    maxCycleTimeDays?: number;
}
export interface InvoiceSettlementTimeFilters extends BaseReportFilters {
    customerId?: string;
    projectId?: string;
    status?: string[];
    overdueOnly?: boolean;
    minSettlementTimeDays?: number;
    maxSettlementTimeDays?: number;
}
export interface TimeApprovalsFilters extends BaseReportFilters {
    userId?: string;
    projectId?: string;
    status?: string[];
    minLeadTimeHours?: number;
    maxLeadTimeHours?: number;
}
export interface PaymentsReceivedFilters extends BaseReportFilters {
    customerId?: string;
    method?: string[];
    status?: string[];
    minAmount?: number;
    maxAmount?: number;
}
export interface ExportJobRequest {
    reportType: ReportType;
    format: ExportFormat;
    filters: QuoteCycleTimeFilters | InvoiceSettlementTimeFilters | TimeApprovalsFilters | PaymentsReceivedFilters;
    fileName?: string;
}
export interface ExportJob {
    id: string;
    organizationId: string;
    userId: string;
    reportType: ReportType;
    format: ExportFormat;
    status: ExportJobStatus;
    filters: Record<string, unknown>;
    fileName: string;
    totalRows?: number;
    processedRows?: number;
    downloadUrl?: string;
    errorMessage?: string;
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface QuoteCycleTimeSummary {
    totalQuotes: number;
    averageCycleTimeDays: number;
    medianCycleTimeDays: number;
    minCycleTimeDays: number;
    maxCycleTimeDays: number;
    quotesByStatus: Record<string, number>;
    quotesByProject: Record<string, number>;
    cycleTimeDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
}
export interface InvoiceSettlementTimeSummary {
    totalInvoices: number;
    averageSettlementTimeDays: number;
    medianSettlementTimeDays: number;
    overdueInvoices: number;
    overdueAmount: number;
    invoicesByStatus: Record<string, number>;
    invoicesByCustomer: Record<string, number>;
    settlementTimeDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
}
export interface TimeApprovalsSummary {
    totalEntries: number;
    approvedEntries: number;
    rejectedEntries: number;
    averageLeadTimeHours: number;
    rejectionRate: number;
    entriesByUser: Record<string, number>;
    entriesByProject: Record<string, number>;
    leadTimeDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
}
export interface PaymentsReceivedSummary {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    paymentsByMethod: Record<string, number>;
    paymentsByMonth: Record<string, number>;
    paymentsByCustomer: Record<string, number>;
    amountDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
}
export interface QuoteCycleTimeRow {
    quoteId: string;
    quoteNumber: string;
    customerName: string;
    projectName?: string;
    status: string;
    createdAt: string;
    sentAt?: string;
    acceptedAt?: string;
    cycleTimeDays: number;
    totalAmount: number;
    currency: string;
}
export interface InvoiceSettlementTimeRow {
    invoiceId: string;
    invoiceNumber: string;
    customerName: string;
    projectName?: string;
    status: string;
    issuedAt?: string;
    dueAt?: string;
    paidAt?: string;
    settlementTimeDays: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    currency: string;
}
export interface TimeApprovalsRow {
    entryId: string;
    userId: string;
    userName: string;
    projectName: string;
    status: string;
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    leadTimeHours: number;
    hours: number;
    description: string;
}
export interface PaymentsReceivedRow {
    paymentId: string;
    invoiceNumber: string;
    customerName: string;
    method: string;
    status: string;
    amount: number;
    currency: string;
    paidAt: string;
    reference?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface ReportSummaryResponse {
    reportType: ReportType;
    filters: Record<string, unknown>;
    summary: QuoteCycleTimeSummary | InvoiceSettlementTimeSummary | TimeApprovalsSummary | PaymentsReceivedSummary;
    generatedAt: string;
}
export interface ExportJobStatusResponse {
    job: ExportJob;
    progress: {
        percentage: number;
        status: string;
        estimatedTimeRemaining?: string;
    };
}
//# sourceMappingURL=types.d.ts.map