/**
 * Export job service
 * Manages async export jobs with background processing
 */
import type { AuditLogger } from '../../lib/audit/logger.js';
import type { PermissionService } from '../permissions/service.js';
import type { ExportJob, ExportJobRequest, ExportJobStatusResponse } from './types.js';
/**
 * Export job service for managing async export operations
 */
export declare class ExportJobService {
    private organizationId;
    private userId;
    private permissionService;
    private auditLogger;
    private db;
    private metrics;
    constructor(organizationId: string, userId: string, permissionService: PermissionService, auditLogger: AuditLogger);
    /**
     * Create a new export job
     */
    createExportJob(request: ExportJobRequest): Promise<string>;
    /**
     * Get export job status
     */
    getExportJobStatus(jobId: string): Promise<ExportJobStatusResponse>;
    /**
     * List user's export jobs
     */
    listExportJobs(page?: number, limit?: number): Promise<{
        jobs: ExportJob[];
        total: number;
    }>;
    /**
     * Cancel an export job
     */
    cancelExportJob(jobId: string): Promise<void>;
    /**
     * Process export job in background
     */
    private processExportJob;
    /**
     * Generate export data based on report type
     */
    private generateExportData;
    /**
     * Generate quote cycle time data
     */
    private generateQuoteCycleTimeData;
    /**
     * Generate invoice settlement time data
     */
    private generateInvoiceSettlementTimeData;
    /**
     * Generate time approvals data
     */
    private generateTimeApprovalsData;
    /**
     * Generate payments received data
     */
    private generatePaymentsReceivedData;
    /**
     * Calculate progress percentage
     */
    private calculateProgress;
}
//# sourceMappingURL=export-job.service.d.ts.map