/**
 * Jobs module schemas
 * Zod validation schemas for job-related requests and responses
 */

import { z } from 'zod';

import { JOB_TYPES, JOB_PRIORITY } from './constants.js';

// Create job request schema
export const CreateJobRequestSchema = z.object({
  jobType: z.enum([
    JOB_TYPES.EXPORT_REPORT,
    JOB_TYPES.DATA_PROCESSING,
    JOB_TYPES.NOTIFICATION,
    JOB_TYPES.CLEANUP,
    JOB_TYPES.SYNC,
  ]),
  payload: z.record(z.any()).default({}),
  priority: z.number().min(0).max(15).default(JOB_PRIORITY.NORMAL),
  maxRetries: z.number().min(0).max(10).default(3),
  scheduledAt: z.date().optional(),
  totalSteps: z.number().min(1).optional(),
});

// Job status response schema
export const JobStatusResponseSchema = z.object({
  job: z.object({
    id: z.string(),
    organizationId: z.string(),
    userId: z.string(),
    jobType: z.string(),
    status: z.string(),
    priority: z.number(),
    retryCount: z.number(),
    maxRetries: z.number(),
    payload: z.record(z.any()),
    result: z.record(z.any()).nullable(),
    errorMessage: z.string().nullable(),
    progress: z.number(),
    totalSteps: z.number().nullable(),
    currentStep: z.number(),
    startedAt: z.date().nullable(),
    completedAt: z.date().nullable(),
    scheduledAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  progress: z.number(),
  estimatedTimeRemaining: z.number().optional(),
  canCancel: z.boolean(),
  canRetry: z.boolean(),
});

// Job list response schema
export const JobListResponseSchema = z.object({
  jobs: z.array(z.object({
    id: z.string(),
    organizationId: z.string(),
    userId: z.string(),
    jobType: z.string(),
    status: z.string(),
    priority: z.number(),
    retryCount: z.number(),
    maxRetries: z.number(),
    payload: z.record(z.any()),
    result: z.record(z.any()).nullable(),
    errorMessage: z.string().nullable(),
    progress: z.number(),
    totalSteps: z.number().nullable(),
    currentStep: z.number(),
    startedAt: z.date().nullable(),
    completedAt: z.date().nullable(),
    scheduledAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// Job query parameters schema
export const JobQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  status: z.string().optional(),
  jobType: z.string().optional(),
});

// Type exports
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
export type JobListResponse = z.infer<typeof JobListResponseSchema>;
export type JobQuery = z.infer<typeof JobQuerySchema>;
