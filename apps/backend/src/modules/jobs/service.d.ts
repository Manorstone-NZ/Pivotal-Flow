/**
 * Jobs service
 * Manages background job processing with queue, status, and retry logic
 */
import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import type { PermissionService } from '../permissions/service.js';
import type { CreateJobRequest, JobStatusResponse, JobListResponse, JobProcessor, JobMetrics } from './types.js';
/**
 * Jobs service for managing background job processing
 */
export declare class JobsService {
    private organizationId;
    private userId;
    private permissionService;
    private auditLogger;
    private db;
    private processors;
    private metrics;
    constructor(organizationId: string, userId: string, permissionService: PermissionService, auditLogger: AuditLogger, metrics?: JobMetrics);
    /**
     * Register a job processor
     */
    registerProcessor(processor: JobProcessor): void;
    /**
     * Create a new job
     */
    createJob(request: CreateJobRequest): Promise<string>;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): Promise<JobStatusResponse>;
    /**
     * List user's jobs
     */
    listJobs(page?: number, pageSize?: number, status?: string, jobType?: string): Promise<JobListResponse>;
    /**
     * Cancel a job
     */
    cancelJob(jobId: string): Promise<void>;
    /**
     * Retry a failed job
     */
    retryJob(jobId: string): Promise<void>;
    /**
     * Process a job in background
     */
    private processJob;
    /**
     * Update job progress
     */
    private updateJobProgress;
    /**
     * Update job result
     */
    private updateJobResult;
    /**
     * Fail a job
     */
    private failJob;
    /**
     * Calculate job progress
     */
    private calculateProgress;
    /**
     * Create default metrics implementation
     */
    private createDefaultMetrics;
}
//# sourceMappingURL=service.d.ts.map