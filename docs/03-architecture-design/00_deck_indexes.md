# Database Indexes for Performance Optimization

## Overview

This document outlines the database indexes proposed and implemented for the Pivotal Flow application to optimize query performance for common operations.

## Index Strategy

### 1. **User Management Indexes**

#### 1.1 Composite Index: `idx_users_org_status_deleted`
```sql
CREATE INDEX idx_users_org_status_deleted ON "User" ("organizationId", "status", "deletedAt");
```

**Rationale:**
- Most user queries filter by organization and active status
- Supports efficient filtering for user lists and counts
- Covers the most common query pattern: `WHERE organizationId = ? AND status = 'active' AND deletedAt IS NULL`

**Usage:**
- User listing with status filters
- User count queries
- Active user lookups

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_users_org_status_deleted;
```

#### 1.2 Composite Index: `idx_users_org_email`
```sql
CREATE INDEX idx_users_org_email ON "User" ("organizationId", "email");
```

**Rationale:**
- Email lookups within an organization are frequent
- Supports case-insensitive email searches
- Optimizes user creation duplicate checks

**Usage:**
- User authentication
- Email uniqueness validation
- User search by email

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_users_org_email;
```

#### 1.3 Composite Index: `idx_users_org_created`
```sql
CREATE INDEX idx_users_org_created ON "User" ("organizationId", "createdAt" DESC);
```

**Rationale:**
- Default sorting for user lists is by creation date
- Supports efficient pagination with date-based sorting
- Covers the most common sort pattern

**Usage:**
- User listing with default sort
- Pagination queries
- Recent user queries

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_users_org_created;
```

### 2. **User Role Management Indexes**

#### 2.1 Composite Index: `idx_user_roles_org_user_active`
```sql
CREATE INDEX idx_user_roles_org_user_active ON "UserRole" ("organizationId", "userId", "isActive");
```

**Rationale:**
- User role lookups are frequent for permission checks
- Supports efficient role assignment queries
- Optimizes active role filtering

**Usage:**
- User permission checks
- Role assignment operations
- Active role queries

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_user_roles_org_user_active;
```

#### 2.2 Composite Index: `idx_user_roles_org_role_active`
```sql
CREATE INDEX idx_user_roles_org_role_active ON "UserRole" ("organizationId", "roleId", "isActive");
```

**Rationale:**
- Role-based user queries (e.g., "all users with admin role")
- Supports efficient role filtering in user lists
- Optimizes role-based searches

**Usage:**
- Users by role queries
- Role assignment lookups
- Role-based filtering

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_user_roles_org_role_active;
```

### 3. **Role Management Indexes**

#### 3.1 Composite Index: `idx_roles_org_active`
```sql
CREATE INDEX idx_roles_org_active ON "Role" ("organizationId", "isActive");
```

**Rationale:**
- Role lookups are frequent for permission checks
- Supports efficient active role queries
- Optimizes role assignment operations

**Usage:**
- Role lookups for assignments
- Active role queries
- Role validation

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_roles_org_active;
```

#### 3.2 Composite Index: `idx_roles_org_name`
```sql
CREATE INDEX idx_roles_org_name ON "Role" ("organizationId", "name");
```

**Rationale:**
- Role name lookups within organization
- Supports role name searches
- Optimizes role-based operations

**Usage:**
- Role name lookups
- Role searches
- Permission checks

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_roles_org_name;
```

### 4. **Audit Log Indexes**

#### 4.1 Composite Index: `idx_audit_logs_org_created`
```sql
CREATE INDEX idx_audit_logs_org_created ON "AuditLog" ("organizationId", "createdAt" DESC);
```

**Rationale:**
- Audit logs are typically queried by organization and date
- Supports efficient audit log retrieval
- Optimizes audit log pagination

**Usage:**
- Audit log queries
- Audit log pagination
- Recent activity queries

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_audit_logs_org_created;
```

#### 4.2 Composite Index: `idx_audit_logs_org_entity`
```sql
CREATE INDEX idx_audit_logs_org_entity ON "AuditLog" ("organizationId", "entityType", "entityId");
```

**Rationale:**
- Entity-specific audit log queries
- Supports efficient audit trail lookups
- Optimizes entity history queries

**Usage:**
- User audit trails
- Entity history queries
- Audit log filtering

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_audit_logs_org_entity;
```

#### 4.3 Composite Index: `idx_audit_logs_org_action`
```sql
CREATE INDEX idx_audit_logs_org_action ON "AuditLog" ("organizationId", "action", "createdAt" DESC);
```

**Rationale:**
- Action-specific audit log queries
- Supports efficient action filtering
- Optimizes action-based reports

**Usage:**
- Action-specific reports
- Audit log filtering by action
- Compliance queries

**Rollback:**
```sql
DROP INDEX IF EXISTS idx_audit_logs_org_action;
```

## Implementation

### Prisma Schema Annotations

Add these annotations to your Prisma schema:

```prisma
model User {
  // ... existing fields

  @@index([organizationId, status, deletedAt], name: "idx_users_org_status_deleted")
  @@index([organizationId, email], name: "idx_users_org_email")
  @@index([organizationId, createdAt(sort: Desc)], name: "idx_users_org_created")
}

