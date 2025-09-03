/**
 * Export job service
 * Manages async export jobs with background processing
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getDatabase } from '../../lib/db.js';
import { exportJobs } from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../audit/logger.js';
import { ReportingMetrics } from './metrics.js';
import { 
  EXPORT_JOB_STATUS, 
  EXPORT_CONFIG,
  REPORT_TYPES 
} from './constants.js';
import type { 
  ExportJob, 
  ExportJobRequest,
  ExportJobStatusResponse 
} from './types.js';

/**
 * Export job service for managing async export operations
 */
export class ExportJobService {
  private db = getDatabase();
  private metrics = ReportingMetrics.getInstance();

  constructor(
    private organizationId: string,
    private userId: string,
    private permissionService: PermissionService,
    private auditLogger: AuditLogger
  ) {}

  /**
   * Create a new export job
   */
  async createExportJob(request: ExportJobRequest): Promise<string> {
    // Check permissions
    const canExport = await this.permissionService.hasPermission(
      this.userId,
      'reports.export_reports'
    );

    if (!canExport.hasPermission) {
      throw new Error('Permission denied: cannot export reports');
    }

    const jobId = randomUUID();
    const fileName = request.fileName || `${request.reportType}_${Date.now()}.${request.format}`;

    // Create export job record
    await this.db.insert(exportJobs).values({
      id: jobId,
      organizationId: this.organizationId,
      userId: this.userId,
      reportType: request.reportType,
      format: request.format,
      status: EXPORT_JOB_STATUS.PENDING,
      filters: request.filters,
      fileName,
      processedRows: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Record metrics
    this.metrics.recordExportStarted(request.reportType, request.format, this.organizationId);

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'export_job_created',
      resource: 'export_jobs',
      resourceId: jobId,
      details: {
        reportType: request.reportType,
        format: request.format,
        filters: request.filters,
      },
    });

    // Start background processing (non-blocking)
    this.processExportJob(jobId).catch(error => {
      console.error('Export job processing failed:', error);
      this.metrics.recordExportFailed(request.reportType, request.format, this.organizationId, 'processing_error');
    });

    return jobId;
  }

  /**
   * Get export job status
   */
  async getExportJobStatus(jobId: string): Promise<ExportJobStatusResponse> {
    const job = await this.db
      .select()
      .from(exportJobs)
      .where(
        and(
          eq(exportJobs.id, jobId),
          eq(exportJobs.organizationId, this.organizationId)
        )
      )
      .limit(1);

    if (job.length === 0) {
      throw new Error('Export job not found');
    }

    const exportJob = job[0];
    const progress = this.calculateProgress(exportJob);

    return {
      job: exportJob,
      progress,
    };
  }

