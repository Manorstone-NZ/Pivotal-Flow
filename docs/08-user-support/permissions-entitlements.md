# Permissions & Entitlements

Pivotal Flow implements a comprehensive Role-Based Access Control (RBAC) system with fine-grained permissions and entitlements designed for multi-tenant SaaS environments. This system ensures secure, scalable, and auditable access control across all platform features.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Permission Structure](#permission-structure)
- [Role-Based Access Control](#role-based-access-control)
- [Multi-Tenant Security](#multi-tenant-security)
- [Permission Management](#permission-management)
- [API Security](#api-security)
- [Audit and Compliance](#audit-and-compliance)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Security Architecture

Pivotal Flow's permission system provides:

- **Granular Control**: Fine-grained permissions for every system feature
- **Role-Based Management**: Hierarchical roles with inherited permissions
- **Multi-Tenant Isolation**: Complete data separation between tenants
- **Dynamic Enforcement**: Real-time permission checking on every request
- **Comprehensive Auditing**: Complete access control audit trails

### Key Benefits

- **Security**: Zero-trust architecture with explicit permission requirements
- **Scalability**: Efficient permission checking with caching
- **Flexibility**: Custom roles and permission combinations
- **Compliance**: SOC2, GDPR, and enterprise audit requirements
- **Usability**: Intuitive role management for administrators

## Core Concepts

### Permissions

**Permissions** are atomic access rights that grant specific capabilities:

```json
{
  "name": "customers.view_customers",
  "description": "View customer information",
  "category": "customers",
  "resource": "customers", 
  "action": "view_customers"
}
```

### Roles

**Roles** are collections of permissions assigned to users:

```json
{
  "name": "Customer Manager",
  "description": "Manages customer relationships and data",
  "permissions": [
    "customers.view_customers",
    "customers.create_customers", 
    "customers.update_customers",
    "quotes.view_quotes",
    "quotes.create_quotes"
  ]
}
```

### Memberships

**Memberships** link users to tenants with specific roles:

```json
{
  "userId": "user-123",
  "tenantId": "tenant-456", 
  "role": "Customer Manager",
  "status": "ACTIVE",
  "assignedBy": "admin-user",
  "assignedAt": "2025-09-20T10:00:00Z"
}
```

### Entitlements

**Entitlements** are feature-level access controls per tenant:

```json
{
  "tenantId": "tenant-123",
  "features": {
    "CustomerPortal": true,
    "Quotes": true,
    "RateCards": true,
    "TimeTracking": false,
    "Invoicing": true,
    "Reporting": true
  }
}
```

## Permission Structure

### Permission Categories

#### User Management
- `users.view_users` - View user information
- `users.create_users` - Create new users
- `users.update_users` - Modify user details
- `users.delete_users` - Remove users

#### Customer Management  
- `customers.view_customers` - View customer data
- `customers.create_customers` - Create new customers
- `customers.update_customers` - Modify customer information
- `customers.delete_customers` - Remove customers
- `Manage Customers` - Legacy comprehensive customer access

#### Quote Management
- `quotes.view_quotes` - View quote information
- `quotes.create_quotes` - Create new quotes
- `quotes.update_quotes` - Modify existing quotes
- `quotes.delete_quotes` - Remove quotes

#### Project Management
- `projects.view_projects` - View project data
- `projects.create_projects` - Create new projects
- `projects.update_projects` - Modify project details
- `projects.delete_projects` - Remove projects

#### Time Tracking
- `time.view_time_entries` - View time entries
- `time.create_time_entries` - Log time entries
- `time.update_time_entries` - Modify time entries
- `time.delete_time_entries` - Remove time entries

#### Financial Management
- `payments.view_payments` - View payment information
- `payments.create_payments` - Process payments
- `payments.update_payments` - Modify payment records
- `payments.delete_payments` - Remove payments

- `invoices.view_invoices` - View invoices
- `invoices.create_invoices` - Generate invoices
- `invoices.update_invoices` - Modify invoices
- `invoices.delete_invoices` - Remove invoices

#### Rate Card Management
- `rate_cards.view_rate_cards` - View rate cards
- `rate_cards.create_rate_cards` - Create rate cards
- `rate_cards.update_rate_cards` - Modify rate cards
- `rate_cards.delete_rate_cards` - Remove rate cards

#### Reporting
- `reports.view_reports` - Access reports
- `reports.export_reports` - Export report data

#### System Administration
- `permissions.view_permissions` - View permission lists
- `permissions.create_permissions` - Create new permissions
- `permissions.update_permissions` - Modify permissions
- `permissions.delete_permissions` - Remove permissions

- `roles.view_roles` - View role definitions
- `roles.create_roles` - Create custom roles
- `roles.update_roles` - Modify role permissions
- `roles.delete_roles` - Remove roles

#### Tenant Administration
- `tenants.view` - View tenant information
- `tenants.manage` - Full tenant management
- `tenants.switch` - Switch between tenants
- `memberships.manage` - Manage user memberships
- `features.manage` - Control tenant features

#### Portal Access
- `portal.view_quotes` - Customer portal quote access
- `portal.view_invoices` - Customer portal invoice access
- `portal.view_time` - Customer portal time tracking

### Permission Inheritance

Permissions follow a hierarchical structure:

```
Platform Level
├── Super Admin Access (all permissions)
└── Platform Support (read-only across tenants)

Tenant Level
├── Tenant Owner (all tenant permissions)
├── Tenant Admin (administrative permissions)
├── Staff (standard user permissions)
└── Viewer (read-only permissions)

Feature Level
├── Module-specific permissions
└── Action-specific permissions
```

## Role-Based Access Control

### Predefined Roles

#### Platform Admin
**Scope**: Entire platform
**Permissions**: All system permissions
**Capabilities**:
- Manage all tenants
- Create and configure platform features
- Access system-wide analytics
- Manage platform users

```json
{
  "name": "Platform Admin",
  "description": "Full platform access with all permissions", 
  "isSystem": true,
  "permissions": ["*"]
}
```

#### Tenant Owner
**Scope**: Single tenant
**Permissions**: All tenant-specific permissions
**Capabilities**:
- Full tenant administration
- User and role management
- Billing and subscription control
- Feature configuration

```json
{
  "name": "Tenant Owner",
  "permissions": [
    "users.*",
    "customers.*", 
    "quotes.*",
    "projects.*",
    "invoices.*",
    "reports.*",
    "roles.view_roles",
    "roles.create_roles",
    "roles.update_roles"
  ]
}
```

#### Tenant Admin
**Scope**: Single tenant
**Permissions**: Administrative permissions (no billing)
**Capabilities**:
- User management
- Feature configuration
- Data access and reporting
- Role assignment

```json
{
  "name": "Tenant Admin",
  "permissions": [
    "users.view_users",
    "users.create_users",
    "users.update_users",
    "customers.*",
    "quotes.*", 
    "projects.*",
    "reports.*"
  ]
}
```

#### Staff
**Scope**: Single tenant
**Permissions**: Standard user permissions
**Capabilities**:
- Create and manage own content
- Access assigned projects
- Generate basic reports
- Limited administrative functions

```json
{
  "name": "Staff",
  "permissions": [
    "customers.view_customers",
    "quotes.view_quotes",
    "quotes.create_quotes",
    "projects.view_projects",
    "time.create_time_entries",
    "reports.view_reports"
  ]
}
```

#### Viewer
**Scope**: Single tenant
**Permissions**: Read-only permissions
**Capabilities**:
- View assigned data
- Generate reports
- No modification rights

```json
{
  "name": "Viewer", 
  "permissions": [
    "customers.view_customers",
    "quotes.view_quotes",
    "projects.view_projects",
    "reports.view_reports"
  ]
}
```

### Custom Roles

Tenants can create custom roles with specific permission combinations:

#### Creating Custom Roles
```http
POST /api/v1/admin/roles
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Project Manager",
  "description": "Manages projects and client relationships",
  "permissions": [
    "projects.view_projects",
    "projects.create_projects",
    "projects.update_projects",
    "customers.view_customers",
    "quotes.view_quotes",
    "quotes.create_quotes",
    "reports.view_reports"
  ]
}
```

#### Role Templates

Common role templates for quick setup:

```json
{
  "Sales Manager": [
    "customers.*",
    "quotes.*", 
    "reports.view_reports"
  ],
  "Account Manager": [
    "customers.view_customers",
    "customers.update_customers",
    "projects.view_projects",
    "time.view_time_entries"
  ],
  "Finance User": [
    "invoices.*",
    "payments.*",
    "reports.view_reports",
    "reports.export_reports"
  ]
}
```

## Multi-Tenant Security

### Tenant Isolation

Every permission check includes tenant context:

```typescript
// Permission validation with tenant scope
async function hasPermission(
  userId: string, 
  tenantId: string, 
  permission: string
): Promise<boolean> {
  
  // Get user's memberships in the specific tenant
  const membership = await getUserMembership(userId, tenantId);
  if (!membership || !membership.isActive) {
    return false;
  }
  
  // Check if user's role includes the required permission
  const role = await getRole(membership.roleId);
  return role.permissions.includes(permission);
}
```

### Cross-Tenant Protection

Users cannot access data from tenants they don't belong to:

```sql
-- All queries automatically include tenant filtering
SELECT * FROM customers 
WHERE tenant_id = $user_tenant_id 
AND id = $customer_id;

-- Cross-tenant access attempts are blocked
SELECT COUNT(*) FROM customers 
WHERE tenant_id != $user_tenant_id; -- Returns 0
```

### Permission Scoping

Permissions are automatically scoped to the user's current tenant:

```typescript
// API endpoint with automatic tenant scoping
app.get('/api/v1/customers', async (request, reply) => {
  // Extract tenant from authenticated user context
  const tenantId = request.user.tenantId;
  
  // Check permission within tenant scope
  if (!await hasPermission(request.user.id, tenantId, 'customers.view_customers')) {
    throw new AuthorizationError('Insufficient permissions');
  }
  
  // Query automatically scoped to tenant
  return customerService.list({ tenantId });
});
```

## Permission Management

### Assigning Permissions

#### Role-Based Assignment
```http
POST /api/v1/admin/user-roles
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-123",
  "roleId": "role-456", 
  "tenantId": "tenant-789",
  "assignedBy": "admin-user"
}
```

#### Direct Permission Assignment (Advanced)
```http
POST /api/v1/admin/user-permissions
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-123",
  "permissions": ["customers.view_customers"],
  "tenantId": "tenant-789",
  "reason": "Temporary access for audit"
}
```

### Permission Validation

#### Real-Time Validation
Every API request validates permissions:

```typescript
// Middleware for permission checking
async function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    const hasAccess = await permissionService.hasPermission(
      user.id,
      user.tenantId, 
      permission
    );
    
    if (!hasAccess) {
      throw new AuthorizationError(`Missing permission: ${permission}`);
    }
  };
}

// Usage in routes
app.get('/api/v1/customers', {
  preHandler: [requirePermission('customers.view_customers')]
}, async (request, reply) => {
  // Handler code
});
```

#### Frontend Permission Checks
```typescript
// React component with permission-based rendering
function CustomerList() {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      <CustomerTable />
      
      {hasPermission('customers.create_customers') && (
        <CreateCustomerButton />
      )}
      
      {hasPermission('customers.update_customers') && (
        <EditCustomerButton />
      )}
    </div>
  );
}
```

### Permission Caching

#### Redis-Based Caching
```typescript
class PermissionCache {
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const cacheKey = `permissions:${userId}:${tenantId}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Load from database
    const permissions = await this.loadUserPermissions(userId, tenantId);
    
    // Cache for 15 minutes
    await this.redis.setex(cacheKey, 900, JSON.stringify(permissions));
    
    return permissions;
  }
  
  async invalidateUserCache(userId: string, tenantId?: string): Promise<void> {
    const pattern = tenantId 
      ? `permissions:${userId}:${tenantId}`
      : `permissions:${userId}:*`;
      
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
```

## API Security

### Authentication Flow

1. **Login**: User authenticates with credentials
2. **Token Generation**: JWT/PASETO token with user context
3. **Permission Loading**: User permissions cached in token/session
4. **Request Validation**: Every API call validates permissions
5. **Tenant Scoping**: All data queries scoped to user's tenant

### API Permission Mapping

```typescript
// Route to permission mapping
const ROUTE_PERMISSIONS = {
  // Customer endpoints
  'GET /customers': 'customers.view_customers',
  'POST /customers': 'customers.create_customers', 
  'PATCH /customers/:id': 'customers.update_customers',
  'DELETE /customers/:id': 'customers.delete_customers',
  
  // Quote endpoints
  'GET /quotes': 'quotes.view_quotes',
  'POST /quotes': 'quotes.create_quotes',
  'PUT /quotes/:id': 'quotes.update_quotes',
  'DELETE /quotes/:id': 'quotes.delete_quotes',
  
  // Admin endpoints
  'GET /admin/users': 'users.view_users',
  'POST /admin/users': 'users.create_users',
  'GET /admin/tenants': 'tenants.view',
  'POST /admin/tenants': 'tenants.manage'
};
```

### Public API Security

Public endpoints use token-based tenant resolution:

```typescript
// Public quote access with embedded tenant context
app.get('/public/quotes/:token', async (request, reply) => {
  // Verify and decode public token
  const tokenData = await verifyPublicToken(request.params.token);
  if (!tokenData) {
    throw new AuthenticationError('Invalid token');
  }
  
  // Check tenant feature entitlement
  if (!await hasFeatureEnabled(tokenData.tenantId, 'CustomerPortal')) {
    throw new AuthorizationError('Feature not available');
  }
  
  // Return quote data scoped to token's tenant
  return quoteService.getPublicQuote(tokenData.quoteId, tokenData.tenantId);
});
```

## Audit and Compliance

### Permission Audit Logs

All permission-related activities are logged:

```json
{
  "timestamp": "2025-09-20T10:30:00Z",
  "eventType": "permission.granted",
  "userId": "user-123",
  "tenantId": "tenant-456",
  "permission": "customers.create_customers",
  "resource": "customer-789",
  "result": "success",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-abc123"
}
```

### Access Reviews

#### Automated Reports
```sql
-- Users with elevated permissions
SELECT 
  u.email,
  t.name as tenant,
  r.name as role,
  COUNT(rp.permission_id) as permission_count
FROM users u
JOIN memberships m ON u.id = m.user_id  
JOIN tenants t ON m.tenant_id = t.id
JOIN roles r ON m.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY u.email, t.name, r.name
HAVING COUNT(rp.permission_id) > 10
ORDER BY permission_count DESC;
```

#### Permission Usage Analytics
```sql
-- Most used permissions by tenant
SELECT 
  t.name as tenant,
  al.permission,
  COUNT(*) as usage_count,
  COUNT(DISTINCT al.user_id) as unique_users
FROM audit_logs al
JOIN tenants t ON al.tenant_id = t.id  
WHERE al.event_type = 'permission.granted'
AND al.created_at > NOW() - INTERVAL '30 days'
GROUP BY t.name, al.permission
ORDER BY usage_count DESC;
```

### Compliance Features

#### GDPR Compliance
- **Right to Access**: Export user permissions and roles
- **Right to Rectification**: Update permission assignments
- **Right to Erasure**: Remove user permissions on deletion
- **Data Portability**: Export permission history

#### SOC2 Compliance
- **Access Control**: Documented permission matrix
- **Monitoring**: Real-time permission usage tracking
- **Audit Trail**: Complete permission change history
- **Segregation of Duties**: Role-based access separation

## Best Practices

### For Platform Administrators

#### Permission Design
1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role-Based Access**: Use roles instead of individual permissions
3. **Regular Reviews**: Quarterly permission audits
4. **Documentation**: Maintain permission matrix and role definitions

#### Security Management
1. **Permission Naming**: Consistent naming conventions
2. **Granular Permissions**: Atomic permission definitions
3. **Role Hierarchies**: Clear role inheritance structures
4. **Audit Monitoring**: Real-time permission usage alerts

### For Tenant Administrators

#### User Management
1. **Role Templates**: Use predefined roles when possible
2. **Custom Roles**: Create tenant-specific roles as needed
3. **Regular Cleanup**: Remove unused roles and permissions
4. **User Training**: Educate users on their permissions

#### Access Control
1. **Onboarding**: Assign appropriate roles during user creation
2. **Role Changes**: Document reasons for permission changes
3. **Offboarding**: Immediate permission revocation on user departure
4. **Guest Access**: Temporary permissions for external users

### For Developers

#### API Development
1. **Permission Checks**: Validate permissions on every endpoint
2. **Error Handling**: Clear permission error messages
3. **Caching**: Implement efficient permission caching
4. **Testing**: Comprehensive permission test coverage

#### Frontend Development
1. **UI Permissions**: Hide/show features based on permissions
2. **Error Handling**: Graceful handling of permission errors
3. **User Feedback**: Clear messaging about permission requirements
4. **Performance**: Efficient permission checking

## Troubleshooting

### Common Issues

#### Permission Denied Errors
```
Error: Missing permission 'customers.view_customers'
Diagnosis:
1. Check user's current tenant context
2. Verify user has active membership in tenant
3. Confirm role includes required permission
4. Check tenant feature entitlements
5. Verify permission cache is current
```

#### Role Assignment Issues
```
Error: Cannot assign role to user
Diagnosis:
1. Verify admin has role management permissions
2. Check target user exists and is active
3. Confirm role exists and is active
4. Verify tenant membership exists
5. Check for role assignment conflicts
```

#### Cross-Tenant Access
```
Error: Cannot access resource from different tenant
Diagnosis:
1. Verify user's current tenant context
2. Check if user has membership in target tenant
3. Confirm tenant switching worked correctly
4. Verify token contains correct tenant ID
5. Check for cached permission issues
```

### Diagnostic Tools

#### Permission Checker
```http
GET /api/v1/admin/permissions/check
Authorization: Bearer <admin-token>
Query: ?userId=user-123&tenantId=tenant-456&permission=customers.view_customers

Response:
{
  "hasPermission": true,
  "reason": "User has role 'Staff' which includes permission",
  "roleChain": ["Staff"],
  "effectivePermissions": ["customers.view_customers", "quotes.view_quotes"]
}
```

#### User Permission Summary
```http
GET /api/v1/admin/users/{user-id}/permissions
Authorization: Bearer <admin-token>
Query: ?tenantId=tenant-456

Response:
{
  "userId": "user-123",
  "tenantId": "tenant-456", 
  "roles": ["Staff"],
  "permissions": [
    "customers.view_customers",
    "quotes.view_quotes",
    "quotes.create_quotes"
  ],
  "lastUpdated": "2025-09-20T10:00:00Z"
}
```

### Performance Optimization

#### Permission Caching
- Cache user permissions for 15 minutes
- Invalidate cache on role/permission changes
- Use Redis for distributed caching
- Implement cache warming for active users

#### Database Optimization
- Index permission lookup tables
- Denormalize frequently accessed permissions
- Partition audit logs by date
- Regular cleanup of expired data

---

## Related Documentation

- [User Management](./user-management.md) - User administration and roles
- [Multi-Tenancy System](./multi-tenancy.md) - Tenant isolation and security
- [API Documentation](./api-usage.md) - Complete API reference
- [Security Guide](../security/PASETO-Migration-Plan.md) - Advanced security features

---

*Last Updated: September 2025*
*Version: 1.0.0*
