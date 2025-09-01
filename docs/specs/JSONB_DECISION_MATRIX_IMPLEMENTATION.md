# JSONB Decision Matrix Implementation

## Overview

This document outlines the implementation of the JSONB decision matrix for the Pivotal Flow project. The decision matrix provides guidelines for when to use typed database columns versus JSONB fields, ensuring optimal performance, validation, and maintainability.

## Decision Matrix Summary

| Area | Store as Tables | Keep as JSONB | Notes |
|------|----------------|---------------|-------|
| **Organization address** | ✅ **Yes** | ❌ **No** | Use columns for street, suburb, city, region, postcode, country. Easier validation, search, and geocoding. |
| **Organization contact info** | ✅ **Yes** | ✅ **Optional extras** | Columns for phone, email, website. JSONB only for social links or secondary channels that vary. |
| **Organization settings** | ✅ **Mostly yes** | ✅ **Yes for unknown or per feature payloads** | Split to security policies, notification prefs, feature flags as typed tables. Use one policy JSONB column per row for option blobs that change often. |
| **Users preferences** | ✅ **Partly** | ✅ **Yes** | Columns for locale, timezone, date format, default org. JSONB for dashboard layout and UI tweaks. |
| **Users metadata** | ❌ **No** | ✅ **Yes** | Custom fields per customer fit JSONB well. |
| **Policy overrides policy** | ✅ **Scope as tables** | ✅ **Yes for policy blob** | Keep org id, role id, resource, action as columns. Keep policy JSONB for conditions. GIN index on frequent keys. |
| **Projects core fields** | ✅ **Yes** | ❌ **No** | Name, code, state, dates, owner as columns. |
| **Projects metadata** | ❌ **No** | ✅ **Yes** | Use for labels, custom forms, per customer extras. |
| **Service categories core** | ✅ **Yes** | ❌ **No** | Name, code, ordering, visibility as columns. |
| **Service categories metadata** | ❌ **No** | ✅ **Yes** | Use for per customer fields only. |
| **Rate cards core** | ✅ **Yes** | ❌ **No** | Card name, version, currency, effective dates as columns. |
| **Rate card metadata** | ❌ **No** | ✅ **Yes** | Only for display settings or partner specific notes. |
| **Rate card items core** | ✅ **Yes** | ❌ **No** | Item code, unit, base price, tax class, tiering model id as columns. |
| **Rate card items metadata** | ❌ **No** | ✅ **Yes** | Use for rare exceptions or display hints. |
| **Quotes core** | ✅ **Yes** | ❌ **No** | Number, status, currency, totals, customer, validity dates as columns. |
| **Quotes metadata** | ❌ **No** | ✅ **Yes** | Use for customer specific extra fields. |
| **Quote line items core** | ✅ **Yes** | ❌ **No** | SKU, description, qty, unit price, discount, tax class, totals as columns. |
| **Quote line items metadata** | ❌ **No** | ✅ **Yes** | Rare extras only. |
| **Audit logs envelope** | ✅ **Yes** | ✅ **Yes for oldValues and newValues** | Columns for entity type, entity id, actor id, action, request id, ip, created at. Keep old and new blobs in JSONB. |
| **Organization settings key value table** | ✅ **Yes** | ✅ **Maybe** | Keep org id and key as columns with unique constraint. Use JSONB value when the shape is nested, else prefer typed value columns per category over time. |

## Implementation Details

### 1. Organizations Table

**Before (JSONB):**
```sql
address JSONB,
contact_info JSONB,
settings JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Normalized address fields
street TEXT,
suburb TEXT,
city TEXT,
region TEXT,
postcode TEXT,
country TEXT,
-- Normalized contact fields
phone VARCHAR(20),
email VARCHAR(255),
website TEXT,
-- Keep JSONB only for flexible extras
contact_extras JSONB, -- Social links, secondary channels
settings JSONB DEFAULT '{}' -- Feature-specific payloads
```

