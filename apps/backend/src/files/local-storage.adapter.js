/**
 * Local storage adapter
 * File storage implementation using local file system
 */
import { createHmac } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { generateId } from '@pivotal-flow/shared';
import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS, STORAGE_CONFIG, FILE_ERRORS, FILE_RETENTION_PERIODS } from './constants.js';
/**
 * Local storage adapter for file operations
 */
export class LocalStorageAdapter {
    baseDir;
    tokenSecret;
    constructor(baseDir, tokenSecret) {
        this.baseDir = baseDir || STORAGE_CONFIG.LOCAL_TEMP_DIR;
        this.tokenSecret = tokenSecret || STORAGE_CONFIG.TOKEN_SECRET;
        this.ensureDirectoryExists();
    }
    /**
     * Generate a file and store it locally
     */
    async generateFile(options) {
        const { organizationId, fileType, mimeType, content, description, userId } = options;
        // Validate MIME type
        if (!this.isValidMimeType(mimeType)) {
            throw new Error(FILE_ERRORS.INVALID_MIME_TYPE);
        }
        // Validate content size
        const contentSize = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf8');
        if (contentSize > FILE_SIZE_LIMITS[mimeType]) {
            throw new Error(FILE_ERRORS.FILE_TOO_LARGE);
        }
        // Validate description
        if (!this.isValidFilename(description)) {
            throw new Error(FILE_ERRORS.INVALID_FILENAME);
        }
        // Generate file ID and path
        const fileId = generateId();
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const extension = ALLOWED_MIME_TYPES[mimeType][0];
        const filePath = path.join(this.baseDir, organizationId, fileType, String(year), month, `${fileId}_${description}${extension}`);
        // Ensure directory exists
        await this.ensureDirectoryExists(path.dirname(filePath));
        // Write file
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
        await fs.writeFile(filePath, buffer);
        // Store file metadata
        const fileInfo = {
            id: fileId,
            organizationId,
            fileType,
            mimeType,
            size: contentSize,
            description,
            path: filePath,
            createdAt: now,
            ...(userId ? { userId } : {}),
        };
        // Store metadata (in a real implementation, this would be in a database)
        await this.storeFileMetadata(fileInfo);
        return fileId;
    }
    /**
     * Generate a signed URL for file access
     */
    async getSignedUrl(fileId, options) {
        const { expiresIn, userId, organizationId } = options;
        // Get file info
        const fileInfo = await this.getFileInfo(fileId);
        if (!fileInfo) {
            throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
        }
        // Check organization access
        if (organizationId && fileInfo.organizationId !== organizationId) {
            throw new Error(FILE_ERRORS.PERMISSION_DENIED);
        }
        // Check if file exists
        try {
            await fs.access(fileInfo.path);
        }
        catch {
            throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
        }
        // Generate expiration time
        const expiresAt = this.parseExpirationTime(expiresIn);
        const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);
        // Generate signature
        const signature = this.generateSignature(fileId, expiresTimestamp, userId);
        // Create token
        const token = `${fileId}.${expiresTimestamp}.${signature}`;
        // Return signed URL
        return `/v1/files/${fileId}/download?token=${encodeURIComponent(token)}`;
    }
    /**
     * Delete a file
     */
    async deleteFile(fileId) {
        const fileInfo = await this.getFileInfo(fileId);
        if (!fileInfo) {
            throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
        }
        try {
            await fs.unlink(fileInfo.path);
            await this.removeFileMetadata(fileId);
        }
        catch (error) {
            throw new Error(FILE_ERRORS.STORAGE_ERROR);
        }
    }
    /**
     * Clean up expired files
     */
    async cleanupExpiredFiles() {
        let deletedCount = 0;
        const now = new Date();
        try {
            // Get all files in storage
            const files = await this.getAllFiles();
            for (const fileInfo of files) {
                const retentionPeriod = FILE_RETENTION_PERIODS[fileInfo.fileType];
                // Skip indefinite retention
                if (retentionPeriod === -1)
                    continue;
                const expirationDate = new Date(fileInfo.createdAt);
                expirationDate.setDate(expirationDate.getDate() + retentionPeriod);
                if (now > expirationDate) {
                    try {
                        await this.deleteFile(fileInfo.id);
                        deletedCount++;
                    }
                    catch (error) {
                        console.error(`Failed to delete expired file ${fileInfo.id}:`, error);
                    }
                }
            }
        }
        catch (error) {
            throw new Error(FILE_ERRORS.CLEANUP_ERROR);
        }
        return deletedCount;
    }
    /**
     * Get file information
     */
    async getFileInfo(fileId) {
        // In a real implementation, this would query a database
        // For now, we'll scan the file system
        const files = await this.getAllFiles();
        return files.find(f => f.id === fileId) || null;
    }
    /**
     * Validate a file access token
     */
    async validateFile(fileId, token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return false;
            }
            const [tokenFileId, expiresTimestamp, signature] = parts;
            // Check file ID match
            if (tokenFileId !== fileId || !expiresTimestamp || !signature) {
                return false;
            }
            // Check expiration
            const expiresAt = new Date(parseInt(expiresTimestamp) * 1000);
            if (new Date() > expiresAt) {
                return false;
            }
            // Verify signature
            const expectedSignature = this.generateSignature(fileId, parseInt(expiresTimestamp));
            return signature === expectedSignature;
        }
        catch {
            return false;
        }
    }
    /**
     * Get file content for download
     */
    async getFileContent(fileId) {
        const fileInfo = await this.getFileInfo(fileId);
        if (!fileInfo) {
            throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
        }
        try {
            const content = await fs.readFile(fileInfo.path);
            const filename = path.basename(fileInfo.path);
            return {
                content,
                mimeType: fileInfo.mimeType,
                filename,
            };
        }
        catch {
            throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
        }
    }
    /**
     * Ensure directory exists
     */
    async ensureDirectoryExists(dirPath) {
        const targetDir = dirPath || this.baseDir;
        try {
            await fs.access(targetDir);
        }
        catch {
            await fs.mkdir(targetDir, { recursive: true });
        }
    }
    /**
     * Validate MIME type
     */
    isValidMimeType(mimeType) {
        return mimeType in ALLOWED_MIME_TYPES;
    }
    /**
     * Validate filename
     */
    isValidFilename(filename) {
        if (filename.length > STORAGE_CONFIG.MAX_FILENAME_LENGTH) {
            return false;
        }
        if (!STORAGE_CONFIG.ALLOWED_FILENAME_CHARS.test(filename)) {
            return false;
        }
        // Check for path traversal
        for (const pattern of STORAGE_CONFIG.PATH_TRAVERSAL_PATTERNS) {
            if (pattern.test(filename)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Parse expiration time string
     */
    parseExpirationTime(expiresIn) {
        const now = new Date();
        const match = expiresIn.match(/^(\d+)([mhd])$/);
        if (!match) {
            throw new Error('Invalid expiration format. Use: 15m, 1h, 7d');
        }
        const [, value, unit] = match;
        if (!value || !unit) {
            throw new Error('Invalid expiration format. Use: 15m, 1h, 7d');
        }
        const numValue = parseInt(value);
        switch (unit) {
            case 'm':
                return new Date(now.getTime() + numValue * 60 * 1000);
            case 'h':
                return new Date(now.getTime() + numValue * 60 * 60 * 1000);
            case 'd':
                return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
            default:
                throw new Error('Invalid time unit');
        }
    }
    /**
     * Generate signature for token
     */
    generateSignature(fileId, expiresTimestamp, userId) {
        const data = `${fileId}.${expiresTimestamp}${userId ? `.${userId}` : ''}`;
        return createHmac('sha256', this.tokenSecret)
            .update(data)
            .digest('hex');
    }
    /**
     * Store file metadata (stub implementation)
     */
    async storeFileMetadata(fileInfo) {
        // In a real implementation, this would store in a database
        // For now, we'll just log it
        console.log('File metadata stored:', {
            id: fileInfo.id,
            organizationId: fileInfo.organizationId,
            fileType: fileInfo.fileType,
            size: fileInfo.size,
            path: fileInfo.path,
        });
    }
    /**
     * Remove file metadata (stub implementation)
     */
    async removeFileMetadata(fileId) {
        // In a real implementation, this would remove from a database
        console.log('File metadata removed:', fileId);
    }
    /**
     * Get all files (stub implementation)
     */
    async getAllFiles() {
        // In a real implementation, this would query a database
        // For now, return empty array
        return [];
    }
}
//# sourceMappingURL=local-storage.adapter.js.map