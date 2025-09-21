# Audit and Permissions Documentation

## Overview
This document describes the shared audit logging and permission service functionality implemented in the CF2 epic.

## Shared Audit Logger

### Location
`packages/shared/src/audit/logger.ts`

### Key Functions

#### `auditLog(db, event)`
Main audit logging function that serializes events without secrets.

**Parameters:**
- `db`: Database connection (any type for shared package)
- `event`: `AuditLogEvent` object

**Returns:** `AuditLogResult` with success status and audit ID

**Features:**
- Automatic secret sanitization (passwords, tokens, keys)
- Error handling with graceful degradation
- Structured logging format

#### `createAuditLogger(db, context)`
Factory function to create an audit logger with pre-configured context.

**Parameters:**
- `db`: Database connection
- `context`: `{ organizationId: string; actorId: string }`

**Returns:** Logger object with `log()` method

### Usage Examples

```typescript
import { createAuditLogger } from '@pivotal-flow/shared';

// Create logger with context
const auditLogger = createAuditLogger(db, {
  organizationId: 'org-123',
  actorId: 'user-456'
});

// Log an event
await auditLogger.log({
  action: 'quote.create',
  entityType: 'Quote',
  entityId: 'quote-789',
  metadata: {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0'
  }
});
```

### Secret Sanitization
The audit logger automatically redacts sensitive information:
- `password`, `token`, `secret`, `key`
- `credential`, `auth`, `authorization`
- `bearer`, `api_key`, `private_key`, `secret_key`

## Shared Permission Service

### Location
`packages/shared/src/security/permissions.ts`

### Key Class

#### `PermissionService`
Handles permission checking and management for users.

**Constructor:**
```typescript
new PermissionService(db, {
  organizationId: string;
  userId: string;
  roles?: string[];
})
```

### Key Methods

#### `hasPermission(userId, permission)`
Check if a specific user has a permission.

#### `hasCurrentUserPermission(permission)`
Check if the current user has a permission.

#### `hasAnyPermission(permissions[])`
Check if the current user has any of the specified permissions.

#### `hasAllPermissions(permissions[])`
Check if the current user has all of the specified permissions.

#### `getUserPermissions()`
Get all permissions for the current user.

### Usage Examples

```typescript
import { PermissionService } from '@pivotal-flow/shared';

// Create permission service
const permissionService = new PermissionService(db, {
  organizationId: 'org-123',
  userId: 'user-456'
});

// Check single permission
const check = await permissionService.hasCurrentUserPermission('reports.view');
if (check.hasPermission) {
  // User can view reports
} else {
  console.log('Access denied:', check.reason);
}

// Check multiple permissions
const anyCheck = await permissionService.hasAnyPermission([
  'reports.view',
  'quotes.create',
  'users.manage'
]);

const allCheck = await permissionService.hasAllPermissions([
  'reports.view',
  'quotes.create'
]);
```

## Integration with Backend Services

### Reports Routes Example
```typescript
// In reports routes
const permissionService = new PermissionService(db, { 
  organizationId, 
  userId 
});
const auditLogger = createAuditLogger(db, { 
  organizationId, 
  actorId: userId 
});

const exportJobService = new ExportJobService(
  organizationId, 
  userId, 
  permissionService, 
  auditLogger
);
```

### Route Handler Example
```typescript
// In route handlers
const { organizationId, userId } = (request as any).user;
const db = getDatabase();

const permissionService = new PermissionService(db, { 
  organizationId, 
  userId 
});
const auditLogger = createAuditLogger(db, { 
  organizationId, 
  actorId: userId 
});

// Use services
const permissionCheck = await permissionService.hasCurrentUserPermission('reports.export');
if (!permissionCheck.hasPermission) {
  return reply.status(403).send({
    error: 'Forbidden',
    message: permissionCheck.reason,
    code: 'INSUFFICIENT_PERMISSIONS'
  });
}

// Log audit event
await auditLogger.log({
  action: 'reports.export.created',
  entityType: 'ExportJob',
  entityId: jobId,
  metadata: {
    reportType: request.body.reportType,
    format: request.body.format
  }
});
```

## Testing

### Unit Tests
Comprehensive unit tests are available in `packages/shared/src/__tests__/audit-permissions.test.ts`

**Test Coverage:**
- Audit event serialization without secrets
- Error handling in audit logging
- Permission service instantiation
- Permission checking methods
- Invalid permission format handling

### Running Tests
```bash
cd packages/shared
pnpm test
```

## Security Considerations

1. **Secret Sanitization**: All audit logs automatically redact sensitive information
2. **Permission Validation**: All permission checks validate format and handle errors gracefully
3. **Context Isolation**: Each logger instance is scoped to a specific organization and actor
4. **Error Handling**: Failed audit logs don't break application flow

## Migration Notes

When migrating from backend-specific services to shared services:

1. Update imports to use `@pivotal-flow/shared`
2. Ensure constructor calls include both `organizationId` and `userId`
3. Update audit logging calls to use the new interface
4. Test permission checks with the simplified shared implementation

## Future Enhancements

1. **Database Integration**: Full database integration for audit logs
2. **Permission Caching**: Redis-based permission caching
3. **Audit Log Retention**: Configurable retention policies
4. **Real-time Permissions**: WebSocket-based permission updates
