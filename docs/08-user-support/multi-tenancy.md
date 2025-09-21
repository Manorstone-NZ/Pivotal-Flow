# Multi-Tenancy System

Pivotal Flow is built as a Software-as-a-Service (SaaS) platform with comprehensive multi-tenancy support, allowing multiple organizations (tenants) to securely share the same application instance while maintaining complete data isolation.

## Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Tenant Management](#tenant-management)
- [Data Isolation](#data-isolation)
- [Security Model](#security-model)
- [API Integration](#api-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### What is Multi-Tenancy?

Multi-tenancy is an architecture where a single instance of the software serves multiple customers (tenants). Each tenant's data is isolated and remains invisible to other tenants, while all tenants share the same application instance, database, and infrastructure.

### Benefits

- **Cost Efficiency**: Shared infrastructure reduces operational costs
- **Scalability**: Centralized updates and maintenance
- **Security**: Strict data isolation between tenants
- **Customization**: Per-tenant feature configuration
- **Compliance**: Tenant-specific data governance

## Key Concepts

### Tenants

A **tenant** represents a distinct organization or customer using the Pivotal Flow platform. Each tenant has:

- Unique identifier (UUID)
- Organization name and slug
- Billing information
- Feature configuration
- User memberships
- Isolated data

### Organizations vs Tenants

- **Tenant**: The top-level isolation boundary in the F1 multi-tenant system
- **Organization**: Legacy concept, now mapped to tenants for backward compatibility
- **Agency**: Business term often used interchangeably with tenant

### Memberships

Users can belong to multiple tenants through **memberships**, each with specific roles:

- `OWNER`: Full administrative control
- `ADMIN`: Administrative privileges within the tenant
- `STAFF`: Standard user access
- `VIEWER`: Read-only access

## Tenant Management

### Creating Tenants

Platform administrators can create new tenants through the admin portal:

```http
POST /api/v1/admin/tenants
Content-Type: application/json
Authorization: Bearer <platform-admin-token>

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "billing_email": "billing@acme.com",
  "default_currency": "USD",
  "timezone": "America/New_York"
}
```

### Tenant Configuration

Each tenant can be configured with:

#### Basic Information
- **Name**: Display name for the tenant
- **Slug**: URL-friendly identifier
- **Billing Email**: Primary contact for billing
- **Currency**: Default currency for financial operations
- **Timezone**: Default timezone for date/time operations

#### Status Management
- **ACTIVE**: Tenant is operational
- **SUSPENDED**: Tenant access is temporarily disabled

#### Feature Toggles
Control which features are available to each tenant:

```json
{
  "CustomerPortal": true,
  "Quotes": true,
  "RateCards": true,
  "TimeTracking": false,
  "Invoicing": true,
  "Reporting": true
}
```

### Managing Memberships

Add users to tenants with specific roles:

```http
POST /api/v1/admin/tenants/{tenant-id}/memberships
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "user_id": "user-uuid",
  "role": "ADMIN"
}
```

## Data Isolation

### Database-Level Isolation

All domain tables include a `tenant_id` column ensuring complete data separation:

```sql
-- Example: Customers table with tenant isolation
SELECT * FROM customers 
WHERE tenant_id = $current_tenant_id;

-- All queries automatically include tenant filtering
```

### Row-Level Security (RLS)

Optional but recommended PostgreSQL RLS policies:

```sql
-- Enable RLS on all tenant tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation ON customers
  USING (tenant_id = current_setting('app.org_id')::uuid);
```

### API-Level Isolation

Every API request includes tenant context:

1. **JWT Token**: Contains `tenantId` and user memberships
2. **Request Headers**: `X-Tenant-ID` header (optional)
3. **Query Filtering**: All database queries include tenant filtering
4. **Response Scoping**: Only tenant-specific data returned

## Security Model

### Authentication & Authorization

1. **User Login**: Standard email/password authentication
2. **JWT Generation**: Token includes tenant memberships
3. **Tenant Switching**: Generate new JWT for different tenant context
4. **Permission Checking**: Role-based permissions within tenant scope

### Tenant Switching

Users with multiple memberships can switch between tenants:

```http
POST /api/v1/admin/tenants/{tenant-id}/switch
Authorization: Bearer <current-token>

Response:
{
  "accessToken": "new-jwt-with-tenant-context",
  "tenant": {
    "id": "tenant-uuid",
    "name": "New Tenant Name"
  }
}
```

### Public Portal Security

Customer-facing features use secure token-based access:

- **Signed Tokens**: Include tenant context and expiration
- **HMAC Verification**: Prevent token tampering
- **Tenant Scoping**: Public URLs can't discover other tenants
- **Rate Limiting**: Per-tenant rate limits on public endpoints

## API Integration

### Tenant-Aware API Calls

All private API endpoints require tenant context:

```javascript
// Frontend API client automatically includes tenant context
const customers = await apiClient.get('/v1/customers');

// Backend automatically filters by tenant
app.get('/v1/customers', async (request, reply) => {
  const tenantId = request.user.tenantId;
  return customerService.list({ tenantId });
});
```

### Public API Endpoints

Public endpoints use token-based tenant resolution:

```http
GET /public/quotes/eyJhbGc...signed-token
# Token contains: { tenantId, quoteId, exp, orgHash }
```

### Webhook Delivery

Webhooks are tenant-scoped:

```json
{
  "event": "quote.delivered",
  "tenant_id": "tenant-uuid",
  "data": {
    "quote_id": "quote-uuid",
    "delivered_at": "2025-09-20T10:30:00Z"
  }
}
```

## Best Practices

### For Platform Administrators

1. **Tenant Creation**:
   - Use meaningful slugs (URL-friendly)
   - Configure appropriate feature toggles
   - Set up billing information early

2. **User Management**:
   - Assign minimum required permissions
   - Use OWNER role sparingly
   - Regular access reviews

3. **Monitoring**:
   - Track tenant usage metrics
   - Monitor cross-tenant data access (should be zero)
   - Audit permission changes

### For Tenant Administrators

1. **User Onboarding**:
   - Create users with appropriate roles
   - Provide training on tenant-specific features
   - Document internal processes

2. **Data Management**:
   - Regular data backups (tenant-specific)
   - Monitor data usage and growth
   - Implement data retention policies

3. **Security**:
   - Regular password policy enforcement
   - Monitor user access patterns
   - Report suspicious activities

### For Developers

1. **API Development**:
   - Always include tenant filtering in queries
   - Never bypass tenant context
   - Test with multiple tenant scenarios

2. **Frontend Development**:
   - Handle tenant switching gracefully
   - Clear cached data on tenant switch
   - Show tenant context in UI

3. **Testing**:
   - Test cross-tenant data isolation
   - Verify permission boundaries
   - Test public portal security

## Troubleshooting

### Common Issues

#### "No tenant context" Errors
```
Error: Request missing tenant context
Solution: Ensure JWT token includes tenant information
```

#### Cross-Tenant Data Leakage
```
Issue: User sees data from wrong tenant
Check: Verify tenant filtering in database queries
Check: Confirm JWT token has correct tenant context
```

#### Permission Denied on Tenant Switch
```
Error: User cannot switch to tenant
Check: Verify user has membership in target tenant
Check: Confirm membership is active
```

#### Public Portal Access Issues
```
Issue: Public quote link not working
Check: Verify token signature and expiration
Check: Confirm tenant feature toggles
Check: Test token generation process
```

### Debugging Tools

#### Check User Memberships
```sql
SELECT u.email, t.name as tenant_name, m.role, m.created_at
FROM users u
JOIN memberships m ON u.id = m.user_id
JOIN tenants t ON m.tenant_id = t.id
WHERE u.email = 'user@example.com';
```

#### Verify Tenant Data Isolation
```sql
-- Should return 0 for proper isolation
SELECT COUNT(*) as cross_tenant_data
FROM customers c1, customers c2
WHERE c1.tenant_id != c2.tenant_id
AND c1.id = c2.id;
```

#### Test JWT Token Contents
```javascript
// Decode JWT to inspect tenant context
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token);
console.log('Tenant ID:', decoded.tenantId);
console.log('Memberships:', decoded.memberships);
```

### Support Escalation

For complex multi-tenancy issues:

1. **Collect Information**:
   - User email and tenant slug
   - Error messages and timestamps
   - Steps to reproduce

2. **Check Logs**:
   - Backend application logs
   - Database query logs
   - Authentication logs

3. **Contact Support**:
   - Include tenant context in all support requests
   - Provide user membership details
   - Document expected vs actual behavior

---

## Related Documentation

- [User Management](./user-management.md) - Managing users within tenants
- [Permissions & Entitlements](./permissions-entitlements.md) - Role-based access control
- [API Documentation](./api-usage.md) - Tenant-aware API integration
- [Security Guide](./security.md) - Advanced security considerations

---

*Last Updated: September 2025*
*Version: 1.0.0*
