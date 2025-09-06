/**
 * File storage constants
 * Configuration and validation constants for file storage
 */
import type { MimeType } from './types.js';
export declare const ALLOWED_MIME_TYPES: Record<MimeType, string[]>;
export declare const FILE_SIZE_LIMITS: {
    readonly 'application/pdf': number;
    readonly 'text/csv': number;
    readonly 'application/json': number;
    readonly 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': number;
    readonly 'application/vnd.ms-excel': number;
    readonly 'image/png': number;
    readonly 'image/jpeg': number;
    readonly 'image/gif': number;
    readonly 'image/svg+xml': number;
    readonly 'application/msword': number;
    readonly 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': number;
};
export declare const DEFAULT_EXPIRATION_TIMES: {
    readonly exports: "15m";
    readonly pdfs: "1h";
    readonly templates: "24h";
    readonly assets: "7d";
};
export declare const FILE_RETENTION_PERIODS: {
    readonly exports: 30;
    readonly pdfs: 90;
    readonly templates: 365;
    readonly assets: -1;
};
export declare const STORAGE_CONFIG: {
    readonly LOCAL_TEMP_DIR: "/tmp/pivotal-flow-files";
    readonly LOCAL_MAX_FILES: 10000;
    readonly LOCAL_MAX_SIZE: number;
    readonly TOKEN_SECRET: string;
    readonly TOKEN_ALGORITHM: "HS256";
    readonly CLEANUP_BATCH_SIZE: 100;
    readonly CLEANUP_INTERVAL_MS: number;
    readonly MAX_FILENAME_LENGTH: 255;
    readonly ALLOWED_FILENAME_CHARS: RegExp;
    readonly PATH_TRAVERSAL_PATTERNS: readonly [RegExp, RegExp, RegExp];
};
export declare const FILE_ERRORS: {
    readonly INVALID_MIME_TYPE: "Invalid MIME type";
    readonly FILE_TOO_LARGE: "File size exceeds limit";
    readonly INVALID_FILENAME: "Invalid filename";
    readonly PATH_TRAVERSAL: "Path traversal not allowed";
    readonly FILE_NOT_FOUND: "File not found";
    readonly TOKEN_EXPIRED: "Access token expired";
    readonly TOKEN_INVALID: "Invalid access token";
    readonly PERMISSION_DENIED: "Permission denied";
    readonly STORAGE_ERROR: "Storage operation failed";
    readonly CLEANUP_ERROR: "File cleanup failed";
};
//# sourceMappingURL=constants.d.ts.map