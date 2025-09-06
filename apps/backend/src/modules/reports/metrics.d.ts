/**
 * Reporting metrics service
 * Prometheus metrics for export jobs and reporting operations
 */
/**
 * Prometheus metrics for reporting operations
 */
export declare class ReportingMetrics {
    private exportStartedTotal;
    private exportCompletedTotal;
    private exportFailedTotal;
    private exportDurationMs;
    private reportGeneratedTotal;
    private reportDurationMs;
    constructor();
    /**
     * Record export job started
     */
    recordExportStarted(reportType: string, format: string, organizationId: string): void;
    /**
     * Record export job completed
     */
    recordExportCompleted(reportType: string, format: string, organizationId: string, durationMs: number): void;
    /**
     * Record export job failed
     */
    recordExportFailed(reportType: string, format: string, organizationId: string, errorType: string): void;
    /**
     * Record report generated
     */
    recordReportGenerated(reportType: string, organizationId: string): void;
    /**
     * Record report duration
     */
    recordReportDuration(reportType: string, organizationId: string, durationMs: number): void;
    /**
     * Get metrics instance (singleton pattern)
     */
    static getInstance(): ReportingMetrics;
}
//# sourceMappingURL=metrics.d.ts.map