/**
 * File storage types
 * TypeScript interfaces for file storage operations
 */
export type FileType = 'exports' | 'pdfs' | 'templates' | 'assets';
export type MimeType = 'application/pdf' | 'text/csv' | 'application/json' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'application/vnd.ms-excel' | 'image/png' | 'image/jpeg' | 'image/gif' | 'image/svg+xml' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export interface GenerateFileOptions {
    organizationId: string;
    fileType: FileType;
    mimeType: MimeType;
    content: string | Buffer;
    description: string;
    userId?: string;
}
export interface SignedUrlOptions {
    expiresIn: string;
    userId?: string;
    organizationId?: string;
}
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
export interface StorageAdapter {
    generateFile(options: GenerateFileOptions): Promise<string>;
    getSignedUrl(fileId: string, options: SignedUrlOptions): Promise<string>;
    deleteFile(fileId: string): Promise<void>;
    cleanupExpiredFiles(): Promise<number>;
    getFileInfo(fileId: string): Promise<FileInfo | null>;
    validateFile(fileId: string, token: string): Promise<boolean>;
    getFileContent(fileId: string): Promise<{
        content: Buffer;
        mimeType: MimeType;
        filename: string;
    }>;
}
export interface FileValidationResult {
    isValid: boolean;
    fileInfo?: FileInfo;
    error?: string;
}
export interface FileCleanupResult {
    deletedCount: number;
    errors: string[];
    totalSize: number;
}
//# sourceMappingURL=types.d.ts.map