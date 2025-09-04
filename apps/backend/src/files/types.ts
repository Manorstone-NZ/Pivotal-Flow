/**
 * File storage types
 * TypeScript interfaces for file storage operations
 */

// File types
export type FileType = 'exports' | 'pdfs' | 'templates' | 'assets';

// MIME types
export type MimeType = 
  | 'application/pdf'
  | 'text/csv'
  | 'application/json'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-excel'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/svg+xml'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// File generation options
export interface GenerateFileOptions {
  organizationId: string;
  fileType: FileType;
  mimeType: MimeType;
  content: string | Buffer;
  description: string;
  userId?: string;
}

// Signed URL options
export interface SignedUrlOptions {
  expiresIn: string; // e.g., '15m', '1h'
  userId?: string;
  organizationId?: string;
}

// File information
export interface FileInfo {
  id: string;
  organizationId: string;
  fileType: FileType;
  mimeType: MimeType;
  size: number;
  description: string;
  path: string;
  createdAt: Date;
  expiresAt?: Date;
  userId?: string;
}

// Storage adapter interface
export interface StorageAdapter {
  generateFile(options: GenerateFileOptions): Promise<string>;
  getSignedUrl(fileId: string, options: SignedUrlOptions): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
  cleanupExpiredFiles(): Promise<number>;
  getFileInfo(fileId: string): Promise<FileInfo>;
  validateFile(fileId: string, token: string): Promise<boolean>;
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  fileInfo?: FileInfo;
  error?: string;
}

// File cleanup result
export interface FileCleanupResult {
  deletedCount: number;
  errors: string[];
  totalSize: number;
}