model UserRole {
  // ... existing fields

  @@index([organizationId, userId, isActive], name: "idx_user_roles_org_user_active")
  @@index([organizationId, roleId, isActive], name: "idx_user_roles_org_role_active")
}

model Role {
  // ... existing fields

  @@index([organizationId, isActive], name: "idx_roles_org_active")
  @@index([organizationId, name], name: "idx_roles_org_name")
}

model AuditLog {
  // ... existing fields

  @@index([organizationId, createdAt(sort: Desc)], name: "idx_audit_logs_org_created")
  @@index([organizationId, entityType, entityId], name: "idx_audit_logs_org_entity")
  @@index([organizationId, action, createdAt(sort: Desc)], name: "idx_audit_logs_org_action")
}
```

### Manual SQL Migration

If you prefer manual SQL migrations:

```sql
-- User indexes
CREATE INDEX idx_users_org_status_deleted ON "User" ("organizationId", "status", "deletedAt");
CREATE INDEX idx_users_org_email ON "User" ("organizationId", "email");
CREATE INDEX idx_users_org_created ON "User" ("organizationId", "createdAt" DESC);

-- UserRole indexes
CREATE INDEX idx_user_roles_org_user_active ON "UserRole" ("organizationId", "userId", "isActive");
CREATE INDEX idx_user_roles_org_role_active ON "UserRole" ("organizationId", "roleId", "isActive");

-- Role indexes
CREATE INDEX idx_roles_org_active ON "Role" ("organizationId", "isActive");
CREATE INDEX idx_roles_org_name ON "Role" ("organizationId", "name");

-- AuditLog indexes
CREATE INDEX idx_audit_logs_org_created ON "AuditLog" ("organizationId", "createdAt" DESC);
CREATE INDEX idx_audit_logs_org_entity ON "AuditLog" ("organizationId", "entityType", "entityId");
CREATE INDEX idx_audit_logs_org_action ON "AuditLog" ("organizationId", "action", "createdAt" DESC);
```

## Performance Impact

### Expected Improvements

- **User listing queries**: 5-10x faster
- **Role-based filtering**: 3-5x faster
- **Audit log queries**: 4-8x faster
- **Email lookups**: 2-3x faster

### Storage Impact

- **Additional storage**: ~15-25% increase
- **Write performance**: Minimal impact (<5% slower)
- **Maintenance**: Automatic index maintenance by database

## Monitoring

### Index Usage

Monitor index usage with:

```sql
-- PostgreSQL
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- MySQL
SELECT 
  TABLE_SCHEMA,
  TABLE_NAME,
  INDEX_NAME,
  CARDINALITY,
  SUB_PART,
  PACKED,
  NULLABLE,
  INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'your_database'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Performance Metrics

Track these metrics:
- Query execution time
- Index hit ratio
- Slow query frequency
- Cache hit rates

## Rollback Plan

### Complete Rollback

To remove all indexes:

```sql
-- User indexes
DROP INDEX IF EXISTS idx_users_org_status_deleted;
DROP INDEX IF EXISTS idx_users_org_email;
DROP INDEX IF EXISTS idx_users_org_created;

-- UserRole indexes
DROP INDEX IF EXISTS idx_user_roles_org_user_active;
DROP INDEX IF EXISTS idx_user_roles_org_role_active;

-- Role indexes
DROP INDEX IF EXISTS idx_roles_org_active;
DROP INDEX IF EXISTS idx_roles_org_name;

-- AuditLog indexes
DROP INDEX IF EXISTS idx_audit_logs_org_created;
DROP INDEX IF EXISTS idx_audit_logs_org_entity;
DROP INDEX IF EXISTS idx_audit_logs_org_action;
```

### Selective Rollback

Remove specific indexes if they cause issues:

```sql
-- Remove specific index
DROP INDEX IF EXISTS idx_users_org_status_deleted;

-- Recreate if needed
CREATE INDEX idx_users_org_status_deleted ON "User" ("organizationId", "status", "deletedAt");
```

## Maintenance

### Regular Tasks

1. **Monitor index usage** monthly
2. **Check index fragmentation** quarterly
3. **Update statistics** after major data changes
4. **Review slow queries** for missing indexes

### Index Maintenance Commands

```sql
-- PostgreSQL: Analyze tables
ANALYZE "User";
ANALYZE "UserRole";
ANALYZE "Role";
ANALYZE "AuditLog";

-- MySQL: Analyze tables
ANALYZE TABLE User;
ANALYZE TABLE UserRole;
ANALYZE TABLE Role;
ANALYZE TABLE AuditLog;
```

## Future Considerations

### Potential Additional Indexes

1. **Full-text search indexes** for user content
2. **Partial indexes** for soft-deleted records
3. **Expression indexes** for computed fields
4. **Covering indexes** for frequently accessed queries

### Scaling Considerations

- **Partitioning** for large audit log tables
- **Read replicas** for heavy read workloads
- **Connection pooling** for high concurrency
- **Query result caching** for repeated queries

## Conclusion

These indexes provide a solid foundation for performance optimization while maintaining flexibility for future enhancements. Monitor their usage and adjust based on actual query patterns and performance requirements.
