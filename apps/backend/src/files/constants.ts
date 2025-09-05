/**
 * File storage constants
 * Configuration and validation constants for file storage
 */

import type { MimeType } from './types.js';

// Allowed MIME types with file extensions
export const ALLOWED_MIME_TYPES: Record<MimeType, string[]> = {
  // PDFs
  'application/pdf': ['.pdf'],
  
  // Exports
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  
  // Images
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
} as const;

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  'application/pdf': 50 * 1024 * 1024, // 50 MB
  'text/csv': 100 * 1024 * 1024, // 100 MB
  'application/json': 50 * 1024 * 1024, // 50 MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 25 * 1024 * 1024, // 25 MB
  'application/vnd.ms-excel': 25 * 1024 * 1024, // 25 MB
  'image/png': 10 * 1024 * 1024, // 10 MB
  'image/jpeg': 10 * 1024 * 1024, // 10 MB
  'image/gif': 10 * 1024 * 1024, // 10 MB
  'image/svg+xml': 10 * 1024 * 1024, // 10 MB
  'application/msword': 5 * 1024 * 1024, // 5 MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 5 * 1024 * 1024, // 5 MB
} as const;

// Default expiration times
export const DEFAULT_EXPIRATION_TIMES = {
  exports: '15m', // 15 minutes
  pdfs: '1h', // 1 hour
  templates: '24h', // 24 hours
  assets: '7d', // 7 days
} as const;

// File retention periods in days
export const FILE_RETENTION_PERIODS = {
  exports: 30, // 30 days
  pdfs: 90, // 90 days
  templates: 365, // 1 year
  assets: -1, // Indefinite (-1)
} as const;

// Storage configuration
export const STORAGE_CONFIG = {
  // Local storage
  LOCAL_TEMP_DIR: '/tmp/pivotal-flow-files',
  LOCAL_MAX_FILES: 10000,
  LOCAL_MAX_SIZE: 10 * 1024 * 1024 * 1024, // 10 GB
  
  // Token configuration
  TOKEN_SECRET: process.env['FILE_TOKEN_SECRET'] || 'pivotal-flow-file-secret-dev',
  TOKEN_ALGORITHM: 'HS256',
  
  // Cleanup configuration
  CLEANUP_BATCH_SIZE: 100,
  CLEANUP_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Security
  MAX_FILENAME_LENGTH: 255,
  ALLOWED_FILENAME_CHARS: /^[a-zA-Z0-9._-]+$/,
  PATH_TRAVERSAL_PATTERNS: [/\.\./, /\/\//, /\\/],
} as const;

// Error messages
export const FILE_ERRORS = {
  INVALID_MIME_TYPE: 'Invalid MIME type',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILENAME: 'Invalid filename',
  PATH_TRAVERSAL: 'Path traversal not allowed',
  FILE_NOT_FOUND: 'File not found',
  TOKEN_EXPIRED: 'Access token expired',
  TOKEN_INVALID: 'Invalid access token',
  PERMISSION_DENIED: 'Permission denied',
  STORAGE_ERROR: 'Storage operation failed',
  CLEANUP_ERROR: 'File cleanup failed',
} as const;
