# F1A Tenant Admin Portal User Manual

**Document Type**: User Manual  
**Feature**: F1A Tenant Admin Portal  
**Date**: January 2025  
**Status**: ✅ IMPLEMENTED  

## Overview

The F1A Tenant Admin Portal provides platform administrators with secure tenant management capabilities. This portal allows authorized administrators to create, manage, and monitor tenants across the Pivotal Flow platform without compromising tenant data isolation.

## Security Model

### Access Requirements
- **Platform Administrator Role**: `system.super_admin` permission required
- **Authentication**: PASETO v4 token-based authentication
- **Rate Limiting**: 50 operations per 5 minutes for admin users
- **Audit Trail**: All operations are logged with comprehensive audit records

### Security Guarantees
- **No Tenant Data Access**: Admin portal operates on tenant metadata only
- **Zero Cross-Tenant Risk**: Impossible to access tenant business data
- **Complete Isolation**: Admin operations are isolated from tenant contexts
- **Full Audit Trail**: Every operation is logged for security compliance

## Portal Access

### URL Structure
```
Frontend Routes:
├── /admin                    → Main admin portal (redirects to /admin/tenants)
├── /admin/tenants           → Tenant list and management
└── /admin/tenants/:id       → Tenant detail view (via tabs)

Backend API Endpoints:
├── GET    /api/v1/admin/tenants              → List tenants
├── POST   /api/v1/admin/tenants              → Create tenant
├── GET    /api/v1/admin/tenants/:id          → Get tenant details
├── PATCH  /api/v1/admin/tenants/:id          → Update tenant
├── POST   /api/v1/admin/tenants/:id/users    → Add user membership
├── DELETE /api/v1/admin/tenants/:id/users/:membershipId → Remove membership
└── GET    /api/v1/admin/health               → Admin portal health check
```

### Authentication Flow
1. User must be authenticated with valid PASETO token
2. Platform admin permission (`system.super_admin`) is verified
3. Admin-specific rate limiting is applied (50 ops/5min)
4. All operations are logged for audit compliance

## Features

### 1. Tenant List Management

#### Tenant List Table
- **Pagination**: 20 tenants per page (configurable)
- **Search**: Search by tenant name, slug, or billing email
- **Filtering**: Filter by status (Active, Suspended, All)
- **Sorting**: Sort by name, creation date, or membership count
- **Actions**: View, Edit, Suspend/Reactivate tenants

#### Displayed Information
- Tenant name and URL slug
- Billing email address
- Default currency and timezone
- Current status (Active/Suspended)
- Number of users (membership count)
- Creation date

### 2. Tenant Creation

#### Create Tenant Form
- **Tenant Name**: Display name for the tenant (1-255 characters)
- **Tenant Slug**: URL-safe identifier (lowercase, numbers, hyphens only)
- **Billing Email**: Primary billing contact (email validation)
- **Default Currency**: ISO 4217 currency code (USD, EUR, GBP, etc.)
- **Timezone**: IANA timezone identifier (UTC, America/New_York, etc.)

#### Validation Rules
- Name: Required, 1-255 characters
- Slug: Required, 1-100 characters, must be unique, lowercase alphanumeric with hyphens
- Billing Email: Required, valid email format
- Currency: Required, 3-character ISO 4217 code
- Timezone: Required, valid IANA timezone identifier

#### Auto-Generation
- Slug is automatically generated from tenant name during creation
- Can be manually edited before submission
- Uniqueness is validated server-side

### 3. Tenant Editing

#### Editable Fields
- Tenant name
- Tenant slug (with uniqueness validation)
- Billing email
- Default currency
- Timezone
- Status (Active/Suspended)

#### Business Rules
- Slug changes require uniqueness validation
- Status changes are audited and logged
- Currency changes affect new transactions only
- Timezone changes affect date/time display

### 4. Membership Management

#### User Membership Table
- **User Information**: Name, email, user ID (partial)
- **Role Assignment**: Owner, Admin, Staff, Viewer
- **Join Date**: When user was added to tenant
- **Actions**: Remove user from tenant

#### Role Hierarchy
- **Owner** 👑: Full tenant control and billing access
- **Admin** 🛡️: Administrative access and user management
- **Staff** 👤: Standard user access with content creation
- **Viewer** 👁️: Read-only access to tenant data

#### Add User Membership
- **User Email**: Email of existing user to add
- **Role Selection**: Choose appropriate role for user
- **Validation**: User must exist in system
- **Uniqueness**: User can only have one membership per tenant

#### Remove Membership
- **Protection**: Cannot remove last owner from tenant
- **Confirmation**: Requires explicit confirmation
- **Immediate Effect**: Access is revoked immediately
- **Audit Trail**: Removal is logged for compliance

### 5. Tenant Statistics

#### Overview Metrics
- **Total Users**: All users with membership in tenant
- **Active Users**: Users with Owner, Admin, or Staff roles
- **Total Quotes**: Count of quotes in tenant (metadata only)
- **Total Invoices**: Count of invoices in tenant (metadata only)
- **Total Revenue**: Sum of paid invoices (aggregated, no detail access)

#### Data Privacy
- Statistics show counts and aggregates only
- No access to actual business data or content
- Revenue shown as total only, no transaction details
- User information limited to name and email

