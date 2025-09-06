// Utility functions
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
/**
 * Generate a unique request ID
 */
export function generateRequestId() {
    return uuidv4();
}
/**
 * Generate a hash for the given input string
 */
export function generateHash(input) {
    return createHash('sha256').update(input).digest('hex');
}
/**
 * Get current timestamp in ISO format
 */
export function getTimestamp() {
    return new Date().toISOString();
}
/**
 * Calculate uptime in seconds
 */
export function getUptime(startTime) {
    return Math.floor((Date.now() - startTime) / 1000);
}
/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Check if value is a valid UUID
 */
export function isValidUuid(value) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Sanitize string for safe logging
 */
export function sanitizeForLogging(value) {
    return value
        .replace(/password["']?\s*[:=]\s*["']?[^"',}\s]+/gi, 'password=***')
        .replace(/token["']?\s*[:=]\s*["']?[^"',}\s]+/gi, 'token=***')
        .replace(/secret["']?\s*[:=]\s*["']?[^"',}\s]+/gi, 'secret=***');
}
/**
 * Deep clone an object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
//# sourceMappingURL=utils.js.map