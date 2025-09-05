/**
 * Jobs service
 * Manages background job processing with queue, status, and retry logic
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { jobs } from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { JOB_STATUS, JOB_PRIORITY, DEFAULT_RETRY_CONFIG } from './constants.js';
import type { 
  CreateJobRequest,
  JobStatusResponse,
  JobListResponse,
  JobContext,
  JobProcessor,
  JobMetrics
} from './types.js';

/**
 * Jobs service for managing background job processing
 */
export class JobsService {
  private db = getDatabase();
  private processors = new Map<string, JobProcessor>();
  private metrics: JobMetrics;

  constructor(
    private organizationId: string,
    private userId: string,
    private permissionService: PermissionService,
    private auditLogger: AuditLogger,
    metrics?: JobMetrics
  ) {
    this.metrics = metrics || this.createDefaultMetrics();
  }

  /**
   * Register a job processor
   */
  registerProcessor(processor: JobProcessor): void {
    this.processors.set(processor.jobType, processor);
  }

  /**
   * Create a new job
   */
  async createJob(request: CreateJobRequest): Promise<string> {
    // Check permissions
    const canCreateJob = await this.permissionService.hasPermission(
      this.userId,
      'jobs.create_jobs'
    );

    if (!canCreateJob.hasPermission) {
      throw new Error('Permission denied: cannot create jobs');
    }

    // Validate job type
    if (!this.processors.has(request.jobType)) {
      throw new Error(`No processor registered for job type: ${request.jobType}`);
    }

    const processor = this.processors.get(request.jobType)!;
    
    // Validate payload if processor has validation
    if (processor.validatePayload && !processor.validatePayload(request.payload)) {
      throw new Error('Invalid job payload');
    }

    const jobId = generateId();

    // Create job record
    await this.db.insert(jobs).values({
      id: jobId,
      organizationId: this.organizationId,
      userId: this.userId,
      jobType: request.jobType,
      status: JOB_STATUS.QUEUED,
      priority: request.priority || JOB_PRIORITY.NORMAL,
      retryCount: 0,
      maxRetries: request.maxRetries || DEFAULT_RETRY_CONFIG.MAX_RETRIES,
      payload: request.payload,
      progress: 0,
      totalSteps: request.totalSteps || null,
      currentStep: 0,
      scheduledAt: request.scheduledAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Record metrics
    this.metrics.recordJobCreated(request.jobType, this.organizationId);

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'job_created',
      entityType: 'job',
      entityId: jobId,
      organizationId: this.organizationId,
      userId: this.userId,
      newValues: {
        jobType: request.jobType,
        priority: request.priority,
        payload: request.payload,
      },
    });

    // Start processing if not scheduled
    if (!request.scheduledAt) {
      this.processJob(jobId).catch(error => {
        console.error('Job processing failed:', error);
        this.metrics.recordJobFailed(request.jobType, this.organizationId, 'processing_error');
      });
    }

    return jobId;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const job = await this.db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.organizationId, this.organizationId)
        )
      )
      .limit(1);

    if (job.length === 0) {
      throw new Error('Job not found');
    }

    const jobRecord = job[0];
    const progress = this.calculateProgress(jobRecord);
    const canCancel = jobRecord.status === JOB_STATUS.QUEUED || jobRecord.status === JOB_STATUS.RUNNING;
    const canRetry = jobRecord.status === JOB_STATUS.FAILED && jobRecord.retryCount < jobRecord.maxRetries;

    return {
      job: jobRecord,
      progress,
      canCancel,
      canRetry,
    };
  }

  /**
   * List user's jobs
   */
  async listJobs(page = 1, pageSize = 25, status?: string, jobType?: string): Promise<JobListResponse> {
    const offset = (page - 1) * pageSize;
    const whereConditions = [
      eq(jobs.organizationId, this.organizationId),
      eq(jobs.userId, this.userId),
    ];

    if (status) {
      whereConditions.push(eq(jobs.status, status));
    }

    if (jobType) {
      whereConditions.push(eq(jobs.jobType, jobType));
    }

    const [jobList, totalResult] = await Promise.all([
      this.db
        .select()
        .from(jobs)
        .where(and(...whereConditions))
        .orderBy(desc(jobs.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(jobs)
        .where(and(...whereConditions)),
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      jobs: jobList,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const result = await this.db
      .update(jobs)
      .set({
        status: JOB_STATUS.CANCELLED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.organizationId, this.organizationId),
          eq(jobs.userId, this.userId),
          eq(jobs.status, JOB_STATUS.QUEUED)
        )
      );

    if (result.rowCount === 0) {
      throw new Error('Job not found or cannot be cancelled');
    }

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'job_cancelled',
      entityType: 'job',
      entityId: jobId,
      organizationId: this.organizationId,
      userId: this.userId,
    });
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<void> {
    const job = await this.db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.organizationId, this.organizationId),
          eq(jobs.userId, this.userId),
          eq(jobs.status, JOB_STATUS.FAILED)
        )
      )
      .limit(1);

    if (job.length === 0) {
      throw new Error('Job not found or cannot be retried');
    }

    const jobRecord = job[0];

    if (jobRecord.retryCount >= jobRecord.maxRetries) {
      throw new Error('Job has exceeded maximum retry attempts');
    }

    // Update job for retry
    await this.db
      .update(jobs)
      .set({
        status: JOB_STATUS.QUEUED,
        retryCount: jobRecord.retryCount + 1,
        errorMessage: null,
        progress: 0,
        currentStep: 0,
        startedAt: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // Record metrics
    this.metrics.recordJobRetried(jobRecord.jobType, this.organizationId, jobRecord.retryCount + 1);

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'job_retried',
      entityType: 'job',
      entityId: jobId,
      organizationId: this.organizationId,
      userId: this.userId,
      newValues: {
        retryCount: jobRecord.retryCount + 1,
      },
    });

    // Start processing
    this.processJob(jobId).catch(error => {
      console.error('Job retry processing failed:', error);
      this.metrics.recordJobFailed(jobRecord.jobType, this.organizationId, 'retry_processing_error');
    });
  }

  /**
   * Process a job in background
   */
  private async processJob(jobId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Get job details
      const job = await this.db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);

      if (job.length === 0) {
        throw new Error('Job not found');
      }

      const jobRecord = job[0];

      // Check if job is still queued
      if (jobRecord.status !== JOB_STATUS.QUEUED) {
        return;
      }

      // Update status to running
      await this.db
        .update(jobs)
        .set({
          status: JOB_STATUS.RUNNING,
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      // Record metrics
      this.metrics.recordJobStarted(jobRecord.jobType, this.organizationId);

      // Get processor
      const processor = this.processors.get(jobRecord.jobType);
      if (!processor) {
        throw new Error(`No processor found for job type: ${jobRecord.jobType}`);
      }

      // Create job context
      const context: JobContext = {
        jobId: jobRecord.id,
        organizationId: jobRecord.organizationId,
        userId: jobRecord.userId,
        jobType: jobRecord.jobType,
        payload: jobRecord.payload,
        updateProgress: async (progress: number, currentStep?: number) => {
          await this.updateJobProgress(jobId, progress, currentStep);
        },
        updateResult: async (result: Record<string, any>) => {
          await this.updateJobResult(jobId, result);
        },
        fail: async (error: string) => {
          await this.failJob(jobId, error);
        },
      };

      // Process the job
      await processor.process(context);

      // Mark as completed
      const duration = Date.now() - startTime;
      await this.db
        .update(jobs)
        .set({
          status: JOB_STATUS.SUCCEEDED,
          progress: 100,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));

      // Record metrics
      this.metrics.recordJobCompleted(jobRecord.jobType, this.organizationId, duration);

    } catch (error) {
      console.error('Job processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.failJob(jobId, errorMessage);
      
      const job = await this.db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);

      if (job.length > 0) {
        this.metrics.recordJobFailed(job[0].jobType, this.organizationId, errorMessage);
      }
    }
  }

  /**
   * Update job progress
   */
  private async updateJobProgress(jobId: string, progress: number, currentStep?: number): Promise<void> {
    const updateData: any = {
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: new Date(),
    };

    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    await this.db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId));
  }

  /**
   * Update job result
   */
  private async updateJobResult(jobId: string, result: Record<string, any>): Promise<void> {
    await this.db
      .update(jobs)
      .set({
        result,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  /**
   * Fail a job
   */
  private async failJob(jobId: string, errorMessage: string): Promise<void> {
    await this.db
      .update(jobs)
      .set({
        status: JOB_STATUS.FAILED,
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  /**
   * Calculate job progress
   */
  private calculateProgress(job: any): number {
    if (job.totalSteps && job.totalSteps > 0) {
      return Math.round((job.currentStep / job.totalSteps) * 100);
    }
    return job.progress || 0;
  }

  /**
   * Create default metrics implementation
   */
  private createDefaultMetrics(): JobMetrics {
    return {
      recordJobCreated: () => {},
      recordJobStarted: () => {},
      recordJobCompleted: () => {},
      recordJobFailed: () => {},
      recordJobRetried: () => {},
    };
  }
}
