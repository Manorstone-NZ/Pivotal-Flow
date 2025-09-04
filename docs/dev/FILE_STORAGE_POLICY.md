# File Storage Policy

## Overview

The File Storage Policy defines the standards and practices for handling file generation, storage, and access for PDFs and exports in the Pivotal Flow platform. This policy ensures security, performance, and maintainability while providing hooks for future cloud storage integration.

## Storage Architecture

### Storage Adapters
- **Local Storage**: Development and testing environment using local file system
- **Cloud Storage**: Future implementation for production (AWS S3, Azure Blob, GCP Cloud Storage)
- **Hybrid Mode**: Support for multiple storage backends simultaneously

### File Categories
- **PDFs**: Generated documents (quotes, invoices, reports)
- **Exports**: Data exports (CSV, JSON, Excel)
- **Templates**: Reusable document templates
- **Assets**: Static assets (logos, images)

## File Limits and Validation

### Size Limits
| File Type | Max Size | Reason |
|-----------|----------|---------|
| PDF Documents | 50 MB | Large reports and complex documents |
| CSV Exports | 100 MB | Large dataset exports |
| JSON Exports | 50 MB | Structured data exports |
| Excel Exports | 25 MB | Spreadsheet format overhead |
| Images | 10 MB | Logo and document images |
| Templates | 5 MB | Document templates |

### MIME Type Validation
```typescript
const ALLOWED_MIME_TYPES = {
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
```

### File Name Validation
- **Length**: 1-255 characters
- **Characters**: Alphanumeric, hyphens, underscores, dots
- **No Path Traversal**: Prevent `../` and similar patterns
- **No Reserved Names**: Avoid system reserved names (CON, PRN, etc.)

## File Naming Convention

### Structure
```
{organization_id}/{file_type}/{year}/{month}/{uuid}_{description}.{extension}
```

### Examples
```
org_acme/exports/2024/01/550e8400-e29b-41d4-a716-446655440000_quotes_export.csv
org_acme/pdfs/2024/01/660e8400-e29b-41d4-a716-446655440001_invoice_2024_001.pdf
org_acme/templates/2024/01/770e8400-e29b-41d4-a716-446655440002_quote_template.docx
```

### Components
- **Organization ID**: Ensures data isolation
- **File Type**: Categorizes files (exports, pdfs, templates, assets)
- **Date Hierarchy**: Year/month for easy cleanup and organization
- **UUID**: Unique identifier for collision avoidance
- **Description**: Human-readable description
- **Extension**: File extension matching MIME type

## Access Control

### Signed URLs
- **Expiration**: 15 minutes for exports, 1 hour for PDFs
- **Scope**: Organization and user level access
- **Audit**: All access attempts logged
- **Revocation**: Immediate revocation capability

### URL Structure
```
GET /v1/files/{fileId}/download?token={signedToken}
```

### Token Format
```
{fileId}.{expiryTimestamp}.{signature}
```

## Retention Policy

### File Retention
| File Type | Retention Period | Cleanup Schedule |
|-----------|------------------|------------------|
| Exports | 30 days | Daily cleanup job |
| PDFs | 90 days | Weekly cleanup job |
| Templates | 1 year | Monthly cleanup job |
| Assets | Indefinite | Manual cleanup only |

### Cleanup Process
1. **Identification**: Query for expired files
2. **Verification**: Confirm no active references
3. **Deletion**: Remove from storage
4. **Audit**: Log deletion events
5. **Notification**: Alert on cleanup failures

## Security Considerations

### File Upload Security
- **Virus Scanning**: Scan all uploaded files
- **Content Validation**: Verify file content matches MIME type
- **Size Limits**: Enforce maximum file sizes
- **Path Validation**: Prevent path traversal attacks

### Access Security
- **Signed URLs**: Time-limited access tokens
- **Organization Isolation**: Files scoped to organization
- **User Permissions**: Verify user access rights
- **Audit Logging**: Log all file access attempts

### Storage Security
- **Encryption**: Encrypt files at rest
- **Access Logs**: Monitor storage access
- **Backup**: Regular backup of critical files
- **Disaster Recovery**: Recovery procedures documented

## Development Guidelines

### Local Storage
- **Temp Directory**: `/tmp/pivotal-flow-files`
- **Organization Structure**: Maintain same hierarchy as production
- **Cleanup**: Automatic cleanup of expired files
- **Logging**: No secrets or sensitive data in logs

### File Operations
```typescript
// Generate file
const fileId = await fileStorage.generateFile({
  organizationId: 'org_acme',
  fileType: 'exports',
  mimeType: 'text/csv',
  content: csvData,
  description: 'quotes_export'
});

// Get signed URL
const signedUrl = await fileStorage.getSignedUrl(fileId, {
  expiresIn: '15m',
  userId: 'user_admin'
});

// Cleanup expired files
await fileStorage.cleanupExpiredFiles();
```

### Error Handling
- **Validation Errors**: Return 400 with specific error message
- **Storage Errors**: Return 500 with generic error message
- **Permission Errors**: Return 403 with access denied message
- **File Not Found**: Return 404 with file not found message

## Monitoring and Metrics

### Key Metrics
- **File Generation**: Count and size of generated files
- **File Access**: Count of file downloads and access attempts
- **Storage Usage**: Total storage used by organization
- **Cleanup Success**: Success rate of cleanup operations
- **Error Rates**: File operation error rates

### Alerts
- **Storage Quota**: Alert when approaching storage limits
- **Cleanup Failures**: Alert when cleanup jobs fail
- **Access Anomalies**: Alert on unusual access patterns
- **Error Spikes**: Alert on high error rates

## Future Cloud Integration

### Adapter Interface
```typescript
interface StorageAdapter {
  generateFile(options: GenerateFileOptions): Promise<string>;
  getSignedUrl(fileId: string, options: SignedUrlOptions): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
  cleanupExpiredFiles(): Promise<number>;
  getFileInfo(fileId: string): Promise<FileInfo>;
}
```

### Cloud Providers
- **AWS S3**: Primary cloud storage option
- **Azure Blob**: Alternative for Azure environments
- **GCP Cloud Storage**: Alternative for GCP environments
- **MinIO**: Self-hosted S3-compatible storage

### Migration Strategy
1. **Dual Write**: Write to both local and cloud storage
2. **Gradual Migration**: Migrate existing files over time
3. **Fallback**: Fallback to local storage on cloud failures
4. **Validation**: Verify file integrity after migration

## Compliance and Legal

### Data Protection
- **GDPR**: Right to erasure for user data
- **CCPA**: Data deletion requests
- **SOX**: Audit trail for financial documents
- **HIPAA**: Protected health information handling

### Audit Requirements
- **Access Logs**: All file access attempts logged
- **Retention Logs**: File creation and deletion events
- **Security Events**: Failed access attempts and anomalies
- **Compliance Reports**: Regular compliance reporting

## Implementation Notes

### Local Development
- **Temp Directory**: Use local temp directory for development
- **File Permissions**: Ensure proper file permissions
- **Cleanup**: Regular cleanup to prevent disk space issues
- **Logging**: Verbose logging for debugging

### Testing
- **Unit Tests**: Test file operations and validation
- **Integration Tests**: Test end-to-end file workflows
- **Security Tests**: Test access control and validation
- **Performance Tests**: Test with large files and high concurrency

### Deployment
- **Environment Variables**: Configure storage settings
- **Health Checks**: Verify storage connectivity
- **Monitoring**: Set up monitoring and alerting
- **Documentation**: Update deployment documentation