  /**
   * List user's export jobs
   */
  async listExportJobs(page = 1, limit = 25): Promise<{ jobs: ExportJob[]; total: number }> {
    const offset = (page - 1) * limit;

    const [jobs, totalResult] = await Promise.all([
      this.db
        .select()
        .from(exportJobs)
        .where(
          and(
            eq(exportJobs.organizationId, this.organizationId),
            eq(exportJobs.userId, this.userId)
          )
        )
        .orderBy(desc(exportJobs.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(exportJobs)
        .where(
          and(
            eq(exportJobs.organizationId, this.organizationId),
            eq(exportJobs.userId, this.userId)
          )
        ),
    ]);

    return {
      jobs,
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   * Cancel an export job
   */
  async cancelExportJob(jobId: string): Promise<void> {
    const result = await this.db
      .update(exportJobs)
      .set({
        status: EXPORT_JOB_STATUS.CANCELLED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(exportJobs.id, jobId),
          eq(exportJobs.organizationId, this.organizationId),
          eq(exportJobs.userId, this.userId),
          eq(exportJobs.status, EXPORT_JOB_STATUS.PENDING)
        )
      );

    if (result.rowCount === 0) {
      throw new Error('Export job not found or cannot be cancelled');
    }

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'export_job_cancelled',
      resource: 'export_jobs',
      resourceId: jobId,
    });
  }

  /**
   * Process export job in background
   */
  private async processExportJob(jobId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to processing
      await this.db
        .update(exportJobs)
        .set({
          status: EXPORT_JOB_STATUS.PROCESSING,
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(exportJobs.id, jobId));

      // Get job details
      const job = await this.db
        .select()
        .from(exportJobs)
        .where(eq(exportJobs.id, jobId))
        .limit(1);

      if (job.length === 0) {
        throw new Error('Export job not found');
      }

      const exportJob = job[0];

      // Generate export data based on report type
      const exportData = await this.generateExportData(exportJob);

      // Create download URL (in production, this would be a file storage service)
      const downloadUrl = `/api/v1/reports/export/${jobId}/download`;

      // Update job as completed
      await this.db
        .update(exportJobs)
        .set({
          status: EXPORT_JOB_STATUS.COMPLETED,
          totalRows: exportData.length,
          processedRows: exportData.length,
          downloadUrl,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(exportJobs.id, jobId));

      const durationMs = Date.now() - startTime;

      // Record metrics
      this.metrics.recordExportCompleted(
        exportJob.reportType,
        exportJob.format,
        this.organizationId,
        durationMs
      );

      // Log audit event
      await this.auditLogger.logEvent({
        organizationId: this.organizationId,
        userId: this.userId,
        action: 'export_job_completed',
        resource: 'export_jobs',
        resourceId: jobId,
        details: {
          totalRows: exportData.length,
          durationMs,
        },
      });

    } catch (error) {
      // Update job as failed
      await this.db
        .update(exportJobs)
        .set({
          status: EXPORT_JOB_STATUS.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(exportJobs.id, jobId));

      const durationMs = Date.now() - startTime;

      // Record metrics
      this.metrics.recordExportFailed(
        'unknown',
        'unknown',
        this.organizationId,
        'processing_error'
      );

      // Log audit event
      await this.auditLogger.logEvent({
        organizationId: this.organizationId,
        userId: this.userId,
        action: 'export_job_failed',
        resource: 'export_jobs',
        resourceId: jobId,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          durationMs,
        },
      });

      throw error;
    }
  }

  /**
   * Generate export data based on report type
   */
  private async generateExportData(job: ExportJob): Promise<any[]> {
    // This is a placeholder implementation
    // In a real implementation, this would query the database based on filters
    // and return the appropriate data structure

    switch (job.reportType) {
      case REPORT_TYPES.QUOTE_CYCLE_TIME:
        return this.generateQuoteCycleTimeData(job.filters);
      case REPORT_TYPES.INVOICE_SETTLEMENT_TIME:
        return this.generateInvoiceSettlementTimeData(job.filters);
      case REPORT_TYPES.TIME_APPROVALS:
        return this.generateTimeApprovalsData(job.filters);
      case REPORT_TYPES.PAYMENTS_RECEIVED:
        return this.generatePaymentsReceivedData(job.filters);
      default:
        throw new Error(`Unknown report type: ${job.reportType}`);
    }
  }

  /**
   * Generate quote cycle time data
   */
  private async generateQuoteCycleTimeData(filters: any): Promise<any[]> {
    // Placeholder implementation
    // In production, this would query quotes table with proper filters
    return [
      {
        quoteId: 'q1',
        quoteNumber: 'Q-001',
        customerName: 'Acme Corp',
        projectName: 'Website Redesign',
        status: 'accepted',
        createdAt: '2024-01-01T00:00:00Z',
        sentAt: '2024-01-02T00:00:00Z',
        acceptedAt: '2024-01-05T00:00:00Z',
        cycleTimeDays: 4,
        totalAmount: 50000,
        currency: 'USD',
      },
    ];
  }

  /**
   * Generate invoice settlement time data
   */
  private async generateInvoiceSettlementTimeData(filters: any): Promise<any[]> {
    // Placeholder implementation
    return [
      {
        invoiceId: 'i1',
        invoiceNumber: 'INV-001',
        customerName: 'Acme Corp',
        projectName: 'Website Redesign',
        status: 'paid',
        issuedAt: '2024-01-01T00:00:00Z',
        dueAt: '2024-01-31T00:00:00Z',
        paidAt: '2024-01-15T00:00:00Z',
        settlementTimeDays: 14,
        totalAmount: 50000,
        paidAmount: 50000,
        overdueAmount: 0,
        currency: 'USD',
      },
    ];
  }

  /**
   * Generate time approvals data
   */
  private async generateTimeApprovalsData(filters: any): Promise<any[]> {
    // Placeholder implementation
    // Note: Time entries table doesn't exist yet
    return [
      {
        entryId: 'te1',
        userId: 'u1',
        userName: 'John Doe',
        projectName: 'Website Redesign',
        status: 'approved',
        submittedAt: '2024-01-01T09:00:00Z',
        approvedAt: '2024-01-02T10:00:00Z',
        leadTimeHours: 25,
        hours: 8,
        description: 'Frontend development',
      },
    ];
  }

  /**
   * Generate payments received data
   */
  private async generatePaymentsReceivedData(filters: any): Promise<any[]> {
    // Placeholder implementation
    return [
      {
        paymentId: 'p1',
        invoiceNumber: 'INV-001',
        customerName: 'Acme Corp',
        method: 'bank_transfer',
        status: 'completed',
        amount: 50000,
        currency: 'USD',
        paidAt: '2024-01-15T00:00:00Z',
        reference: 'REF123',
      },
    ];
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(job: ExportJob): { percentage: number; status: string; estimatedTimeRemaining?: string } {
    switch (job.status) {
      case EXPORT_JOB_STATUS.PENDING:
        return { percentage: 0, status: 'Queued for processing' };
      case EXPORT_JOB_STATUS.PROCESSING:
        const percentage = job.totalRows ? Math.round((job.processedRows || 0) / job.totalRows * 100) : 50;
        return { percentage, status: 'Processing' };
      case EXPORT_JOB_STATUS.COMPLETED:
        return { percentage: 100, status: 'Completed' };
      case EXPORT_JOB_STATUS.FAILED:
        return { percentage: 0, status: 'Failed' };
      case EXPORT_JOB_STATUS.CANCELLED:
        return { percentage: 0, status: 'Cancelled' };
      default:
        return { percentage: 0, status: 'Unknown' };
    }
  }
}
