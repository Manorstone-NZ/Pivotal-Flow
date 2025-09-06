/**
 * Jobs module types
 * TypeScript interfaces for job-related data structures
 */
import type { Job } from '../../lib/schema.js';
import type { JobType, JobPriority } from './constants.js';
export type { JobType, JobPriority };
export interface CreateJobRequest {
    jobType: JobType;
    payload: Record<string, any>;
    priority?: JobPriority;
    maxRetries?: number;
    scheduledAt?: Date;
    totalSteps?: number;
}
export interface JobStatusResponse {
    job: Job;
    progress: number;
    estimatedTimeRemaining?: number;
    canCancel: boolean;
    canRetry: boolean;
}
export interface JobListResponse {
    jobs: Job[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface JobContext {
    jobId: string;
    organizationId: string;
    userId: string;
    jobType: JobType;
    payload: Record<string, any>;
    updateProgress: (progress: number, currentStep?: number) => Promise<void>;
    updateResult: (result: Record<string, any>) => Promise<void>;
    fail: (error: string) => Promise<void>;
}
export interface JobProcessor {
    jobType: JobType;
    process: (context: JobContext) => Promise<void>;
    validatePayload?: (payload: Record<string, any>) => boolean;
}
export interface JobQueue {
    enqueue: (request: CreateJobRequest, organizationId: string, userId: string) => Promise<string>;
    dequeue: (jobType?: JobType) => Promise<Job | null>;
    getStatus: (jobId: string, organizationId: string, userId: string) => Promise<JobStatusResponse>;
    cancel: (jobId: string, organizationId: string, userId: string) => Promise<void>;
    retry: (jobId: string, organizationId: string, userId: string) => Promise<void>;
    list: (organizationId: string, userId: string, page?: number, pageSize?: number) => Promise<JobListResponse>;
}
export interface JobMetrics {
    recordJobCreated: (jobType: JobType, organizationId: string) => void;
    recordJobStarted: (jobType: JobType, organizationId: string) => void;
    recordJobCompleted: (jobType: JobType, organizationId: string, duration: number) => void;
    recordJobFailed: (jobType: JobType, organizationId: string, error: string) => void;
    recordJobRetried: (jobType: JobType, organizationId: string, retryCount: number) => void;
}
//# sourceMappingURL=types.d.ts.map