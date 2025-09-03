/**
 * Reporting module constants
 * Governed reporting exports and compliance views
 */

// Export job statuses
export const EXPORT_JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export type ExportJobStatus = typeof EXPORT_JOB_STATUS[keyof typeof EXPORT_JOB_STATUS];

// Report types
export const REPORT_TYPES = {
  QUOTE_CYCLE_TIME: 'quote_cycle_time',
  INVOICE_SETTLEMENT_TIME: 'invoice_settlement_time',
  TIME_APPROVALS: 'time_approvals',
  PAYMENTS_RECEIVED: 'payments_received'
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json'
} as const;

export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];

// Report permissions
export const REPORT_PERMISSIONS = {
  VIEW_REPORTS: 'reports.view_reports',
  EXPORT_REPORTS: 'reports.export_reports',
  VIEW_COMPLIANCE: 'reports.view_compliance'
} as const;

// Metrics names (for Prometheus)
export const REPORTING_METRICS = {
  EXPORT_STARTED_TOTAL: 'pivotal_export_started_total',
  EXPORT_COMPLETED_TOTAL: 'pivotal_export_completed_total',
  EXPORT_DURATION_MS: 'pivotal_export_duration_ms',
  EXPORT_FAILED_TOTAL: 'pivotal_export_failed_total',
  REPORT_GENERATED_TOTAL: 'pivotal_report_generated_total'
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 1000;

// Export job configuration
export const EXPORT_CONFIG = {
  MAX_ROWS_PER_CHUNK: 1000,
  CHUNK_DELAY_MS: 100, // Backpressure control
  JOB_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  CLEANUP_AFTER_DAYS: 7
} as const;

// Report-specific configurations
export const REPORT_CONFIG = {
  QUOTE_CYCLE_TIME: {
    DEFAULT_DAYS: 90,
    MAX_DAYS: 365
  },
  INVOICE_SETTLEMENT_TIME: {
    DEFAULT_DAYS: 90,
    MAX_DAYS: 365
  },
  TIME_APPROVALS: {
    DEFAULT_DAYS: 30,
    MAX_DAYS: 90
  },
  PAYMENTS_RECEIVED: {
    DEFAULT_MONTHS: 12,
    MAX_MONTHS: 24
  }
} as const;

// Status filters for reports
export const QUOTE_STATUSES_FOR_REPORTING = [
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired'
] as const;

export const INVOICE_STATUSES_FOR_REPORTING = [
  'draft',
  'sent',
  'part_paid',
  'paid',
  'overdue',
  'written_off'
] as const;

export const PAYMENT_STATUSES_FOR_REPORTING = [
  'pending',
  'completed',
  'void',
  'failed'
] as const;
