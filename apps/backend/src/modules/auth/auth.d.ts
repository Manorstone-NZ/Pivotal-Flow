export interface JWTPayload {
    sub: string;
    org: string;
    roles: string[];
    iat?: number;
    exp?: number;
    jti?: string;
}
export interface AuthContext {
    userId: string;
    organizationId: string;
    roles: string[];
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