/**
 * Reporting module Zod schemas
 * Validation schemas for API requests and responses
 */
import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const DateRangeSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const BaseReportFiltersSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    organizationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    organizationId: string;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const QuoteCycleTimeFiltersSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    organizationId: z.ZodString;
} & {
    customerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minCycleTimeDays: z.ZodOptional<z.ZodNumber>;
    maxCycleTimeDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minCycleTimeDays?: number | undefined;
    maxCycleTimeDays?: number | undefined;
}, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minCycleTimeDays?: number | undefined;
    maxCycleTimeDays?: number | undefined;
}>;
export declare const InvoiceSettlementTimeFiltersSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    organizationId: z.ZodString;
} & {
    customerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    overdueOnly: z.ZodOptional<z.ZodBoolean>;
    minSettlementTimeDays: z.ZodOptional<z.ZodNumber>;
    maxSettlementTimeDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    overdueOnly?: boolean | undefined;
    minSettlementTimeDays?: number | undefined;
    maxSettlementTimeDays?: number | undefined;
}, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    overdueOnly?: boolean | undefined;
    minSettlementTimeDays?: number | undefined;
    maxSettlementTimeDays?: number | undefined;
}>;
export declare const TimeApprovalsFiltersSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    organizationId: z.ZodString;
} & {
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minLeadTimeHours: z.ZodOptional<z.ZodNumber>;
    maxLeadTimeHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    status?: string[] | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minLeadTimeHours?: number | undefined;
    maxLeadTimeHours?: number | undefined;
}, {
    organizationId: string;
    status?: string[] | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minLeadTimeHours?: number | undefined;
    maxLeadTimeHours?: number | undefined;
}>;
export declare const PaymentsReceivedFiltersSchema: z.ZodObject<{
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
} & {
    organizationId: z.ZodString;
} & {
    customerId: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    method?: string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    organizationId: string;
    status?: string[] | undefined;
    customerId?: string | undefined;
    method?: string[] | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
export declare const ExportJobRequestSchema: z.ZodObject<{
    reportType: z.ZodEnum<["quote_cycle_time", "invoice_settlement_time", "time_approvals", "payments_received"]>;
    format: z.ZodEnum<["csv", "json"]>;
    filters: z.ZodUnion<[z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    } & {
        organizationId: z.ZodString;
    } & {
        customerId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        minCycleTimeDays: z.ZodOptional<z.ZodNumber>;
        maxCycleTimeDays: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minCycleTimeDays?: number | undefined;
        maxCycleTimeDays?: number | undefined;
    }, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minCycleTimeDays?: number | undefined;
        maxCycleTimeDays?: number | undefined;
    }>, z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    } & {
        organizationId: z.ZodString;
    } & {
        customerId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        overdueOnly: z.ZodOptional<z.ZodBoolean>;
        minSettlementTimeDays: z.ZodOptional<z.ZodNumber>;
        maxSettlementTimeDays: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        overdueOnly?: boolean | undefined;
        minSettlementTimeDays?: number | undefined;
        maxSettlementTimeDays?: number | undefined;
    }, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        overdueOnly?: boolean | undefined;
        minSettlementTimeDays?: number | undefined;
        maxSettlementTimeDays?: number | undefined;
    }>, z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    } & {
        organizationId: z.ZodString;
    } & {
        userId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        minLeadTimeHours: z.ZodOptional<z.ZodNumber>;
        maxLeadTimeHours: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        status?: string[] | undefined;
        userId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minLeadTimeHours?: number | undefined;
        maxLeadTimeHours?: number | undefined;
    }, {
        organizationId: string;
        status?: string[] | undefined;
        userId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minLeadTimeHours?: number | undefined;
        maxLeadTimeHours?: number | undefined;
    }>, z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    } & {
        organizationId: z.ZodString;
    } & {
        customerId: z.ZodOptional<z.ZodString>;
        method: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        minAmount: z.ZodOptional<z.ZodNumber>;
        maxAmount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        method?: string[] | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }, {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        method?: string[] | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    }>]>;
    fileName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reportType: "quote_cycle_time" | "invoice_settlement_time" | "time_approvals" | "payments_received";
    format: "json" | "csv";
    filters: {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minCycleTimeDays?: number | undefined;
        maxCycleTimeDays?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        overdueOnly?: boolean | undefined;
        minSettlementTimeDays?: number | undefined;
        maxSettlementTimeDays?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        userId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minLeadTimeHours?: number | undefined;
        maxLeadTimeHours?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        method?: string[] | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    };
    fileName?: string | undefined;
}, {
    reportType: "quote_cycle_time" | "invoice_settlement_time" | "time_approvals" | "payments_received";
    format: "json" | "csv";
    filters: {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minCycleTimeDays?: number | undefined;
        maxCycleTimeDays?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        overdueOnly?: boolean | undefined;
        minSettlementTimeDays?: number | undefined;
        maxSettlementTimeDays?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        userId?: string | undefined;
        projectId?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minLeadTimeHours?: number | undefined;
        maxLeadTimeHours?: number | undefined;
    } | {
        organizationId: string;
        status?: string[] | undefined;
        customerId?: string | undefined;
        method?: string[] | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
        minAmount?: number | undefined;
        maxAmount?: number | undefined;
    };
    fileName?: string | undefined;
}>;
export declare const ExportJobSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    userId: z.ZodString;
    reportType: z.ZodString;
    format: z.ZodString;
    status: z.ZodEnum<["pending", "processing", "completed", "failed", "cancelled"]>;
    filters: z.ZodRecord<z.ZodString, z.ZodAny>;
    fileName: z.ZodString;
    totalRows: z.ZodOptional<z.ZodNumber>;
    processedRows: z.ZodOptional<z.ZodNumber>;
    downloadUrl: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: "pending" | "failed" | "completed" | "cancelled" | "processing";
    userId: string;
    reportType: string;
    format: string;
    filters: Record<string, any>;
    fileName: string;
    startedAt?: string | undefined;
    totalRows?: number | undefined;
    processedRows?: number | undefined;
    downloadUrl?: string | undefined;
    errorMessage?: string | undefined;
    completedAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: "pending" | "failed" | "completed" | "cancelled" | "processing";
    userId: string;
    reportType: string;
    format: string;
    filters: Record<string, any>;
    fileName: string;
    startedAt?: string | undefined;
    totalRows?: number | undefined;
    processedRows?: number | undefined;
    downloadUrl?: string | undefined;
    errorMessage?: string | undefined;
    completedAt?: string | undefined;
}>;
export declare const QuoteCycleTimeSummarySchema: z.ZodObject<{
    totalQuotes: z.ZodNumber;
    averageCycleTimeDays: z.ZodNumber;
    medianCycleTimeDays: z.ZodNumber;
    minCycleTimeDays: z.ZodNumber;
    maxCycleTimeDays: z.ZodNumber;
    quotesByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    quotesByProject: z.ZodRecord<z.ZodString, z.ZodNumber>;
    cycleTimeDistribution: z.ZodArray<z.ZodObject<{
        range: z.ZodString;
        count: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        range: string;
        count: number;
    }, {
        percentage: number;
        range: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalQuotes: number;
    minCycleTimeDays: number;
    maxCycleTimeDays: number;
    averageCycleTimeDays: number;
    medianCycleTimeDays: number;
    quotesByStatus: Record<string, number>;
    quotesByProject: Record<string, number>;
    cycleTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}, {
    totalQuotes: number;
    minCycleTimeDays: number;
    maxCycleTimeDays: number;
    averageCycleTimeDays: number;
    medianCycleTimeDays: number;
    quotesByStatus: Record<string, number>;
    quotesByProject: Record<string, number>;
    cycleTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}>;
export declare const InvoiceSettlementTimeSummarySchema: z.ZodObject<{
    totalInvoices: z.ZodNumber;
    averageSettlementTimeDays: z.ZodNumber;
    medianSettlementTimeDays: z.ZodNumber;
    overdueInvoices: z.ZodNumber;
    overdueAmount: z.ZodNumber;
    invoicesByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    invoicesByCustomer: z.ZodRecord<z.ZodString, z.ZodNumber>;
    settlementTimeDistribution: z.ZodArray<z.ZodObject<{
        range: z.ZodString;
        count: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        range: string;
        count: number;
    }, {
        percentage: number;
        range: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalInvoices: number;
    averageSettlementTimeDays: number;
    medianSettlementTimeDays: number;
    overdueInvoices: number;
    overdueAmount: number;
    invoicesByStatus: Record<string, number>;
    invoicesByCustomer: Record<string, number>;
    settlementTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}, {
    totalInvoices: number;
    averageSettlementTimeDays: number;
    medianSettlementTimeDays: number;
    overdueInvoices: number;
    overdueAmount: number;
    invoicesByStatus: Record<string, number>;
    invoicesByCustomer: Record<string, number>;
    settlementTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}>;
export declare const TimeApprovalsSummarySchema: z.ZodObject<{
    totalEntries: z.ZodNumber;
    approvedEntries: z.ZodNumber;
    rejectedEntries: z.ZodNumber;
    averageLeadTimeHours: z.ZodNumber;
    rejectionRate: z.ZodNumber;
    entriesByUser: z.ZodRecord<z.ZodString, z.ZodNumber>;
    entriesByProject: z.ZodRecord<z.ZodString, z.ZodNumber>;
    leadTimeDistribution: z.ZodArray<z.ZodObject<{
        range: z.ZodString;
        count: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        range: string;
        count: number;
    }, {
        percentage: number;
        range: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalEntries: number;
    approvedEntries: number;
    rejectedEntries: number;
    averageLeadTimeHours: number;
    rejectionRate: number;
    entriesByUser: Record<string, number>;
    entriesByProject: Record<string, number>;
    leadTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}, {
    totalEntries: number;
    approvedEntries: number;
    rejectedEntries: number;
    averageLeadTimeHours: number;
    rejectionRate: number;
    entriesByUser: Record<string, number>;
    entriesByProject: Record<string, number>;
    leadTimeDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}>;
export declare const PaymentsReceivedSummarySchema: z.ZodObject<{
    totalPayments: z.ZodNumber;
    totalAmount: z.ZodNumber;
    averageAmount: z.ZodNumber;
    paymentsByMethod: z.ZodRecord<z.ZodString, z.ZodNumber>;
    paymentsByMonth: z.ZodRecord<z.ZodString, z.ZodNumber>;
    paymentsByCustomer: z.ZodRecord<z.ZodString, z.ZodNumber>;
    amountDistribution: z.ZodArray<z.ZodObject<{
        range: z.ZodString;
        count: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        range: string;
        count: number;
    }, {
        percentage: number;
        range: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalAmount: number;
    totalPayments: number;
    averageAmount: number;
    paymentsByMethod: Record<string, number>;
    paymentsByMonth: Record<string, number>;
    paymentsByCustomer: Record<string, number>;
    amountDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}, {
    totalAmount: number;
    totalPayments: number;
    averageAmount: number;
    paymentsByMethod: Record<string, number>;
    paymentsByMonth: Record<string, number>;
    paymentsByCustomer: Record<string, number>;
    amountDistribution: {
        percentage: number;
        range: string;
        count: number;
    }[];
}>;
export declare const QuoteCycleTimeRowSchema: z.ZodObject<{
    quoteId: z.ZodString;
    quoteNumber: z.ZodString;
    customerName: z.ZodString;
    projectName: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodString;
    sentAt: z.ZodOptional<z.ZodString>;
    acceptedAt: z.ZodOptional<z.ZodString>;
    cycleTimeDays: z.ZodNumber;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quoteId: string;
    totalAmount: number;
    createdAt: string;
    status: string;
    currency: string;
    quoteNumber: string;
    customerName: string;
    cycleTimeDays: number;
    sentAt?: string | undefined;
    acceptedAt?: string | undefined;
    projectName?: string | undefined;
}, {
    quoteId: string;
    totalAmount: number;
    createdAt: string;
    status: string;
    currency: string;
    quoteNumber: string;
    customerName: string;
    cycleTimeDays: number;
    sentAt?: string | undefined;
    acceptedAt?: string | undefined;
    projectName?: string | undefined;
}>;
export declare const InvoiceSettlementTimeRowSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    invoiceNumber: z.ZodString;
    customerName: z.ZodString;
    projectName: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    issuedAt: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodString>;
    paidAt: z.ZodOptional<z.ZodString>;
    settlementTimeDays: z.ZodNumber;
    totalAmount: z.ZodNumber;
    paidAmount: z.ZodNumber;
    overdueAmount: z.ZodNumber;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    totalAmount: number;
    status: string;
    currency: string;
    invoiceNumber: string;
    paidAmount: number;
    invoiceId: string;
    overdueAmount: number;
    customerName: string;
    settlementTimeDays: number;
    issuedAt?: string | undefined;
    dueAt?: string | undefined;
    paidAt?: string | undefined;
    projectName?: string | undefined;
}, {
    totalAmount: number;
    status: string;
    currency: string;
    invoiceNumber: string;
    paidAmount: number;
    invoiceId: string;
    overdueAmount: number;
    customerName: string;
    settlementTimeDays: number;
    issuedAt?: string | undefined;
    dueAt?: string | undefined;
    paidAt?: string | undefined;
    projectName?: string | undefined;
}>;
export declare const TimeApprovalsRowSchema: z.ZodObject<{
    entryId: z.ZodString;
    userId: z.ZodString;
    userName: z.ZodString;
    projectName: z.ZodString;
    status: z.ZodString;
    submittedAt: z.ZodString;
    approvedAt: z.ZodOptional<z.ZodString>;
    rejectedAt: z.ZodOptional<z.ZodString>;
    leadTimeHours: z.ZodNumber;
    hours: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    status: string;
    userId: string;
    userName: string;
    projectName: string;
    hours: number;
    entryId: string;
    submittedAt: string;
    leadTimeHours: number;
    approvedAt?: string | undefined;
    rejectedAt?: string | undefined;
}, {
    description: string;
    status: string;
    userId: string;
    userName: string;
    projectName: string;
    hours: number;
    entryId: string;
    submittedAt: string;
    leadTimeHours: number;
    approvedAt?: string | undefined;
    rejectedAt?: string | undefined;
}>;
export declare const PaymentsReceivedRowSchema: z.ZodObject<{
    paymentId: z.ZodString;
    invoiceNumber: z.ZodString;
    customerName: z.ZodString;
    method: z.ZodString;
    status: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    paidAt: z.ZodString;
    reference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    currency: string;
    invoiceNumber: string;
    paidAt: string;
    amount: number;
    method: string;
    customerName: string;
    paymentId: string;
    reference?: string | undefined;
}, {
    status: string;
    currency: string;
    invoiceNumber: string;
    paidAt: string;
    amount: number;
    method: string;
    customerName: string;
    paymentId: string;
    reference?: string | undefined;
}>;
export declare const PaginatedResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNext: z.ZodBoolean;
        hasPrev: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    data: T["_output"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}, {
    data: T["_input"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const ReportSummaryResponseSchema: z.ZodObject<{
    reportType: z.ZodString;
    filters: z.ZodRecord<z.ZodString, z.ZodAny>;
    summary: z.ZodUnion<[z.ZodObject<{
        totalQuotes: z.ZodNumber;
        averageCycleTimeDays: z.ZodNumber;
        medianCycleTimeDays: z.ZodNumber;
        minCycleTimeDays: z.ZodNumber;
        maxCycleTimeDays: z.ZodNumber;
        quotesByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
        quotesByProject: z.ZodRecord<z.ZodString, z.ZodNumber>;
        cycleTimeDistribution: z.ZodArray<z.ZodObject<{
            range: z.ZodString;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            percentage: number;
            range: string;
            count: number;
        }, {
            percentage: number;
            range: string;
            count: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalQuotes: number;
        minCycleTimeDays: number;
        maxCycleTimeDays: number;
        averageCycleTimeDays: number;
        medianCycleTimeDays: number;
        quotesByStatus: Record<string, number>;
        quotesByProject: Record<string, number>;
        cycleTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }, {
        totalQuotes: number;
        minCycleTimeDays: number;
        maxCycleTimeDays: number;
        averageCycleTimeDays: number;
        medianCycleTimeDays: number;
        quotesByStatus: Record<string, number>;
        quotesByProject: Record<string, number>;
        cycleTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }>, z.ZodObject<{
        totalInvoices: z.ZodNumber;
        averageSettlementTimeDays: z.ZodNumber;
        medianSettlementTimeDays: z.ZodNumber;
        overdueInvoices: z.ZodNumber;
        overdueAmount: z.ZodNumber;
        invoicesByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
        invoicesByCustomer: z.ZodRecord<z.ZodString, z.ZodNumber>;
        settlementTimeDistribution: z.ZodArray<z.ZodObject<{
            range: z.ZodString;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            percentage: number;
            range: string;
            count: number;
        }, {
            percentage: number;
            range: string;
            count: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalInvoices: number;
        averageSettlementTimeDays: number;
        medianSettlementTimeDays: number;
        overdueInvoices: number;
        overdueAmount: number;
        invoicesByStatus: Record<string, number>;
        invoicesByCustomer: Record<string, number>;
        settlementTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }, {
        totalInvoices: number;
        averageSettlementTimeDays: number;
        medianSettlementTimeDays: number;
        overdueInvoices: number;
        overdueAmount: number;
        invoicesByStatus: Record<string, number>;
        invoicesByCustomer: Record<string, number>;
        settlementTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }>, z.ZodObject<{
        totalEntries: z.ZodNumber;
        approvedEntries: z.ZodNumber;
        rejectedEntries: z.ZodNumber;
        averageLeadTimeHours: z.ZodNumber;
        rejectionRate: z.ZodNumber;
        entriesByUser: z.ZodRecord<z.ZodString, z.ZodNumber>;
        entriesByProject: z.ZodRecord<z.ZodString, z.ZodNumber>;
        leadTimeDistribution: z.ZodArray<z.ZodObject<{
            range: z.ZodString;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            percentage: number;
            range: string;
            count: number;
        }, {
            percentage: number;
            range: string;
            count: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalEntries: number;
        approvedEntries: number;
        rejectedEntries: number;
        averageLeadTimeHours: number;
        rejectionRate: number;
        entriesByUser: Record<string, number>;
        entriesByProject: Record<string, number>;
        leadTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }, {
        totalEntries: number;
        approvedEntries: number;
        rejectedEntries: number;
        averageLeadTimeHours: number;
        rejectionRate: number;
        entriesByUser: Record<string, number>;
        entriesByProject: Record<string, number>;
        leadTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }>, z.ZodObject<{
        totalPayments: z.ZodNumber;
        totalAmount: z.ZodNumber;
        averageAmount: z.ZodNumber;
        paymentsByMethod: z.ZodRecord<z.ZodString, z.ZodNumber>;
        paymentsByMonth: z.ZodRecord<z.ZodString, z.ZodNumber>;
        paymentsByCustomer: z.ZodRecord<z.ZodString, z.ZodNumber>;
        amountDistribution: z.ZodArray<z.ZodObject<{
            range: z.ZodString;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            percentage: number;
            range: string;
            count: number;
        }, {
            percentage: number;
            range: string;
            count: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalAmount: number;
        totalPayments: number;
        averageAmount: number;
        paymentsByMethod: Record<string, number>;
        paymentsByMonth: Record<string, number>;
        paymentsByCustomer: Record<string, number>;
        amountDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }, {
        totalAmount: number;
        totalPayments: number;
        averageAmount: number;
        paymentsByMethod: Record<string, number>;
        paymentsByMonth: Record<string, number>;
        paymentsByCustomer: Record<string, number>;
        amountDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    }>]>;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reportType: string;
    filters: Record<string, any>;
    summary: {
        totalQuotes: number;
        minCycleTimeDays: number;
        maxCycleTimeDays: number;
        averageCycleTimeDays: number;
        medianCycleTimeDays: number;
        quotesByStatus: Record<string, number>;
        quotesByProject: Record<string, number>;
        cycleTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalInvoices: number;
        averageSettlementTimeDays: number;
        medianSettlementTimeDays: number;
        overdueInvoices: number;
        overdueAmount: number;
        invoicesByStatus: Record<string, number>;
        invoicesByCustomer: Record<string, number>;
        settlementTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalEntries: number;
        approvedEntries: number;
        rejectedEntries: number;
        averageLeadTimeHours: number;
        rejectionRate: number;
        entriesByUser: Record<string, number>;
        entriesByProject: Record<string, number>;
        leadTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalAmount: number;
        totalPayments: number;
        averageAmount: number;
        paymentsByMethod: Record<string, number>;
        paymentsByMonth: Record<string, number>;
        paymentsByCustomer: Record<string, number>;
        amountDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    };
    generatedAt: string;
}, {
    reportType: string;
    filters: Record<string, any>;
    summary: {
        totalQuotes: number;
        minCycleTimeDays: number;
        maxCycleTimeDays: number;
        averageCycleTimeDays: number;
        medianCycleTimeDays: number;
        quotesByStatus: Record<string, number>;
        quotesByProject: Record<string, number>;
        cycleTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalInvoices: number;
        averageSettlementTimeDays: number;
        medianSettlementTimeDays: number;
        overdueInvoices: number;
        overdueAmount: number;
        invoicesByStatus: Record<string, number>;
        invoicesByCustomer: Record<string, number>;
        settlementTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalEntries: number;
        approvedEntries: number;
        rejectedEntries: number;
        averageLeadTimeHours: number;
        rejectionRate: number;
        entriesByUser: Record<string, number>;
        entriesByProject: Record<string, number>;
        leadTimeDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    } | {
        totalAmount: number;
        totalPayments: number;
        averageAmount: number;
        paymentsByMethod: Record<string, number>;
        paymentsByMonth: Record<string, number>;
        paymentsByCustomer: Record<string, number>;
        amountDistribution: {
            percentage: number;
            range: string;
            count: number;
        }[];
    };
    generatedAt: string;
}>;
export declare const ExportJobStatusResponseSchema: z.ZodObject<{
    job: z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        userId: z.ZodString;
        reportType: z.ZodString;
        format: z.ZodString;
        status: z.ZodEnum<["pending", "processing", "completed", "failed", "cancelled"]>;
        filters: z.ZodRecord<z.ZodString, z.ZodAny>;
        fileName: z.ZodString;
        totalRows: z.ZodOptional<z.ZodNumber>;
        processedRows: z.ZodOptional<z.ZodNumber>;
        downloadUrl: z.ZodOptional<z.ZodString>;
        errorMessage: z.ZodOptional<z.ZodString>;
        startedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: "pending" | "failed" | "completed" | "cancelled" | "processing";
        userId: string;
        reportType: string;
        format: string;
        filters: Record<string, any>;
        fileName: string;
        startedAt?: string | undefined;
        totalRows?: number | undefined;
        processedRows?: number | undefined;
        downloadUrl?: string | undefined;
        errorMessage?: string | undefined;
        completedAt?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: "pending" | "failed" | "completed" | "cancelled" | "processing";
        userId: string;
        reportType: string;
        format: string;
        filters: Record<string, any>;
        fileName: string;
        startedAt?: string | undefined;
        totalRows?: number | undefined;
        processedRows?: number | undefined;
        downloadUrl?: string | undefined;
        errorMessage?: string | undefined;
        completedAt?: string | undefined;
    }>;
    progress: z.ZodObject<{
        percentage: z.ZodNumber;
        status: z.ZodString;
        estimatedTimeRemaining: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        status: string;
        estimatedTimeRemaining?: string | undefined;
    }, {
        percentage: number;
        status: string;
        estimatedTimeRemaining?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    progress: {
        percentage: number;
        status: string;
        estimatedTimeRemaining?: string | undefined;
    };
    job: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: "pending" | "failed" | "completed" | "cancelled" | "processing";
        userId: string;
        reportType: string;
        format: string;
        filters: Record<string, any>;
        fileName: string;
        startedAt?: string | undefined;
        totalRows?: number | undefined;
        processedRows?: number | undefined;
        downloadUrl?: string | undefined;
        errorMessage?: string | undefined;
        completedAt?: string | undefined;
    };
}, {
    progress: {
        percentage: number;
        status: string;
        estimatedTimeRemaining?: string | undefined;
    };
    job: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: "pending" | "failed" | "completed" | "cancelled" | "processing";
        userId: string;
        reportType: string;
        format: string;
        filters: Record<string, any>;
        fileName: string;
        startedAt?: string | undefined;
        totalRows?: number | undefined;
        processedRows?: number | undefined;
        downloadUrl?: string | undefined;
        errorMessage?: string | undefined;
        completedAt?: string | undefined;
    };
}>;
export declare const CreateExportJobResponseSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
    message: string;
    jobId: string;
}, {
    status: string;
    message: string;
    jobId: string;
}>;
export declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    statusCode: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    error: string;
    message: string;
    statusCode: number;
}, {
    error: string;
    message: string;
    statusCode: number;
}>;
//# sourceMappingURL=schemas.d.ts.map