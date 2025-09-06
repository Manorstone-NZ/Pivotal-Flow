export interface JWTPayload {
    sub: string;
    org: string;
    roles: string[];
    iat?: number;
    exp?: number;
    jti?: string;
}
export interface AccessTokenPayload {
    sub: string;
    org: string;
    roles: string[];
    iat: number;
    exp: number;
}
export interface RefreshTokenPayload {
    sub: string;
    org: string;
    jti: string;
    iat: number;
    exp: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface RefreshTokenData {
    userId: string;
    organizationId: string;
    jti: string;
    expiresAt: Date;
    isRevoked: boolean;
}
export interface AuthContext {
    userId: string;
    organizationId: string;
    roles: string[];
    jti?: string | undefined;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        displayName: string;
        roles: string[];
        organizationId: string;
    };
}
export interface RefreshRequest {
    refreshToken?: string;
}
export interface RefreshResponse {
    accessToken: string;
}
export interface LogoutResponse {
    message: string;
}
export interface MeResponse {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    organizationId: string;
}
export interface AuthError {
    error: string;
    message: string;
    code: string;
}
//# sourceMappingURL=jwt-types.d.ts.map