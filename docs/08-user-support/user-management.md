# User Management

Pivotal Flow provides comprehensive user management capabilities designed for multi-tenant SaaS environments. This guide covers user administration, role assignments, and security management across tenants.

## Table of Contents

- [Overview](#overview)
- [User Lifecycle](#user-lifecycle)
- [Roles and Hierarchies](#roles-and-hierarchies)
- [Multi-Tenant Memberships](#multi-tenant-memberships)
- [User Administration](#user-administration)
- [Security Features](#security-features)
- [API Integration](#api-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### User Management Architecture

Pivotal Flow implements a sophisticated user management system that supports:

- **Multi-tenant memberships**: Users can belong to multiple tenants
- **Hierarchical roles**: From platform admin to tenant-specific roles
- **Granular permissions**: Fine-grained access control
- **Secure authentication**: Modern token-based security
- **Audit trails**: Complete user activity tracking

### Key Concepts

#### Users
Individual people who access the platform, identified by:
- Unique email address (login credential)
- Personal information (name, timezone, preferences)
- Security settings (password, MFA, session management)
- Account status (active, suspended, pending verification)

#### Memberships
The relationship between users and tenants, defining:
- Which tenants a user can access
- Role within each tenant
- Membership status and validity period
- Assignment history and audit trail

#### Sessions
Active user connections with security tracking:
- Session tokens and expiration
- Device and location information
- Activity monitoring
- Security anomaly detection

## User Lifecycle

### 1. User Creation

#### Self-Registration (if enabled)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "timezone": "America/New_York"
}
```

#### Admin-Created Users
```http
POST /api/v1/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF",
  "tenantId": "tenant-uuid",
  "sendInvite": true
}
```

### 2. Email Verification

All new users must verify their email address:
- Verification email sent automatically
- Secure token with 24-hour expiration
- Account remains inactive until verified
- Resend verification option available

### 3. User Activation

#### Self-Activation
Users complete profile setup:
- Set secure password
- Configure timezone and preferences
- Accept terms of service
- Optional: Set up MFA

#### Admin Activation
Administrators can:
- Approve pending users
- Assign initial roles and permissions
- Set temporary passwords
- Configure account restrictions

### 4. User Deactivation

#### Soft Deactivation (Suspension)
- User cannot log in
- Data remains intact
- Can be reactivated
- Audit trail preserved

#### Hard Deactivation (Deletion)
- User account permanently removed
- Data anonymized or deleted (GDPR compliance)
- Cannot be recovered
- Complete audit log maintained

## Roles and Hierarchies

### Platform-Level Roles

#### Platform Admin
- **Scope**: Entire platform across all tenants
- **Capabilities**:
  - Create and manage tenants
  - Assign platform-level permissions
  - Access system-wide analytics
  - Manage platform configuration
- **Users**: Pivotal Flow administrators only

#### Platform Support
- **Scope**: Read-only access across tenants for support
- **Capabilities**:
  - View tenant information
  - Access support tools
  - Generate diagnostic reports
  - No data modification rights

### Tenant-Level Roles

#### Tenant Owner
- **Scope**: Full control within specific tenant
- **Capabilities**:
  - Manage all tenant users
  - Configure tenant settings
  - Access all tenant data
  - Billing and subscription management
- **Limit**: One primary owner per tenant

#### Tenant Admin
- **Scope**: Administrative access within tenant
- **Capabilities**:
  - Manage users and roles
  - Configure tenant features
  - Access reporting and analytics
  - Cannot modify billing settings

#### Staff
- **Scope**: Standard user access within tenant
- **Capabilities**:
  - Access assigned projects and data
  - Create and edit own content
  - Use core platform features
  - Limited administrative functions

#### Viewer
- **Scope**: Read-only access within tenant
- **Capabilities**:
  - View assigned data
  - Generate reports
  - No modification rights
  - Limited feature access

### Custom Roles

Tenants can create custom roles with specific permission combinations:

```json
{
  "name": "Project Manager",
  "description": "Manages projects and client relationships",
  "permissions": [
    "projects.create_projects",
    "projects.update_projects",
    "customers.view_customers",
    "quotes.create_quotes",
    "reports.view_reports"
  ]
}
```

## Multi-Tenant Memberships

### Membership Management

Users can have memberships in multiple tenants with different roles:

```json
{
  "userId": "user-123",
  "memberships": [
    {
      "tenantId": "tenant-a",
      "role": "ADMIN",
      "status": "ACTIVE",
      "joinedAt": "2025-01-15T10:00:00Z"
    },
    {
      "tenantId": "tenant-b", 
      "role": "STAFF",
      "status": "ACTIVE",
      "joinedAt": "2025-02-01T14:30:00Z"
    }
  ]
}
```

### Tenant Switching

Users with multiple memberships can switch between tenants:

#### Frontend Tenant Switcher
- Dropdown showing available tenants
- Current tenant clearly indicated
- Seamless switching without re-login
- Context-aware navigation updates

#### API Tenant Context
```http
POST /api/v1/admin/tenants/{tenant-id}/switch
Authorization: Bearer <current-token>

Response:
{
  "accessToken": "new-jwt-with-tenant-context",
  "refreshToken": "new-refresh-token",
  "tenant": {
    "id": "tenant-uuid",
    "name": "New Tenant Name",
    "slug": "new-tenant"
  }
}
```

### Membership Lifecycle

#### Adding Memberships
```http
POST /api/v1/admin/tenants/{tenant-id}/memberships
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "STAFF",
  "sendNotification": true
}
```

#### Updating Memberships
```http
PATCH /api/v1/admin/tenants/{tenant-id}/memberships/{user-id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "ADMIN",
  "reason": "Promotion to team lead"
}
```

#### Removing Memberships
```http
DELETE /api/v1/admin/tenants/{tenant-id}/memberships/{user-id}
Authorization: Bearer <admin-token>
```

## User Administration

### User Profile Management

#### Personal Information
- **Name**: First name, last name, display name
- **Contact**: Email (primary), phone (optional)
- **Preferences**: Timezone, language, date format
- **Avatar**: Profile picture upload

#### Account Settings
- **Password**: Secure password requirements
- **Two-Factor Authentication**: TOTP, SMS, or hardware keys
- **Session Management**: Active sessions, logout options
- **Notifications**: Email and in-app preferences

### Bulk User Operations

#### CSV Import
```csv
email,firstName,lastName,role,tenantId
john@example.com,John,Doe,STAFF,tenant-123
jane@example.com,Jane,Smith,ADMIN,tenant-123
```

#### Bulk Role Updates
```http
PATCH /api/v1/admin/users/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userIds": ["user-1", "user-2", "user-3"],
  "operation": "updateRole",
  "role": "STAFF",
  "tenantId": "tenant-123"
}
```

### User Search and Filtering

#### Advanced Search
- **Text Search**: Name, email, role
- **Filters**: Status, role, tenant, last login
- **Sorting**: Name, email, created date, last activity
- **Export**: Search results to CSV

#### API Search
```http
GET /api/v1/admin/users?search=john&role=STAFF&status=ACTIVE&tenantId=tenant-123
Authorization: Bearer <admin-token>
```

## Security Features

### Authentication Security

#### Password Requirements
- Minimum 12 characters
- Mixed case letters, numbers, symbols
- No common passwords or personal information
- Regular password expiration (optional)
- Password history to prevent reuse

#### Multi-Factor Authentication
- **TOTP Apps**: Google Authenticator, Authy, 1Password
- **SMS**: Text message verification (backup)
- **Hardware Keys**: YubiKey, WebAuthn support
- **Recovery Codes**: One-time backup codes

### Session Security

#### Session Management
- **Token Expiration**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Longer-lived, revocable tokens
- **Device Tracking**: Monitor active sessions per device
- **Geographic Monitoring**: Detect unusual login locations

#### Security Policies
- **Failed Login Protection**: Account lockout after attempts
- **Concurrent Sessions**: Limit active sessions per user
- **Idle Timeout**: Automatic logout after inactivity
- **IP Restrictions**: Allow/deny lists for admin users

### Audit and Compliance

#### User Activity Logging
```json
{
  "timestamp": "2025-09-20T10:30:00Z",
  "userId": "user-123",
  "tenantId": "tenant-456",
  "action": "user.role.updated",
  "details": {
    "targetUserId": "user-789",
    "oldRole": "STAFF",
    "newRole": "ADMIN",
    "reason": "Promotion"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

#### Compliance Features
- **GDPR**: Right to be forgotten, data portability
- **SOX**: Financial data access controls
- **HIPAA**: Healthcare data protection (if applicable)
- **Audit Reports**: Automated compliance reporting

## API Integration

### User Management APIs

#### Create User
```http
POST /api/v1/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF",
  "tenantId": "tenant-uuid"
}
```

#### Get User Details
```http
GET /api/v1/admin/users/{user-id}
Authorization: Bearer <admin-token>

Response:
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "ACTIVE",
  "memberships": [...],
  "lastLogin": "2025-09-20T09:15:00Z",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### Update User
```http
PATCH /api/v1/admin/users/{user-id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Jonathan",
  "timezone": "America/Los_Angeles",
  "status": "ACTIVE"
}
```

### Membership APIs

#### List User Memberships
```http
GET /api/v1/admin/users/{user-id}/memberships
Authorization: Bearer <admin-token>

Response:
{
  "memberships": [
    {
      "tenantId": "tenant-123",
      "tenantName": "Acme Corp",
      "role": "ADMIN",
      "status": "ACTIVE",
      "joinedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Add Membership
```http
POST /api/v1/admin/users/{user-id}/memberships
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "tenantId": "tenant-uuid",
  "role": "STAFF"
}
```

## Best Practices

### For Platform Administrators

#### User Provisioning
1. **Standardized Onboarding**: Consistent user creation process
2. **Role Templates**: Pre-defined role combinations
3. **Automated Workflows**: Integration with HR systems
4. **Security Defaults**: Secure-by-default configurations

#### Security Management
1. **Regular Audits**: Monthly access reviews
2. **Principle of Least Privilege**: Minimum required permissions
3. **Separation of Duties**: No single user with excessive access
4. **Monitoring**: Real-time security alerts

### For Tenant Administrators

#### User Management
1. **Clear Role Definitions**: Document role responsibilities
2. **Regular Reviews**: Quarterly access audits
3. **Offboarding Process**: Immediate access revocation
4. **Training**: User security awareness

#### Access Control
1. **Role-Based Access**: Use roles instead of individual permissions
2. **Temporary Access**: Time-limited elevated permissions
3. **Guest Access**: Limited access for external users
4. **Project-Based Access**: Scope access to specific projects

### For End Users

#### Account Security
1. **Strong Passwords**: Use password managers
2. **Enable MFA**: Multi-factor authentication
3. **Regular Updates**: Keep contact information current
4. **Session Hygiene**: Log out from shared devices

#### Privacy Protection
1. **Profile Information**: Limit public information
2. **Activity Awareness**: Monitor account activity
3. **Suspicious Activity**: Report unusual behavior
4. **Data Requests**: Use self-service data export

## Troubleshooting

### Common Issues

#### Login Problems
```
Issue: User cannot log in
Checks:
- Account status (active/suspended)
- Email verification status
- Password reset requirements
- MFA configuration
- IP restrictions
```

#### Permission Errors
```
Issue: User cannot access features
Checks:
- Current tenant context
- Role assignments
- Permission mappings
- Feature toggles for tenant
- Session validity
```

#### Multi-Tenant Issues
```
Issue: Cannot switch between tenants
Checks:
- Active memberships
- Membership status
- Tenant status
- Token validity
- Browser cache/cookies
```

### Diagnostic Tools

#### User Information Query
```sql
SELECT 
  u.email,
  u.status,
  t.name as tenant_name,
  m.role,
  m.created_at as membership_created
FROM users u
LEFT JOIN memberships m ON u.id = m.user_id
LEFT JOIN tenants t ON m.tenant_id = t.id
WHERE u.email = 'user@example.com';
```

#### Session Debugging
```http
GET /api/v1/auth/debug
Authorization: Bearer <user-token>

Response:
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "currentTenant": "tenant-uuid"
  },
  "token": {
    "issuedAt": "2025-09-20T10:00:00Z",
    "expiresAt": "2025-09-20T10:15:00Z",
    "permissions": ["..."]
  }
}
```

### Support Escalation

#### Information to Collect
1. **User Details**: Email, tenant, role
2. **Error Messages**: Exact error text and codes
3. **Browser Information**: Version, console errors
4. **Steps to Reproduce**: Detailed sequence
5. **Expected Behavior**: What should happen

#### Log Analysis
- Authentication logs
- Authorization logs
- Application error logs
- Database query logs
- Session management logs

---

## Related Documentation

- [Multi-Tenancy System](./multi-tenancy.md) - Tenant architecture and isolation
- [Permissions & Entitlements](./permissions-entitlements.md) - Access control details
- [Security Guide](../security/PASETO-Migration-Plan.md) - Advanced security features
- [API Documentation](./api-usage.md) - Complete API reference

---

*Last Updated: September 2025*
*Version: 1.0.0*
