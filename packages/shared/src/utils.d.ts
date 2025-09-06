/**
 * Generate a unique request ID
 */
export declare function generateRequestId(): string;
/**
 * Generate a hash for the given input string
 */
export declare function generateHash(input: string): string;
/**
 * Get current timestamp in ISO format
 */
export declare function getTimestamp(): string;
/**
 * Calculate uptime in seconds
 */
export declare function getUptime(startTime: number): number;
/**
 * Format bytes to human readable format
 */
export declare function formatBytes(bytes: number): string;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>;
/**
 * Check if value is a valid UUID
 */
export declare function isValidUuid(value: string): boolean;
/**
 * Sanitize string for safe logging
 */
export declare function sanitizeForLogging(value: string): string;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
//# sourceMappingURL=utils.d.ts.map