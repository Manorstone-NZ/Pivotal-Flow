# Database Schema Reference

## Overview

This document provides the complete database schema reference for the Pivotal Flow application after implementing the JSONB Decision Matrix. The schema has been designed to balance structured, queryable data with flexible JSONB storage for customization and metadata.

## Design Principles

1. **Normalized Critical Fields**: Core business data (addresses, contact info, preferences) are stored in typed columns
2. **JSONB for Flexibility**: Used only for metadata, settings, and flexible configuration
3. **Proper Indexing**: B-tree indexes for structured columns, GIN indexes for JSONB fields
4. **Data Integrity**: CHECK constraints, foreign key relationships, and validation rules
5. **Performance**: Efficient querying on structured fields while maintaining flexibility

## Core Tables

### 1. Organizations Table

**Purpose**: Central entity representing business organizations using the system

```sql
organizations (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  taxId VARCHAR(100),
  
  -- Normalized Address Fields
  street TEXT,
  suburb TEXT,
  city TEXT,
  region TEXT,
  postcode TEXT,
  country TEXT,
  
  -- Normalized Contact Fields
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  
  -- JSONB for Flexible Data
  contactExtras JSONB, -- Social links, secondary channels
  settings JSONB NOT NULL DEFAULT '{}', -- Feature-specific payloads
  
  subscriptionPlan VARCHAR(50) NOT NULL DEFAULT 'basic',
  subscriptionStatus VARCHAR(20) NOT NULL DEFAULT 'active',
  trialEndsAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
)
```

**Indexes**:
- `idx_organizations_address` on (street, city, country)
- `idx_organizations_contact` on (phone, email)

**Constraints**:
- Phone format validation: `^[+]?[0-9\s\-\(\)]+$`
- Email format validation: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- **Note**: Consider adding ISO 4217 currency code validation for better data integrity

### 2. Organization Settings Tables

