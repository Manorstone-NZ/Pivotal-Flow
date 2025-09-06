/**
 * Local storage adapter
 * File storage implementation using local file system
 */
import type { StorageAdapter, GenerateFileOptions, SignedUrlOptions, FileInfo, MimeType } from './types.js';
/**
 * Local storage adapter for file operations
 */
export declare class LocalStorageAdapter implements StorageAdapter {
    private baseDir;
    private tokenSecret;
    constructor(baseDir?: string, tokenSecret?: string);
    /**
     * Generate a file and store it locally
     */
    generateFile(options: GenerateFileOptions): Promise<string>;
    /**
     * Generate a signed URL for file access
     */
    getSignedUrl(fileId: string, options: SignedUrlOptions): Promise<string>;
    /**
     * Delete a file
     */
    deleteFile(fileId: string): Promise<void>;
    /**
     * Clean up expired files
     */
    cleanupExpiredFiles(): Promise<number>;
    /**
     * Get file information
     */
    getFileInfo(fileId: string): Promise<FileInfo | null>;
    /**
     * Validate a file access token
     */
    validateFile(fileId: string, token: string): Promise<boolean>;
    /**
     * Get file content for download
     */
    getFileContent(fileId: string): Promise<{
        content: Buffer;
        mimeType: MimeType;
        filename: string;
    }>;
    /**
     * Ensure directory exists
     */
    private ensureDirectoryExists;
    /**
     * Validate MIME type
     */
    private isValidMimeType;
    /**
     * Validate filename
     */
    private isValidFilename;
    /**
     * Parse expiration time string
     */
    private parseExpirationTime;
    /**
     * Generate signature for token
     */
    private generateSignature;
    /**
     * Store file metadata (stub implementation)
     */
    private storeFileMetadata;
    /**
     * Remove file metadata (stub implementation)
     */
    private removeFileMetadata;
    /**
     * Get all files (stub implementation)
     */
    private getAllFiles;
}
//# sourceMappingURL=local-storage.adapter.d.ts.map