/**
 * Jobs module constants
 * Defines job types, statuses, and configuration
 */
export declare const JOB_STATUS: {
    readonly QUEUED: "queued";
    readonly RUNNING: "running";
    readonly SUCCEEDED: "succeeded";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
    readonly RETRYING: "retrying";
};
export declare const JOB_TYPES: {
    readonly EXPORT_REPORT: "export_report";
    readonly DATA_PROCESSING: "data_processing";
    readonly NOTIFICATION: "notification";
    readonly CLEANUP: "cleanup";
    readonly SYNC: "sync";
};
export declare const JOB_PRIORITY: {
    readonly LOW: 0;
    readonly NORMAL: 5;
    readonly HIGH: 10;
    readonly URGENT: 15;
};
export declare const DEFAULT_RETRY_CONFIG: {
    readonly MAX_RETRIES: 3;
    readonly RETRY_DELAY_MS: 5000;
    readonly BACKOFF_MULTIPLIER: 2;
};
export declare const JOB_CONFIG: {
    readonly BATCH_SIZE: 100;
    readonly MAX_CONCURRENT_JOBS: 5;
    readonly JOB_TIMEOUT_MS: 300000;
    readonly CLEANUP_DAYS: 30;
};
export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];
export type JobPriority = typeof JOB_PRIORITY[keyof typeof JOB_PRIORITY];
//# sourceMappingURL=constants.d.ts.map