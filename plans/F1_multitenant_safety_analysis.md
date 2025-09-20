# F1 Multitenant Foundations & API Safety - Analysis

## 🔍 **CURRENT STATE ANALYSIS**

### **Authentication Model**
**Current Implementation:**
- JWT-based authentication with `sub` (userId) and `org` (organizationId) claims
- Auth plugin in `apps/backend/src/modules/auth/plugin.auth.ts` handles verification
- User context attached to requests: `{ userId, organizationId, roles, permissions, jti }`
- Frontend auth store in `apps/frontend/src/features/auth/store.ts` with Zustand persistence

**Issues Identified:**
- ❌ Super admin bypass logic exists in permission checking
- ❌ JWT contains single `org` claim - no multi-tenant membership support
- ❌ No explicit tenant switching mechanism with new token generation
- ❌ Frontend can switch tenants without backend validation

### **Current Tenancy Model**
**Current Implementation:**
- Organizations table serves as tenants (`apps/backend/src/lib/schema.ts`)
- Single organization per user via `users.organizationId` foreign key
- Tenant context via `X-Tenant-ID` header and `request.tenantId`
- TenantSwitcher component allows frontend tenant switching

**Critical Security Gaps:**
- ❌ **Super admin cross-tenant access**: `system.super_admin` permission bypasses tenant scoping
- ❌ **Client-driven tenant selection**: Frontend can set any tenant ID via header
- ❌ **No membership validation**: Users can access any tenant without membership checks
- ❌ **Single-tenant JWT**: Token doesn't validate tenant membership

### **Public Portal Tenancy**
**Current E13 Implementation:**
- Public quote tokens: `{orgHash}{randomPart}` (30 chars)
- Token lookup via `quotes.publicToken` field
- Basic tenant isolation via organization hash validation

**Security Concerns:**
- ⚠️ Token doesn't encode tenant ID explicitly
- ⚠️ No subdomain support for vanity domains
- ⚠️ Limited tenant context verification in public routes

### **Data Model Gaps**
**Missing Tables:**
- ❌ **`tenants`**: Proper tenant entity separate from organizations
- ❌ **`memberships`**: User-tenant relationships with roles
- ❌ **`tenant_features`**: SaaS service allow-listing per tenant

**Missing Fields:**
- ❌ **`tenant_id`** on domain tables (customers, quotes, projects, etc.)
- ❌ **Tenant status** (ACTIVE/SUSPENDED)
- ❌ **Feature flags** per tenant

## 🎯 **F1 REQUIREMENTS ANALYSIS**

### **1. Remove Super Admin Cross-Tenant Access**
**Current Violations:**
```typescript
// apps/frontend/src/features/auth/store.ts
hasPermission: (permission: string) => {
  // Super admin bypass - MUST BE REMOVED
  if (user?.roles?.includes('super_admin')) return true;
}

// apps/backend/src/plugins/permission-check.ts  
// Super admin bypass logic - MUST BE REMOVED
if (user.permissions.includes('system.super_admin')) {
  return; // Skip permission check
}
```

**Required Changes:**
- Remove all `system.super_admin` bypass logic
- Implement explicit tenant switching with new JWT generation
- Validate tenant membership for all access

### **2. Tenant Administration Portal**
**Required Components:**
- **Backend APIs**: Tenant CRUD, membership management, feature toggles
- **Frontend Portal**: `/admin/tenants` routes with management interface
- **Tenant Switching**: New JWT generation per tenant switch
- **Role Management**: OWNER/ADMIN/STAFF/VIEWER within tenants

### **3. Harden Public Portal Tenancy**
**Token-Driven Tenancy (Pattern A):**
```typescript
// Required token structure
interface PublicQuoteToken {
  tenantId: string;    // UUID
  quoteId: string;     // UUID  
  exp: number;         // Unix seconds
  orgHash: string;     // HMAC validation
}
```

**Security Requirements:**
- Token must encode tenant context explicitly
- HMAC validation: `HMAC(tenantId|quoteId|exp|SECRET)`
- All queries: `WHERE tenant_id = $tenantId AND id = $quoteId`
- No tenant discovery possible

### **4. SaaS Services Catalogue**
**Feature Gating System:**
```typescript
// Required features
const SAAS_FEATURES = [
  'Quotes', 'Invoices', 'CustomerPortal', 
  'RateCards', 'Gantt', 'TimeTracking'
];

// Per-tenant allow-list
tenant_features: {
  tenant_id: uuid,
  feature_code: string,
  enabled: boolean
}
```

## 🗄️ **DATABASE MIGRATION PLAN**

### **New Tables Required**
```sql
-- 1. Tenants (replaces organizations as tenant entity)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE'|'SUSPENDED'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Memberships (user-tenant relationships)
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'OWNER'|'ADMIN'|'STAFF'|'VIEWER'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 3. Tenant Features (SaaS allow-list)
CREATE TABLE tenant_features (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_code VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, feature_code)
);
```

