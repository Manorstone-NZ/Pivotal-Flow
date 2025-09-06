/**
 * File service
 * High-level service for file operations using storage adapters
 */
import type { AuditLogger } from '../modules/audit/logger.js';
import type { PermissionService } from '../modules/permissions/service.js';
import type { StorageAdapter, GenerateFileOptions, FileInfo, FileType } from './types.js';
/**
 * File service for managing file operations
 */
export declare class FileService {
    private organizationId;
    private userId;
    private permissionService;
    private auditLogger;
    private storageAdapter;
    constructor(organizationId: string, userId: string, permissionService: PermissionService, auditLogger: AuditLogger, storageAdapter?: StorageAdapter);
    /**
     * Generate a file
     */
    generateFile(options: GenerateFileOptions): Promise<string>;
    /**
     * Get a signed URL for file access
     */
    getSignedUrl(fileId: string, fileType?: FileType): Promise<string>;
    /**
     * Download a file using a signed token
     */
    downloadFile(fileId: string, token: string): Promise<{
        content: Buffer;
        mimeType: string;
        filename: string;
    }>;
    /**
     * Delete a file
     */
    deleteFile(fileId: string): Promise<void>;
    /**
     * Get file information
     */
    getFileInfo(fileId: string): Promise<FileInfo>;
    /**
     * Clean up expired files
     */
    cleanupExpiredFiles(): Promise<number>;
    /**
     * Generate a PDF file
     */
    generatePdf(content: string, description: string): Promise<string>;
    /**
     * Generate an export file
     */
    generateExport(content: string, mimeType: 'text/csv' | 'application/json', description: string): Promise<string>;
}
//# sourceMappingURL=service.d.ts.map