**New Tables:**
- `org_security_policies` - Typed security settings
- `org_feature_flags` - Feature flags with JSONB payload
- `org_notification_prefs` - Notification preferences by channel
- `org_settings` - Flexible key-value store with JSONB values

### 2. Users Table

**Before (JSONB):**
```sql
preferences JSONB DEFAULT '{}',
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Normalized preference fields
timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
locale VARCHAR(10) NOT NULL DEFAULT 'en-NZ',
date_format VARCHAR(20) NOT NULL DEFAULT 'DD MMM YYYY',
time_format VARCHAR(10) NOT NULL DEFAULT '24h',
-- Keep JSONB for flexible preferences
preferences JSONB DEFAULT '{}', -- Dashboard layout, UI tweaks
metadata JSONB DEFAULT '{}' -- Custom fields per customer
```

### 3. Customers Table

**Before (JSONB):**
```sql
address JSONB,
contact_info JSONB,
billing_info JSONB
```

**After (Normalized):**
```sql
-- Normalized address fields
street TEXT,
suburb TEXT,
city TEXT,
region TEXT,
postcode TEXT,
country TEXT,
-- Normalized contact fields
phone VARCHAR(20),
email VARCHAR(255),
-- Keep JSONB for flexible extras
contact_extras JSONB, -- Social links, secondary channels
billing_info JSONB -- Flexible billing configuration
```

### 4. Projects Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields as columns
code VARCHAR(50), -- Project code
owner_id TEXT REFERENCES users(id), -- Project owner
start_date DATE,
end_date DATE,
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Labels, custom forms, per customer extras
```

### 5. Service Categories Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields as columns
code VARCHAR(50), -- Category code
ordering INTEGER NOT NULL DEFAULT 0, -- Display order
is_visible BOOLEAN NOT NULL DEFAULT true,
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Per customer fields only
```

### 6. Rate Cards Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields as columns
version VARCHAR(20) NOT NULL DEFAULT '1.0',
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Display settings or partner specific notes
```

### 7. Rate Card Items Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields as columns
item_code VARCHAR(50), -- Item code/SKU
unit VARCHAR(20) NOT NULL DEFAULT 'hour', -- hour, day, item, etc.
tax_class VARCHAR(20) NOT NULL DEFAULT 'standard', -- Tax classification
tiering_model_id TEXT, -- Reference to tiering model
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Rare exceptions or display hints
```

