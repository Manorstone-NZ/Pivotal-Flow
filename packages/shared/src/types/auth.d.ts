/**
 * Authentication types shared across the application
 */
export interface AuthContext {
    organizationId: string;
    userId: string;
    userType: 'internal' | 'external_customer';
    permissions: string[];
    roles: string[];
}
export interface RequestUser {
    id: string;
    email: string;
    displayName: string;
    organizationId: string;
    userType: 'internal' | 'external_customer';
    permissions: string[];
    roles: string[];
    isActive: boolean;
}
export interface TokenPayload {
    userId: string;
    organizationId: string;
    userType: 'internal' | 'external_customer';
    permissions: string[];
    roles: string[];
    iat: number;
    exp: number;
}
export interface AuthResult {
    success: boolean;
    user?: RequestUser;
    error?: string;
    code?: string;
}
export type UserType = 'internal' | 'external_customer';
export interface PermissionCheck {
    hasPermission: boolean;
    missingPermissions?: string[];
    userPermissions: string[];
}
//# sourceMappingURL=auth.d.ts.map