#### 2.1 Security Policies
```sql
org_security_policies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  min_password_length INTEGER NOT NULL DEFAULT 12,
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  session_timeout_minutes INTEGER NOT NULL DEFAULT 60,
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  password_expiry_days INTEGER,
  extras JSONB, -- Flexible additional security settings
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Unique Constraints**: `org_security_policies_org_unique` on (org_id)

#### 2.2 Feature Flags
```sql
org_feature_flags (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  payload JSONB, -- Feature-specific configuration
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, flag_key)
)
```

**Unique Constraints**: `org_feature_flags_org_flag_unique` on (org_id, flag_key)

#### 2.3 Notification Preferences
```sql
org_notification_prefs (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email','sms','push')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB, -- Channel-specific notification settings
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, channel)
)
```

**Unique Constraints**: `org_notification_prefs_org_channel_unique` on (org_id, channel)

#### 2.4 Flexible Settings Store
```sql
org_settings (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL, -- Flexible value storage
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, key)
)
```

**Unique Constraints**: `org_settings_org_key_unique` on (org_id, key)
**Constraints**: `value_is_valid` - ensures value is valid JSONB type

**Note**: Monitor key usage patterns. Consider splitting stable semantic keys (e.g., invoice templates, brand configurations) into dedicated tables as reporting and governance requirements grow.

### 3. Users Table

**Purpose**: System users with normalized preferences and flexible metadata

```sql
users (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  displayName VARCHAR(200),
  avatarUrl TEXT,
  phone VARCHAR(20),
  
  -- Normalized Preference Fields
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  locale VARCHAR(10) NOT NULL DEFAULT 'en-NZ',
  dateFormat VARCHAR(20) NOT NULL DEFAULT 'DD MMM YYYY',
  timeFormat VARCHAR(10) NOT NULL DEFAULT '24h',
  
  -- JSONB for Flexible Preferences
  preferences JSONB NOT NULL DEFAULT '{}', -- Dashboard layout, UI tweaks
  metadata JSONB NOT NULL DEFAULT '{}', -- Custom fields per customer
  
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  emailVerifiedAt TIMESTAMP,
  lastLoginAt TIMESTAMP,
  loginCount INTEGER NOT NULL DEFAULT 0,
  failedLoginAttempts INTEGER NOT NULL DEFAULT 0,
  lockedUntil TIMESTAMP,
  passwordHash VARCHAR(255),
  mfaEnabled BOOLEAN NOT NULL DEFAULT false,
  mfaSecret VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
)
```

### 4. Permissions and Roles Tables

#### 4.1 Permissions
```sql
permissions (
  id TEXT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Unique Constraints**: `permissions_action_resource_unique` on (action, resource)

#### 4.2 Roles
```sql
roles (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  isSystem BOOLEAN NOT NULL DEFAULT false,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Unique Constraints**: `roles_organization_name_unique` on (organizationId, name)

#### 4.3 Role Permissions Junction
```sql
role_permissions (
  id TEXT PRIMARY KEY,
  roleId TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permissionId TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Unique Constraints**: `role_permissions_role_permission_unique` on (roleId, permissionId)

#### 4.4 User Roles Junction
```sql
user_roles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roleId TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignedBy TEXT REFERENCES users(id) ON DELETE SET NULL,
  assignedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT true
)
```

#### 4.5 Policy Overrides
```sql
policy_overrides (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  roleId TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL, -- Added action column for proper scoping
  policy JSONB NOT NULL, -- Keep JSONB for policy conditions
  description TEXT,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Unique Constraints**: `policy_overrides_org_role_resource_action_unique` on (organizationId, roleId, resource, action)
**Indexes**: `idx_policy_overrides_policy_gin` USING GIN (policy jsonb_path_ops)

### 5. Customers Table

**Purpose**: Customer organizations with normalized address and contact information

```sql
customers (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customerNumber VARCHAR(50) UNIQUE NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  legalName VARCHAR(255),
  industry VARCHAR(100),
  website TEXT,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  customerType VARCHAR(50) NOT NULL DEFAULT 'business',
  source VARCHAR(50),
  tags TEXT[],
  rating INTEGER,
  
  -- Normalized Address Fields
  street TEXT,
  suburb TEXT,
  city TEXT,
  region TEXT,
  postcode TEXT,
  country TEXT,
  
  -- Normalized Contact Fields
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- JSONB for Flexible Data
  contactExtras JSONB, -- Social links, secondary channels
  billingInfo JSONB, -- Flexible billing configuration
  preferences JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
)
```

**Indexes**:
- `idx_customers_address` on (street, city, country)
- `idx_customers_contact` on (phone, email)

**Constraints**:
- Phone format validation: `^[+]?[0-9\s\-\(\)]+$`
- Email format validation: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- **Note**: Consider adding ISO 4217 currency code validation for better data integrity

### 6. Projects Table

**Purpose**: Project management with core fields and flexible metadata

```sql
projects (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Project code
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  ownerId TEXT REFERENCES users(id) ON DELETE SET NULL,
  startDate DATE,
  endDate DATE,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Labels, custom forms, per customer extras
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
)
```

**Indexes**:
- `idx_projects_code` on (code)
- `idx_projects_owner` on (owner_id)

### 7. Service Categories Table

**Purpose**: Service categorization with ordering and visibility controls

```sql
service_categories (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Category code
  description TEXT,
  ordering INTEGER NOT NULL DEFAULT 0, -- Display order
  isVisible BOOLEAN NOT NULL DEFAULT true,
  isActive BOOLEAN NOT NULL DEFAULT true,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Per customer fields only
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Indexes**:
- `idx_service_categories_code` on (code)
- `idx_service_categories_ordering` on (ordering)

### 8. Rate Cards Table

**Purpose**: Pricing structure with versioning and effective dates

```sql
rate_cards (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  description TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  effectiveFrom DATE NOT NULL,
  effectiveUntil DATE,
  isDefault BOOLEAN NOT NULL DEFAULT false,
  isActive BOOLEAN NOT NULL DEFAULT true,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Display settings or partner specific notes
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)

**Note**: Monitor `metadata` field usage patterns. Consider promoting frequently queried custom attributes to typed columns for better performance.
```

**Indexes**: `idx_rate_cards_version` on (version)

### 9. Rate Card Items Table

**Purpose**: Individual pricing items with tax classification and tiering

```sql
rate_card_items (
  id TEXT PRIMARY KEY,
  rateCardId TEXT NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
  serviceCategoryId TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  roleId TEXT REFERENCES roles(id) ON DELETE SET NULL,
  itemCode VARCHAR(50), -- Item code/SKU
  unit VARCHAR(20) NOT NULL DEFAULT 'hour', -- hour, day, item, etc.
  baseRate DECIMAL(15,4) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  taxClass VARCHAR(20) NOT NULL DEFAULT 'standard', -- Tax classification
  tieringModelId TEXT, -- Reference to tiering model
  effectiveFrom DATE NOT NULL,
  effectiveUntil DATE,
  isActive BOOLEAN NOT NULL DEFAULT true,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Rare exceptions or display hints
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)

**Note**: Monitor `metadata` field usage patterns. Consider promoting frequently queried custom attributes to typed columns for better performance.
```

**Indexes**: `idx_rate_card_items_code` on (item_code)

### 10. Quotes Table

**Purpose**: Quote management with comprehensive pricing and approval workflow

```sql
quotes (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quoteNumber VARCHAR(50) NOT NULL,
  customerId TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  projectId TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  type VARCHAR(50) NOT NULL DEFAULT 'project',
  validFrom DATE NOT NULL,
  validUntil DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
  exchangeRate DECIMAL(10,6) NOT NULL DEFAULT '1.000000',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  taxRate DECIMAL(5,4) NOT NULL DEFAULT '0.1500',
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  discountType VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discountValue DECIMAL(10,4) NOT NULL DEFAULT '0.0000',
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  totalAmount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  termsConditions TEXT,
  notes TEXT,
  internalNotes TEXT,
  createdBy TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approvedBy TEXT REFERENCES users(id) ON DELETE SET NULL,
  approvedAt TIMESTAMP,
  sentAt TIMESTAMP,
  acceptedAt TIMESTAMP,
  expiresAt TIMESTAMP,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Customer specific extra fields
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
)
```

**Unique Constraints**: `quotes_quoteNumber_organizationId_unique` on (quoteNumber, organizationId)

### 11. Quote Line Items Table

**Purpose**: Individual line items within quotes with SKU tracking

```sql
quote_line_items (
  id TEXT PRIMARY KEY,
  quoteId TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  lineNumber INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'service',
  sku VARCHAR(50), -- SKU/code
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL DEFAULT '1.0000',
  unitPrice DECIMAL(15,4) NOT NULL,
  unitCost DECIMAL(15,4),
  taxRate DECIMAL(5,4) NOT NULL DEFAULT '0.1500',
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  discountType VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discountValue DECIMAL(10,4) NOT NULL DEFAULT '0.0000',
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  subtotal DECIMAL(15,2) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  serviceCategoryId TEXT REFERENCES service_categories(id) ON DELETE SET NULL,
  rateCardId TEXT REFERENCES rate_cards(id) ON DELETE SET NULL,
  
  -- JSONB for Flexible Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- Rare extras only
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Indexes**: `idx_quote_line_items_sku` on (sku)

### 12. Audit Logs Table

**Purpose**: Comprehensive audit trail with proper actor identification

```sql
audit_logs (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entityType VARCHAR(100) NOT NULL,
  entityId TEXT NOT NULL,
  action VARCHAR(100) NOT NULL,
  actorId TEXT REFERENCES users(id) ON DELETE SET NULL, -- Renamed from userId for clarity
  requestId TEXT, -- For request tracing
  ipAddress INET, -- Proper IP address type
  userAgent TEXT,
  sessionId VARCHAR(255),
  
  -- JSONB for Old/New Values
  oldValues JSONB,
  newValues JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
)
```

**Indexes**:
- `idx_audit_logs_request` on (request_id)
- `idx_audit_logs_ip` on (ip_address)
- `idx_audit_logs_old_values_gin` USING GIN (old_values)
- `idx_audit_logs_new_values_gin` USING GIN (new_values)

**Note**: Plan for partitioning and archiving strategies as volumes increase. Consider time-based partitioning for better performance and maintenance.

## Database Relations

### Organization Hierarchy
```
organizations (1) → (many) users
organizations (1) → (many) roles
organizations (1) → (many) customers
organizations (1) → (many) projects
organizations (1) → (many) service_categories
organizations (1) → (many) rate_cards
organizations (1) → (many) quotes
organizations (1) → (many) audit_logs
organizations (1) → (many) policy_overrides
organizations (1) → (many) org_security_policies
organizations (1) → (many) org_feature_flags
organizations (1) → (many) org_notification_prefs
organizations (1) → (many) org_settings
```

### User Management
```
users (1) → (many) user_roles
users (1) → (many) created_quotes
users (1) → (many) approved_quotes
users (1) → (many) owned_projects
users (1) → (many) audit_logs (as actor)
```

### Role-Based Access Control
```
roles (1) → (many) user_roles
roles (1) → (many) role_permissions
roles (1) → (many) rate_card_items
roles (1) → (many) policy_overrides
```

### Business Logic
```
customers (1) → (many) quotes
projects (1) → (many) quotes
service_categories (1) → (many) rate_card_items
service_categories (1) → (many) quote_line_items
rate_cards (1) → (many) rate_card_items
rate_cards (1) → (many) quote_line_items
quotes (1) → (many) quote_line_items
```

## Indexing Strategy

### B-Tree Indexes (Structured Data)
- **Address fields**: Street, city, country combinations for geocoding
- **Contact fields**: Phone, email for customer lookup
- **Business codes**: Project codes, SKUs, category codes
- **Foreign keys**: All reference columns for join performance
- **Unique constraints**: Business identifiers and natural keys

### GIN Indexes (JSONB Fields)
- **Policy conditions**: `policy_overrides.policy` with `jsonb_path_ops`
- **Audit values**: `audit_logs.old_values` and `audit_logs.new_values`
- **Metadata fields**: For complex JSONB queries when needed

## Data Types and Constraints

### String Fields
- **VARCHAR(255)**: Standard text fields (names, titles)
- **VARCHAR(100)**: Medium text fields (codes, categories)
- **VARCHAR(50)**: Short text fields (abbreviations, types)
- **VARCHAR(20)**: Very short fields (phone, currency codes)
- **TEXT**: Long text fields (descriptions, notes)

### Numeric Fields
- **DECIMAL(15,4)**: Currency amounts with 4 decimal places
- **DECIMAL(15,2)**: Currency totals with 2 decimal places
- **DECIMAL(10,6)**: Exchange rates with 6 decimal places
- **DECIMAL(5,4)**: Tax rates with 4 decimal places
- **INTEGER**: Count fields and small numbers

### Date/Time Fields
- **DATE**: Date-only fields (effective dates, project dates)
- **TIMESTAMP**: Full timestamp with timezone support
- **TIMESTAMP(3)**: Millisecond precision for audit trails

### Boolean Fields
- **BOOLEAN**: True/false flags with meaningful defaults

### Array Fields
- **TEXT[]**: Tag arrays for flexible categorization

### JSONB Fields
- **JSONB**: Flexible data storage with validation constraints

## Migration History

### Migration 0003: Normalize JSONB Fields
- **Date**: Implemented as part of JSONB Decision Matrix
- **Purpose**: Move critical fields from JSONB to typed columns
- **Changes**: 
  - Added address and contact columns to organizations and customers
  - Created organization settings tables
  - Added core business fields to projects, services, and rate cards
  - Improved audit logging structure
  - Added comprehensive indexing and constraints

## Best Practices

### JSONB Usage Guidelines
1. **Use for metadata only**: Configuration, settings, and flexible data
2. **Avoid for business logic**: Core business data should be in typed columns
3. **Validate content**: Use CHECK constraints for JSONB structure validation
4. **Index appropriately**: GIN indexes for complex JSONB queries

### Design Evolution Considerations
1. **Organization Settings**: Monitor `org_settings` key usage patterns. Consider splitting stable semantic keys (e.g., invoice templates, brand configurations) into dedicated tables as reporting and governance requirements grow
2. **Rate Card Metadata**: Track custom attribute query frequency in `rate_cards.metadata` and `rate_card_items.metadata`. Promote frequently queried attributes to typed columns for better performance
3. **Audit Log Scaling**: Plan for partitioning and archiving strategies as audit log volumes increase. Consider time-based partitioning for `audit_logs` table
4. **Currency Validation**: Implement ISO 4217 currency code validation through CHECK constraints or lookup tables for better data integrity

### Performance Considerations
1. **Query structured fields first**: Use typed columns for primary filtering
2. **Limit JSONB queries**: Avoid complex JSONB operations in hot paths
3. **Index foreign keys**: All reference columns should be indexed
4. **Monitor query performance**: Use EXPLAIN ANALYZE for optimization

### Data Integrity
1. **Foreign key constraints**: Maintain referential integrity
2. **CHECK constraints**: Validate data formats and ranges
3. **NOT NULL constraints**: Ensure required data is present
4. **Default values**: Provide sensible defaults for optional fields

## Future Considerations

### Potential Enhancements
1. **Partitioning**: Large tables (audit_logs, quotes) may benefit from partitioning
2. **Archiving**: Implement data archiving for historical records
3. **Caching**: Redis integration for frequently accessed data
4. **Full-text search**: PostgreSQL full-text search for content fields
5. **Currency validation**: ISO 4217 currency code lookup table for validation
6. **Organization settings evolution**: Split stable semantic keys into dedicated tables as reporting needs grow

### Monitoring and Maintenance
1. **Index usage**: Monitor index effectiveness and usage patterns
2. **Table statistics**: Regular ANALYZE operations for query planning
3. **Vacuum operations**: Regular VACUUM for table maintenance
4. **Performance metrics**: Track query performance and optimization opportunities
5. **Rate card metadata analysis**: Monitor custom attribute query patterns for potential column promotion

---

*This schema reference is maintained as part of the Pivotal Flow application documentation. For questions or updates, refer to the development team.*
