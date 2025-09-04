/**
 * Jobs module constants
 * Defines job types, statuses, and configuration
 */

// Job statuses
export const JOB_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying',
} as const;

// Job types
export const JOB_TYPES = {
  EXPORT_REPORT: 'export_report',
  DATA_PROCESSING: 'data_processing',
  NOTIFICATION: 'notification',
  CLEANUP: 'cleanup',
  SYNC: 'sync',
} as const;

// Job priorities
export const JOB_PRIORITY = {
  LOW: 0,
  NORMAL: 5,
  HIGH: 10,
  URGENT: 15,
} as const;

// Default retry configuration
export const DEFAULT_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000, // 5 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

// Job processing configuration
export const JOB_CONFIG = {
  BATCH_SIZE: 100,
  MAX_CONCURRENT_JOBS: 5,
  JOB_TIMEOUT_MS: 300000, // 5 minutes
  CLEANUP_DAYS: 30, // Keep completed jobs for 30 days
} as const;

// Type exports
export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];
export type JobPriority = typeof JOB_PRIORITY[keyof typeof JOB_PRIORITY];