### **Schema Modifications Required**
```sql
-- Add tenant_id to all domain tables
ALTER TABLE customers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE quotes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE time_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- ... (all domain tables)

-- Add indexes for performance
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_quotes_tenant_id ON quotes(tenant_id);
-- ... (all domain tables)
```

## 🔐 **SECURITY ARCHITECTURE**

### **JWT Token Structure (New)**
```typescript
interface JWTPayload {
  sub: string;        // User ID
  tenantId: string;   // Current active tenant
  memberships: {      // All user memberships
    tenantId: string;
    role: string;
  }[];
  permissions: string[]; // Permissions for current tenant only
  exp: number;
  iat: number;
}
```

### **Public Token Structure (Enhanced)**
```typescript
interface PublicQuoteToken {
  tenantId: string;    // Explicit tenant binding
  quoteId: string;     // Resource ID
  exp: number;         // Expiration
  orgHash: string;     // HMAC(tenantId|quoteId|exp|SECRET)
}
```

### **Row Level Security (Optional)**
```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY tenant_isolation ON customers 
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## 🚨 **SECURITY VULNERABILITIES TO FIX**

### **Critical Issues**
1. **Cross-Tenant Data Leakage**: Super admin can access any tenant's data
2. **Client-Controlled Tenancy**: Frontend can switch tenants without validation
3. **Privilege Escalation**: Super admin bypass circumvents all security
4. **Token Replay**: No tenant validation in JWT verification

### **Medium Issues**
1. **Feature Bypass**: No SaaS service gating per tenant
2. **Public Token Weakness**: Tenant context not explicitly encoded
3. **Audit Gaps**: Cross-tenant access not logged

## 🏗️ **IMPLEMENTATION STRATEGY**

### **Phase 1: Data Model Foundation**
1. Create new tables: `tenants`, `memberships`, `tenant_features`
2. Add `tenant_id` to all domain tables with indexes
3. Migrate existing `organizations` data to `tenants`
4. Create initial memberships for existing users

### **Phase 2: Authentication Hardening**
1. Remove all super admin bypass logic
2. Implement tenant membership validation
3. Enhance JWT with membership claims
4. Add tenant switching API with new token generation

### **Phase 3: Public Portal Security**
1. Enhance public token structure with explicit tenant ID
2. Implement HMAC validation for token integrity
3. Add tenant context validation to all public routes
4. Optional: Subdomain support for vanity domains

### **Phase 4: SaaS Feature Gating**
1. Implement feature flag system per tenant
2. Add middleware for feature requirement checking
3. Update frontend to hide disabled features
4. Add tenant admin portal for feature management

### **Phase 5: Admin Portal**
1. Create tenant management interface
2. Implement membership CRUD operations
3. Add feature toggle interface
4. Implement secure tenant switching

## 🧪 **TESTING STRATEGY**

### **Security Tests Required**
1. **Cross-tenant isolation**: User in Tenant A cannot access Tenant B data
2. **Public token security**: Altered tokens rejected, no tenant discovery
3. **Feature gating**: Disabled features return 404/403
4. **Tenant switching**: Only valid memberships allowed
5. **Super admin removal**: No bypass logic remaining

### **Integration Tests**
1. **E2E tenant workflows**: Create → manage → switch → validate isolation
2. **Public portal tenancy**: Generate link → access → approve (same tenant only)
3. **Admin portal**: Manage tenants, memberships, features
4. **Feature gates**: Enable/disable → frontend/backend behavior changes

## 📊 **MIGRATION COMPLEXITY**

### **High Risk Areas**
- **Data Migration**: Existing organizations → tenants + memberships
- **JWT Changes**: Breaking change to authentication flow
- **Super Admin Removal**: May break existing admin workflows
- **Schema Changes**: Adding tenant_id to all tables requires careful backfill

### **Low Risk Areas**
- **Feature Flags**: Additive functionality
- **Public Token Enhancement**: Backward compatible with proper versioning
- **Admin Portal**: New functionality, no existing dependencies

## 🎯 **SUCCESS CRITERIA**

### **Security Goals**
- ✅ **Zero cross-tenant data access** without explicit membership
- ✅ **No super admin bypass** - all access via tenant membership
- ✅ **Secure public tokens** with tenant binding and HMAC validation
- ✅ **Feature gating** enforced at API and UI levels

### **Functional Goals**
- ✅ **Tenant admin portal** for complete tenant lifecycle management
- ✅ **Seamless tenant switching** with proper token rotation
- ✅ **SaaS service catalog** with per-tenant feature control
- ✅ **Public portal hardening** with strict tenancy resolution

### **Operational Goals**
- ✅ **Zero downtime migration** with backward compatibility
- ✅ **Performance optimization** with proper indexing
- ✅ **Audit compliance** with complete access logging
- ✅ **Developer experience** with clear APIs and documentation

---

## 🚀 **IMPLEMENTATION READINESS**

The F1 Multitenant Safety implementation requires significant architectural changes to remove super admin privileges and implement proper tenant isolation. The analysis reveals critical security vulnerabilities that must be addressed through a comprehensive multitenant foundation rebuild.

**Next Step**: Begin Phase 1 implementation with data model foundation and migration strategy.
