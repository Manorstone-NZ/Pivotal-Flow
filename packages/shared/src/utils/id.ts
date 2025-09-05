/**
 * ID generation utilities
 */

import { randomUUID } from 'crypto';

/**
 * Generate a unique ID using crypto.randomUUID
 * This replaces the old Prisma generateId method
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Generate a unique ID with a custom prefix
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

/**
 * Generate a short ID (first 8 characters of UUID)
 */
export function generateShortId(): string {
  return randomUUID().split('-')[0];
}

/**
 * Generate a request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${randomUUID()}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `sess_${randomUUID()}`;
}

/**
 * Generate a job ID
 */
export function generateJobId(): string {
  return `job_${randomUUID()}`;
}

/**
 * Generate a file ID
 */
export function generateFileId(): string {
  return `file_${randomUUID()}`;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Generate a hash from a string
 */
export function generateHash(input: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}
