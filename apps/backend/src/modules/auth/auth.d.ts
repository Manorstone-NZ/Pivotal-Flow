export interface JWTPayload {
    sub: string;
    org: string;
    tenantId: string;
    memberships: {
        tenantId: string;
        role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
    }[];
    roles: string[];
    permissions?: string[];
    iat?: number;
    exp?: number;
    jti?: string;
}
export interface AuthContext {
    userId: string;
    organizationId: string;
    tenantId: string;
    memberships: {
        tenantId: string;
        role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
    }[];
    roles: string[];
    permissions?: string[];
    jti?: string | undefined;
}
export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    organizationId: string;
}
//# sourceMappingURL=auth.d.ts.map