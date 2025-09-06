/**
 * Reporting module Zod schemas
 * Validation schemas for API requests and responses
 */

import { z } from 'zod';

import { REPORT_TYPES, EXPORT_FORMATS, EXPORT_JOB_STATUS } from './constants.js';

// Base pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(1000).default(25),
});

// Date range schema
export const DateRangeSchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Base report filters schema
export const BaseReportFiltersSchema = DateRangeSchema.extend({
  organizationId: z.string().min(1),
});

// Quote cycle time filters
export const QuoteCycleTimeFiltersSchema = BaseReportFiltersSchema.extend({
  customerId: z.string().optional(),
  projectId: z.string().optional(),
  status: z.array(z.string()).optional(),
  minCycleTimeDays: z.number().int().min(0).optional(),
  maxCycleTimeDays: z.number().int().min(0).optional(),
});

// Invoice settlement time filters
export const InvoiceSettlementTimeFiltersSchema = BaseReportFiltersSchema.extend({
  customerId: z.string().optional(),
  projectId: z.string().optional(),
  status: z.array(z.string()).optional(),
  overdueOnly: z.boolean().optional(),
  minSettlementTimeDays: z.number().int().min(0).optional(),
  maxSettlementTimeDays: z.number().int().min(0).optional(),
});

// Time approvals filters
export const TimeApprovalsFiltersSchema = BaseReportFiltersSchema.extend({
  userId: z.string().optional(),
  projectId: z.string().optional(),
  status: z.array(z.string()).optional(),
  minLeadTimeHours: z.number().int().min(0).optional(),
  maxLeadTimeHours: z.number().int().min(0).optional(),
});

// Payments received filters
export const PaymentsReceivedFiltersSchema = BaseReportFiltersSchema.extend({
  customerId: z.string().optional(),
  method: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

// Export job request schema
export const ExportJobRequestSchema = z.object({
  reportType: z.enum([REPORT_TYPES.QUOTE_CYCLE_TIME, REPORT_TYPES.INVOICE_SETTLEMENT_TIME, REPORT_TYPES.TIME_APPROVALS, REPORT_TYPES.PAYMENTS_RECEIVED]),
  format: z.enum([EXPORT_FORMATS.CSV, EXPORT_FORMATS.JSON]),
  filters: z.union([
    QuoteCycleTimeFiltersSchema,
    InvoiceSettlementTimeFiltersSchema,
    TimeApprovalsFiltersSchema,
    PaymentsReceivedFiltersSchema,
  ]),
  fileName: z.string().optional(),
});

// Export job response schema
export const ExportJobSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  reportType: z.string(),
  format: z.string(),
  status: z.enum([EXPORT_JOB_STATUS.PENDING, EXPORT_JOB_STATUS.PROCESSING, EXPORT_JOB_STATUS.COMPLETED, EXPORT_JOB_STATUS.FAILED, EXPORT_JOB_STATUS.CANCELLED]),
  filters: z.record(z.any()),
  fileName: z.string(),
  totalRows: z.number().optional(),
  processedRows: z.number().optional(),
  downloadUrl: z.string().optional(),
  errorMessage: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Report summary schemas
export const QuoteCycleTimeSummarySchema = z.object({
  totalQuotes: z.number(),
  averageCycleTimeDays: z.number(),
  medianCycleTimeDays: z.number(),
  minCycleTimeDays: z.number(),
  maxCycleTimeDays: z.number(),
  quotesByStatus: z.record(z.number()),
  quotesByProject: z.record(z.number()),
  cycleTimeDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
});

export const InvoiceSettlementTimeSummarySchema = z.object({
  totalInvoices: z.number(),
  averageSettlementTimeDays: z.number(),
  medianSettlementTimeDays: z.number(),
  overdueInvoices: z.number(),
  overdueAmount: z.number(),
  invoicesByStatus: z.record(z.number()),
  invoicesByCustomer: z.record(z.number()),
  settlementTimeDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
});

export const TimeApprovalsSummarySchema = z.object({
  totalEntries: z.number(),
  approvedEntries: z.number(),
  rejectedEntries: z.number(),
  averageLeadTimeHours: z.number(),
  rejectionRate: z.number(),
  entriesByUser: z.record(z.number()),
  entriesByProject: z.record(z.number()),
  leadTimeDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
});

export const PaymentsReceivedSummarySchema = z.object({
  totalPayments: z.number(),
  totalAmount: z.number(),
  averageAmount: z.number(),
  paymentsByMethod: z.record(z.number()),
  paymentsByMonth: z.record(z.number()),
  paymentsByCustomer: z.record(z.number()),
  amountDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
});

// Report row schemas
export const QuoteCycleTimeRowSchema = z.object({
  quoteId: z.string(),
  quoteNumber: z.string(),
  customerName: z.string(),
  projectName: z.string().optional(),
  status: z.string(),
  createdAt: z.string(),
  sentAt: z.string().optional(),
  acceptedAt: z.string().optional(),
  cycleTimeDays: z.number(),
  totalAmount: z.number(),
  currency: z.string(),
});

export const InvoiceSettlementTimeRowSchema = z.object({
  invoiceId: z.string(),
  invoiceNumber: z.string(),
  customerName: z.string(),
  projectName: z.string().optional(),
  status: z.string(),
  issuedAt: z.string().optional(),
  dueAt: z.string().optional(),
  paidAt: z.string().optional(),
  settlementTimeDays: z.number(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  overdueAmount: z.number(),
  currency: z.string(),
});

export const TimeApprovalsRowSchema = z.object({
  entryId: z.string(),
  userId: z.string(),
  userName: z.string(),
  projectName: z.string(),
  status: z.string(),
  submittedAt: z.string(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  leadTimeHours: z.number(),
  hours: z.number(),
  description: z.string(),
});

export const PaymentsReceivedRowSchema = z.object({
  paymentId: z.string(),
  invoiceNumber: z.string(),
  customerName: z.string(),
  method: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  paidAt: z.string(),
  reference: z.string().optional(),
});

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Report summary response schema
export const ReportSummaryResponseSchema = z.object({
  reportType: z.string(),
  filters: z.record(z.any()),
  summary: z.union([
    QuoteCycleTimeSummarySchema,
    InvoiceSettlementTimeSummarySchema,
    TimeApprovalsSummarySchema,
    PaymentsReceivedSummarySchema,
  ]),
  generatedAt: z.string(),
});

// Export job status response schema
export const ExportJobStatusResponseSchema = z.object({
  job: ExportJobSchema,
  progress: z.object({
    percentage: z.number(),
    status: z.string(),
    estimatedTimeRemaining: z.string().optional(),
  }),
});

// API response schemas
export const CreateExportJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});
