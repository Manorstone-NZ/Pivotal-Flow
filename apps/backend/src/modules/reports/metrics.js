/**
 * Reporting metrics service
 * Prometheus metrics for export jobs and reporting operations
 */
import { Counter, Histogram } from 'prom-client';
import { REPORTING_METRICS } from './constants.js';
/**
 * Prometheus metrics for reporting operations
 */
export class ReportingMetrics {
    // Export job metrics
    exportStartedTotal;
    exportCompletedTotal;
    exportFailedTotal;
    exportDurationMs;
    reportGeneratedTotal;
    reportDurationMs;
    constructor() {
        // Initialize export job metrics
        this.exportStartedTotal = new Counter({
            name: REPORTING_METRICS.EXPORT_STARTED_TOTAL,
            help: 'Total number of export jobs started',
            labelNames: ['report_type', 'format', 'organization_id']
        });
        this.exportCompletedTotal = new Counter({
            name: REPORTING_METRICS.EXPORT_COMPLETED_TOTAL,
            help: 'Total number of export jobs completed successfully',
            labelNames: ['report_type', 'format', 'organization_id']
        });
        this.exportFailedTotal = new Counter({
            name: REPORTING_METRICS.EXPORT_FAILED_TOTAL,
            help: 'Total number of export jobs that failed',
            labelNames: ['report_type', 'format', 'organization_id', 'error_type']
        });
        this.exportDurationMs = new Histogram({
            name: REPORTING_METRICS.EXPORT_DURATION_MS,
            help: 'Duration of export jobs in milliseconds',
            labelNames: ['report_type', 'format', 'organization_id'],
            buckets: [1000, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 1800000] // 1s to 30m
        });
        this.reportGeneratedTotal = new Counter({
            name: REPORTING_METRICS.REPORT_GENERATED_TOTAL,
            help: 'Total number of reports generated',
            labelNames: ['report_type', 'organization_id']
        });
        this.reportDurationMs = new Histogram({
            name: 'pivotal_reports_duration_ms',
            help: 'Duration of report generation in milliseconds',
            labelNames: ['report_type', 'organization_id'],
            buckets: [100, 500, 1000, 2000, 5000, 10000, 30000, 60000] // 100ms to 1m
        });
    }
    /**
     * Record export job started
     */
    recordExportStarted(reportType, format, organizationId) {
        this.exportStartedTotal.inc({
            report_type: reportType,
            format,
            organization_id: organizationId
        });
    }
    /**
     * Record export job completed
     */
    recordExportCompleted(reportType, format, organizationId, durationMs) {
        this.exportCompletedTotal.inc({
            report_type: reportType,
            format,
            organization_id: organizationId
        });
        this.exportDurationMs.observe({
            report_type: reportType,
            format,
            organization_id: organizationId
        }, durationMs);
    }
    /**
     * Record export job failed
     */
    recordExportFailed(reportType, format, organizationId, errorType) {
        this.exportFailedTotal.inc({
            report_type: reportType,
            format,
            organization_id: organizationId,
            error_type: errorType
        });
    }
    /**
     * Record report generated
     */
    recordReportGenerated(reportType, organizationId) {
        this.reportGeneratedTotal.inc({
            report_type: reportType,
            organization_id: organizationId
        });
    }
    /**
     * Record report duration
     */
    recordReportDuration(reportType, organizationId, durationMs) {
        this.reportDurationMs.observe({
            report_type: reportType,
            organization_id: organizationId
        }, durationMs);
    }
    /**
     * Get metrics instance (singleton pattern)
     */
    static getInstance() {
        if (!globalThis.__reportingMetrics) {
            globalThis.__reportingMetrics = new ReportingMetrics();
        }
        return globalThis.__reportingMetrics;
    }
}
//# sourceMappingURL=metrics.js.map