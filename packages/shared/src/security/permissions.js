/**
 * Permission checking interface and implementation
 * Provides role-based access control functionality
 */
export class PermissionService {
    roles;
    constructor(roles = []) {
        this.roles = roles;
    }
    has(permission) {
        // Simple role-based permission mapping
        // This can be extended with more sophisticated logic
        const rolePermissions = {
            'admin': ['*'], // Admin has all permissions
            'manager': ['users.view', 'users.manage', 'quotes.view', 'quotes.manage', 'invoices.view', 'invoices.manage'],
            'user': ['users.view', 'quotes.view', 'invoices.view'],
            'readonly': ['users.view', 'quotes.view', 'invoices.view']
        };
        for (const role of this.roles) {
            const permissions = rolePermissions[role] || [];
            if (permissions.includes('*') || permissions.includes(permission)) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=permissions.js.map