/**
 * Reporting module constants
 * Governed reporting exports and compliance views
 */
export declare const EXPORT_JOB_STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
};
export type ExportJobStatus = typeof EXPORT_JOB_STATUS[keyof typeof EXPORT_JOB_STATUS];
export declare const REPORT_TYPES: {
    readonly QUOTE_CYCLE_TIME: "quote_cycle_time";
    readonly INVOICE_SETTLEMENT_TIME: "invoice_settlement_time";
    readonly TIME_APPROVALS: "time_approvals";
    readonly PAYMENTS_RECEIVED: "payments_received";
};
export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];
export declare const EXPORT_FORMATS: {
    readonly CSV: "csv";
    readonly JSON: "json";
};
export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];
export declare const REPORT_PERMISSIONS: {
    readonly VIEW_REPORTS: "reports.view_reports";
    readonly EXPORT_REPORTS: "reports.export_reports";
    readonly VIEW_COMPLIANCE: "reports.view_compliance";
};
export declare const REPORTING_METRICS: {
    readonly EXPORT_STARTED_TOTAL: "pivotal_export_started_total";
    readonly EXPORT_COMPLETED_TOTAL: "pivotal_export_completed_total";
    readonly EXPORT_DURATION_MS: "pivotal_export_duration_ms";
    readonly EXPORT_FAILED_TOTAL: "pivotal_export_failed_total";
    readonly REPORT_GENERATED_TOTAL: "pivotal_report_generated_total";
};
export declare const DEFAULT_PAGE_SIZE = 25;
export declare const MAX_PAGE_SIZE = 1000;
export declare const EXPORT_CONFIG: {
    readonly MAX_ROWS_PER_CHUNK: 1000;
    readonly CHUNK_DELAY_MS: 100;
    readonly JOB_TIMEOUT_MS: number;
    readonly CLEANUP_AFTER_DAYS: 7;
};
export declare const REPORT_CONFIG: {
    readonly QUOTE_CYCLE_TIME: {
        readonly DEFAULT_DAYS: 90;
        readonly MAX_DAYS: 365;
    };
    readonly INVOICE_SETTLEMENT_TIME: {
        readonly DEFAULT_DAYS: 90;
        readonly MAX_DAYS: 365;
    };
    readonly TIME_APPROVALS: {
        readonly DEFAULT_DAYS: 30;
        readonly MAX_DAYS: 90;
    };
    readonly PAYMENTS_RECEIVED: {
        readonly DEFAULT_MONTHS: 12;
        readonly MAX_MONTHS: 24;
    };
};
export declare const QUOTE_STATUSES_FOR_REPORTING: readonly ["draft", "sent", "accepted", "rejected", "expired"];
export declare const INVOICE_STATUSES_FOR_REPORTING: readonly ["draft", "sent", "part_paid", "paid", "overdue", "written_off"];
export declare const PAYMENT_STATUSES_FOR_REPORTING: readonly ["pending", "completed", "void", "failed"];
//# sourceMappingURL=constants.d.ts.map