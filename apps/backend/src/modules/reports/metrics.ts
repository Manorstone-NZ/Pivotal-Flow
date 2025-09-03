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
  private exportStartedTotal: Counter<string>;
  private exportCompletedTotal: Counter<string>;
  private exportFailedTotal: Counter<string>;
  private exportDurationMs: Histogram<string>;
  private reportGeneratedTotal: Counter<string>;

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
  }

  /**
   * Record export job started
   */
  recordExportStarted(reportType: string, format: string, organizationId: string): void {
    this.exportStartedTotal.inc({
      report_type: reportType,
      format,
      organization_id: organizationId
    });
  }

  /**
   * Record export job completed
   */
  recordExportCompleted(reportType: string, format: string, organizationId: string, durationMs: number): void {
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
  recordExportFailed(reportType: string, format: string, organizationId: string, errorType: string): void {
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
  recordReportGenerated(reportType: string, organizationId: string): void {
    this.reportGeneratedTotal.inc({
      report_type: reportType,
      organization_id: organizationId
    });
  }

  /**
   * Get metrics instance (singleton pattern)
   */
  static getInstance(): ReportingMetrics {
    if (!(globalThis as any).__reportingMetrics) {
      (globalThis as any).__reportingMetrics = new ReportingMetrics();
    }
    return (globalThis as any).__reportingMetrics;
  }
}