### 8. Quotes Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields remain as columns (already properly normalized)
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Customer specific extra fields
```

### 9. Quote Line Items Table

**Before (JSONB):**
```sql
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Core fields as columns
sku VARCHAR(50), -- SKU/code
-- Keep JSONB for flexible metadata
metadata JSONB DEFAULT '{}' -- Rare extras only
```

### 10. Audit Logs Table

**Before (JSONB):**
```sql
old_values JSONB,
new_values JSONB,
metadata JSONB DEFAULT '{}'
```

**After (Normalized):**
```sql
-- Proper envelope columns
entity_type VARCHAR(100) NOT NULL,
entity_id TEXT NOT NULL,
action VARCHAR(100) NOT NULL,
actor_id TEXT REFERENCES users(id),
request_id TEXT, -- For request tracing
ip_address INET, -- Proper IP address type
-- Keep JSONB for old/new values
old_values JSONB,
new_values JSONB,
metadata JSONB DEFAULT '{}'
```

### 11. Policy Overrides Table

**Before (JSONB):**
```sql
policy JSONB NOT NULL
```

**After (Normalized):**
```sql
-- Proper scope columns
resource VARCHAR(100) NOT NULL,
action VARCHAR(100) NOT NULL, -- Added action column for proper scoping
policy JSONB NOT NULL, -- Keep JSONB for policy conditions
-- Updated unique constraint
UNIQUE(organization_id, role_id, resource, action)
```

## Benefits of This Implementation

### 1. **Performance Improvements**
- **Indexed Columns**: Address fields, contact info, and preferences are now properly indexed
- **Efficient Queries**: Structured data enables faster joins and filtering
- **Reduced JSONB Parsing**: Less JSONB data means faster query execution

### 2. **Data Validation**
- **Type Safety**: Proper data types for critical fields
- **Constraints**: Check constraints for phone numbers, email formats
- **Referential Integrity**: Foreign key relationships for data consistency

### 3. **Search and Reporting**
- **Geocoding**: Address fields enable location-based queries
- **Analytics**: Structured data supports better reporting
- **Filtering**: Efficient filtering on normalized fields

### 4. **Maintainability**
- **Clear Schema**: Easy to understand data structure
- **Migration Path**: Backward compatibility maintained
- **Documentation**: Clear comments on all new fields

### 5. **Flexibility**
- **JSONB for Extras**: Custom fields and flexible data still supported
- **Hybrid Approach**: Best of both worlds - structure where needed, flexibility where appropriate

## Migration Strategy

### Phase 1: Schema Changes
1. Add new normalized columns
2. Create new tables for organization settings
3. Update indexes and constraints

### Phase 2: Data Migration (Future)
1. Migrate existing JSONB data to new columns
2. Validate data integrity
3. Remove old JSONB columns (optional)

### Phase 3: Application Updates
1. Update application code to use new fields
2. Maintain backward compatibility with JSONB fields
3. Add validation for new structured fields

## Indexing Strategy

### B-Tree Indexes (Structured Data)
```sql
-- Address fields for geocoding and search
CREATE INDEX idx_organizations_address ON organizations(street, city, country);
CREATE INDEX idx_customers_address ON customers(street, city, country);

-- Contact fields for lookup
CREATE INDEX idx_organizations_contact ON organizations(phone, email);
CREATE INDEX idx_customers_contact ON customers(phone, email);

-- Business logic fields
CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_service_categories_ordering ON service_categories(ordering);
```

### GIN Indexes (JSONB Data)
```sql
-- Policy conditions for efficient querying
CREATE INDEX idx_policy_overrides_policy_gin ON policy_overrides USING GIN (policy jsonb_path_ops);

-- Audit trail values
CREATE INDEX idx_audit_logs_old_values_gin ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values_gin ON audit_logs USING GIN (new_values);
```

## Constraints and Validation

### Data Integrity Constraints
```sql
-- Phone number format validation
ALTER TABLE organizations 
  ADD CONSTRAINT organizations_phone_format 
  CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s\-\(\)]+$');

-- Email format validation
ALTER TABLE organizations 
  ADD CONSTRAINT organizations_email_format 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- JSONB type validation
ALTER TABLE org_security_policies 
  ADD CONSTRAINT extras_is_object 
  CHECK (extras IS NULL OR jsonb_typeof(extras) = 'object');
```

## Future Considerations

### 1. **Data Migration**
- Develop scripts to migrate existing JSONB data to new columns
- Validate data quality during migration
- Plan rollback strategy if needed

### 2. **Application Updates**
- Update API endpoints to use new fields
- Maintain backward compatibility
- Add validation for new structured fields

### 3. **Monitoring**
- Monitor query performance improvements
- Track data quality metrics
- Measure migration success

### 4. **Further Normalization**
- Consider additional normalization based on usage patterns
- Monitor JSONB field usage to identify candidates for normalization
- Balance normalization with flexibility needs

## Conclusion

The implementation of the JSONB decision matrix provides a robust foundation for the Pivotal Flow database schema. By normalizing critical fields into typed columns while maintaining JSONB for flexible metadata, we achieve:

- **Better Performance**: Indexed columns for fast queries
- **Data Integrity**: Proper validation and constraints
- **Maintainability**: Clear, structured schema
- **Flexibility**: JSONB for custom fields and evolving requirements

This hybrid approach ensures that the system can handle both structured business logic and flexible customization needs, providing the best of both worlds for a modern business application.