## User Interface

### Navigation
1. **Login** to Pivotal Flow with platform admin credentials
2. **Navigate** to Admin section in main navigation
3. **Access** tenant management portal
4. **Switch** between tenant list and detail views using tabs

### Tenant List View
- **Search Bar**: Real-time search across tenant metadata
- **Status Filter**: Dropdown to filter by tenant status
- **Sortable Columns**: Click column headers to sort
- **Action Buttons**: View, Edit, Suspend/Reactivate for each tenant
- **Pagination Controls**: Navigate through multiple pages

### Tenant Detail View
- **Tenant Overview**: Basic tenant information and status
- **Statistics Dashboard**: Tenant metrics and user counts
- **Membership Table**: Manage user access and roles
- **Add User Form**: Add existing users to tenant
- **Remove User Actions**: Remove users with confirmation

### Responsive Design
- **Desktop**: Full table view with all columns
- **Tablet**: Condensed view with essential columns
- **Mobile**: Card-based layout with expandable details

## Error Handling

### User-Friendly Messages
- **Permission Denied**: Clear message about admin access requirement
- **Validation Errors**: Specific field-level error messages
- **Network Errors**: Graceful handling with retry options
- **Rate Limiting**: Clear message about operation limits

### Error Recovery
- **Automatic Retry**: Failed requests are retried automatically
- **Manual Refresh**: Users can manually refresh data
- **Error Boundaries**: Component-level error isolation
- **Graceful Degradation**: Partial functionality during errors

## Security Features

### Access Control
- **Authentication Required**: Must be logged in to access portal
- **Permission Verification**: Platform admin role checked on every request
- **Session Management**: Automatic session timeout and renewal
- **Activity Monitoring**: All admin actions are monitored and logged

### Data Protection
- **No Sensitive Data**: Admin portal shows metadata only
- **Audit Logging**: Complete trail of all admin operations
- **Rate Limiting**: Protection against abuse or automated attacks
- **Error Sanitization**: No sensitive data in error messages

### Privacy Compliance
- **Data Minimization**: Only essential data is displayed
- **User Privacy**: Limited user information in membership views
- **Audit Compliance**: All operations logged for regulatory requirements
- **Access Logging**: Admin access attempts are monitored

## Troubleshooting

### Common Issues

#### "Platform admin access required"
- **Cause**: User lacks `system.super_admin` permission
- **Solution**: Contact system administrator to grant platform admin role
- **Note**: This is a security feature to protect tenant data

#### "Rate limit exceeded"
- **Cause**: More than 50 operations in 5 minutes
- **Solution**: Wait for rate limit to reset (5 minutes)
- **Prevention**: Avoid rapid-fire operations

#### "Tenant slug already exists"
- **Cause**: Attempting to create/update tenant with existing slug
- **Solution**: Choose a different, unique slug
- **Note**: Slugs must be unique across the entire platform

#### "Cannot remove last owner"
- **Cause**: Attempting to remove the only owner from a tenant
- **Solution**: Add another owner before removing current owner
- **Note**: Tenants must have at least one owner at all times

### Support Escalation
- **Technical Issues**: Contact development team
- **Permission Issues**: Contact system administrator
- **Security Concerns**: Contact security team immediately
- **Data Issues**: Contact data protection officer

## Best Practices

### Tenant Management
- **Unique Slugs**: Use descriptive, unique slugs for easy identification
- **Billing Emails**: Use dedicated billing email addresses
- **Regular Reviews**: Periodically review tenant memberships
- **Status Management**: Suspend inactive tenants to maintain security

### User Management
- **Role Assignment**: Assign minimal necessary roles
- **Regular Audits**: Review user memberships quarterly
- **Offboarding**: Remove users immediately upon departure
- **Owner Management**: Maintain at least 2 owners per tenant

### Security Practices
- **Session Management**: Log out when finished with admin tasks
- **Activity Monitoring**: Review audit logs regularly
- **Error Reporting**: Report security concerns immediately
- **Access Reviews**: Conduct regular access reviews

## Compliance Notes

### Audit Requirements
- All admin operations are logged
- Audit logs are tamper-evident
- Logs include admin identity and operation details
- Retention period follows compliance requirements

### Data Protection
- Admin portal complies with GDPR data minimization
- User privacy is protected in admin interfaces
- No sensitive business data is accessible
- Data access is logged for compliance

### Security Standards
- Implements zero-trust security model
- Follows principle of least privilege
- Provides complete audit trail
- Maintains tenant data isolation

---

## Quick Reference

### Keyboard Shortcuts
- **Search**: Focus search bar with `/`
- **Create**: `Ctrl/Cmd + N` to create new tenant
- **Refresh**: `F5` to refresh current view
- **Navigation**: `Tab` to navigate between elements

### API Rate Limits
- **Admin Operations**: 50 operations per 5 minutes
- **Search Queries**: Included in operation count
- **Health Checks**: Not counted against limit

### Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Validation error
- **403**: Insufficient permissions
- **404**: Resource not found
- **409**: Conflict (e.g., slug exists)
- **429**: Rate limit exceeded
- **500**: Server error

---

*Last Updated: January 2025*  
*Next Review: April 2025*  
*Document Owner: Platform Team*

