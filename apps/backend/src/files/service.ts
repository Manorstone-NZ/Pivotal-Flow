/**
 * File service
 * High-level service for file operations using storage adapters
 */

import { LocalStorageAdapter } from './local-storage.adapter.js';
import { PermissionService } from '../modules/permissions/service.js';
import { AuditLogger } from '../modules/audit/logger.js';
import type { 
  StorageAdapter, 
  GenerateFileOptions, 
  SignedUrlOptions,
  FileInfo,
  FileType 
} from './types.js';
import { DEFAULT_EXPIRATION_TIMES, FILE_ERRORS } from './constants.js';

/**
 * File service for managing file operations
 */
export class FileService {
  private storageAdapter: StorageAdapter;

  constructor(
    private organizationId: string,
    private userId: string,
    private permissionService: PermissionService,
    private auditLogger: AuditLogger,
    storageAdapter?: StorageAdapter
  ) {
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
  }

  /**
   * Generate a file
   */
  async generateFile(options: GenerateFileOptions): Promise<string> {
    // Check permissions
    const canGenerateFile = await this.permissionService.hasPermission(
      this.userId,
      'files.generate_files'
    );

    if (!canGenerateFile.hasPermission) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Ensure organization ID matches
    if (options.organizationId !== this.organizationId) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Add user ID to options
    const fileOptions = {
      ...options,
      userId: this.userId,
    };

    // Generate file
    const fileId = await this.storageAdapter.generateFile(fileOptions);

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'file_generated',
      resource: 'files',
      resourceId: fileId,
      details: {
        fileType: options.fileType,
        mimeType: options.mimeType,
        size: Buffer.isBuffer(options.content) ? options.content.length : Buffer.byteLength(options.content, 'utf8'),
        description: options.description,
      },
    });

    return fileId;
  }

  /**
   * Get a signed URL for file access
   */
  async getSignedUrl(fileId: string, fileType?: FileType): Promise<string> {
    // Check permissions
    const canAccessFile = await this.permissionService.hasPermission(
      this.userId,
      'files.access_files'
    );

    if (!canAccessFile.hasPermission) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Get file info to verify access
    const fileInfo = await this.storageAdapter.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
    }

    // Check organization access
    if (fileInfo.organizationId !== this.organizationId) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Determine expiration time
    const expiresIn = fileType ? DEFAULT_EXPIRATION_TIMES[fileType] : DEFAULT_EXPIRATION_TIMES.exports;

    // Generate signed URL
    const signedUrl = await this.storageAdapter.getSignedUrl(fileId, {
      expiresIn,
      userId: this.userId,
      organizationId: this.organizationId,
    });

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'file_access_requested',
      resource: 'files',
      resourceId: fileId,
      details: {
        fileType: fileInfo.fileType,
        expiresIn,
      },
    });

    return signedUrl;
  }

  /**
   * Download a file using a signed token
   */
  async downloadFile(fileId: string, token: string): Promise<{ content: Buffer; mimeType: string; filename: string }> {
    // Validate token
    const isValid = await this.storageAdapter.validateFile(fileId, token);
    if (!isValid) {
      throw new Error(FILE_ERRORS.TOKEN_INVALID);
    }

    // Get file content
    const fileContent = await this.storageAdapter.getFileContent(fileId);

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'file_downloaded',
      resource: 'files',
      resourceId: fileId,
      details: {
        filename: fileContent.filename,
        size: fileContent.content.length,
      },
    });

    return fileContent;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    // Check permissions
    const canDeleteFile = await this.permissionService.hasPermission(
      this.userId,
      'files.delete_files'
    );

    if (!canDeleteFile.hasPermission) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Get file info to verify access
    const fileInfo = await this.storageAdapter.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
    }

    // Check organization access
    if (fileInfo.organizationId !== this.organizationId) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Delete file
    await this.storageAdapter.deleteFile(fileId);

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'file_deleted',
      resource: 'files',
      resourceId: fileId,
      details: {
        fileType: fileInfo.fileType,
        size: fileInfo.size,
      },
    });
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string): Promise<FileInfo> {
    // Check permissions
    const canViewFile = await this.permissionService.hasPermission(
      this.userId,
      'files.view_files'
    );

    if (!canViewFile.hasPermission) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Get file info
    const fileInfo = await this.storageAdapter.getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error(FILE_ERRORS.FILE_NOT_FOUND);
    }

    // Check organization access
    if (fileInfo.organizationId !== this.organizationId) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    return fileInfo;
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    // Check permissions
    const canCleanupFiles = await this.permissionService.hasPermission(
      this.userId,
      'files.cleanup_files'
    );

    if (!canCleanupFiles.hasPermission) {
      throw new Error(FILE_ERRORS.PERMISSION_DENIED);
    }

    // Clean up expired files
    const deletedCount = await this.storageAdapter.cleanupExpiredFiles();

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'files_cleanup_completed',
      resource: 'files',
      details: {
        deletedCount,
      },
    });

    return deletedCount;
  }

  /**
   * Generate a PDF file
   */
  async generatePdf(content: string, description: string): Promise<string> {
    return this.generateFile({
      organizationId: this.organizationId,
      fileType: 'pdfs',
      mimeType: 'application/pdf',
      content,
      description,
    });
  }

  /**
   * Generate an export file
   */
  async generateExport(content: string, mimeType: 'text/csv' | 'application/json', description: string): Promise<string> {
    return this.generateFile({
      organizationId: this.organizationId,
      fileType: 'exports',
      mimeType,
      content,
      description,
    });
  }
}
