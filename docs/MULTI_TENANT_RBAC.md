# Multi-Tenant Role-Based Access Control (RBAC)

## 🔐 **Role Hierarchy Overview**

The Pivotal Flow platform implements a **hierarchical multi-tenant RBAC system** with proper isolation and escalation controls.

### **1. Super Admin** (`admin` role + `system.super_admin` permission)

#### **Scope**: Cross-tenant/Platform-wide
- **Who**: Platform operators, SaaS administrators
- **Access**: All organizations and tenants
- **Capabilities**:
  - ✅ Create, edit, delete any organization
  - ✅ View all organizations across the platform
  - ✅ Manage users across all tenants
  - ✅ Access tenant switcher in header
  - ✅ Access `/admin/tenants` management interface
  - ✅ Invite users to any organization
  - ✅ Configure global system settings

#### **Database Structure**:
```sql
-- Permission
INSERT INTO permissions (id, name, category, resource, action)
VALUES ('perm-system-super-admin', 'system.super_admin', 'system', 'system', 'super_admin');

-- Role Assignment (existing admin role gets super admin permission)
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('admin-role-1', 'perm-system-super-admin');
```

#### **Frontend Access**:
- **Navigation**: Organizations menu item visible
- **Tenant Switcher**: Shows all organizations
- **Organization Management**: Full CRUD access
- **Permission Check**: `hasPermission('system.super_admin')`

---

### **2. Tenant Admin** (`tenant-admin` role + `tenant.admin` permission)

#### **Scope**: Single organization/tenant only
- **Who**: Organization administrators, department heads
- **Access**: Their organization only
- **Capabilities**:
  - ✅ Manage users within their tenant
  - ✅ Configure tenant-specific settings
  - ✅ Manage billing and subscriptions for their tenant
  - ✅ Access all features within their organization
  - ❌ Cannot see other organizations
  - ❌ Cannot access cross-tenant management
  - ❌ No tenant switcher access

#### **Database Structure**:
```sql
-- Permission
INSERT INTO permissions (id, name, category, resource, action)
VALUES ('perm-tenant-admin', 'tenant.admin', 'tenant', 'tenant', 'admin');

-- Role (per organization)
INSERT INTO roles (id, organization_id, name, is_system)
VALUES ('tenant-admin-{org-id}', '{org-id}', 'Tenant Admin', false);

-- Role Assignment
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('tenant-admin-{org-id}', 'perm-tenant-admin');
```

#### **Frontend Access**:
- **Navigation**: Standard menu items only
- **Tenant Switcher**: Hidden
- **Organization Management**: No access
- **Permission Check**: `hasPermission('tenant.admin')`

---

### **3. Regular Users** (Standard roles)

#### **Scope**: Single organization with limited permissions
- **Who**: Employees, contractors, customers
- **Access**: Their organization with role-based permissions
- **Capabilities**: Based on assigned roles (manager, user, viewer, etc.)

---

## 🔒 **Security Implementation**

### **Backend Changes**:

#### **1. Access Control Updates**:
```typescript
// apps/backend/src/lib/access-control.ts
'GET /organizations': 'system.super_admin',      // Was: 'orgs.manage'
'POST /organizations': 'system.super_admin',     // Was: 'orgs.manage'
// ... all organization endpoints now require super admin
```

#### **2. Permission Structure**:
- **Cross-tenant permissions**: `system.*` (super admin only)
- **Tenant-scoped permissions**: `tenant.*` (tenant admin)
- **Feature permissions**: `customers.*`, `projects.*`, etc. (all users)

### **Frontend Changes**:

#### **1. Navigation Filtering**:
```typescript
// apps/frontend/src/components/layout/Sidebar.tsx
const visibleNavigationItems = navigationItems.filter(item => {
  if (item.adminOnly) {
    return hasPermission('system.super_admin');  // Was: 'orgs.manage'
  }
  return true;
});
```

#### **2. Tenant Switcher**:
```typescript
// apps/frontend/src/components/tenancy/TenantSwitcher.tsx
if (!hasPermission('system.super_admin')) {  // Was: 'orgs.manage'
  return null;
}
```

#### **3. Organization Management**:
```typescript
// apps/frontend/src/pages/Tenancy/List.tsx
if (!hasPermission('system.super_admin')) {  // Was: 'orgs.manage'
  return <AccessDenied message="You need super admin privileges" />;
}
```

---

## 🎯 **User Experience**

### **Super Admin Experience**:
1. **Login**: `admin@pivotalflow.com`
2. **Header**: Shows tenant switcher with all organizations
3. **Navigation**: Shows "Organizations" menu item
4. **Access**: Can manage all organizations and switch between them
5. **Scope**: Platform-wide administrative capabilities

### **Tenant Admin Experience**:
1. **Login**: `{tenant-admin}@{organization}.com`
2. **Header**: No tenant switcher (locked to their organization)
3. **Navigation**: Standard menu items only
4. **Access**: Full admin within their organization only
5. **Scope**: Single-tenant administrative capabilities

### **Regular User Experience**:
1. **Login**: Standard user credentials
2. **Header**: No administrative controls
3. **Navigation**: Role-based menu items
4. **Access**: Feature-based permissions within their organization
5. **Scope**: Limited to assigned permissions

---

## 📊 **Implementation Status**

| Component | Status | Notes |
|-----------|---------|-------|
| **Database Permissions** | ✅ Complete | `system.super_admin` and `tenant.admin` created |
| **Role Assignment** | ✅ Complete | Admin user has super admin permissions |
| **Backend Access Control** | ✅ Complete | Organization endpoints require super admin |
| **Frontend Permission Checks** | ✅ Complete | UI shows/hides based on super admin role |
| **Tenant Switcher** | ✅ Complete | Only visible to super admins |
| **Organization Management** | ✅ Complete | Only accessible to super admins |

---

## 🚀 **Security Benefits**

### **✅ Proper Isolation**:
- **Tenant admins** cannot see other organizations
- **Regular users** cannot access administrative functions
- **Super admins** have explicit cross-tenant privileges

### **✅ Principle of Least Privilege**:
- **Users get minimum required permissions**
- **Role escalation is explicit and auditable**
- **Cross-tenant access is restricted to super admins**

### **✅ Scalable Architecture**:
- **New tenants** get their own admin roles automatically
- **Permission system** supports granular controls
- **Role hierarchy** supports future expansion

---

## 🔧 **Future Enhancements**

1. **Tenant Admin Role Creation**: Automatically create tenant admin roles for new organizations
2. **Permission Inheritance**: Implement permission inheritance patterns
3. **Audit Logging**: Track cross-tenant administrative actions
4. **Role Templates**: Pre-defined role templates for different organization types
5. **Dynamic Permissions**: Runtime permission evaluation based on context

---

## ✅ **CONCLUSION**

The multi-tenant RBAC system now properly separates:
- **Super Admins**: Platform-wide organization management
- **Tenant Admins**: Single-organization administration  
- **Regular Users**: Feature-based permissions within their organization

**This resolves the security concern and provides proper tenant isolation while maintaining administrative flexibility.**

