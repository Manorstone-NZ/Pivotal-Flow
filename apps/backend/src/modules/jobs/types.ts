/**
 * Jobs module types
 * TypeScript interfaces for job-related data structures
 */

import type { Job } from '../../lib/schema.js';

import type { JobType, JobPriority } from './constants.js';

// Re-export types for external use
export type { JobType, JobPriority };

// Job request for creating new jobs
export interface CreateJobRequest {
  jobType: JobType;
  payload: Record<string, any>;
  priority?: JobPriority;
  maxRetries?: number;
  scheduledAt?: Date;
  totalSteps?: number;
}

// Job status response for frontend polling
export interface JobStatusResponse {
  job: Job;
  progress: number;
  estimatedTimeRemaining?: number;
  canCancel: boolean;
  canRetry: boolean;
}

// Job list response
export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Job processing context
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

// Job processor interface
export interface JobProcessor {
  jobType: JobType;
  process: (context: JobContext) => Promise<void>;
  validatePayload?: (payload: Record<string, any>) => boolean;
}

// Job queue interface
export interface JobQueue {
  enqueue: (request: CreateJobRequest, organizationId: string, userId: string) => Promise<string>;
  dequeue: (jobType?: JobType) => Promise<Job | null>;
  getStatus: (jobId: string, organizationId: string, userId: string) => Promise<JobStatusResponse>;
  cancel: (jobId: string, organizationId: string, userId: string) => Promise<void>;
  retry: (jobId: string, organizationId: string, userId: string) => Promise<void>;
  list: (organizationId: string, userId: string, page?: number, pageSize?: number) => Promise<JobListResponse>;
}

// Job metrics interface
export interface JobMetrics {
  recordJobCreated: (jobType: JobType, organizationId: string) => void;
  recordJobStarted: (jobType: JobType, organizationId: string) => void;
  recordJobCompleted: (jobType: JobType, organizationId: string, duration: number) => void;
  recordJobFailed: (jobType: JobType, organizationId: string, error: string) => void;
  recordJobRetried: (jobType: JobType, organizationId: string, retryCount: number) => void;
}
