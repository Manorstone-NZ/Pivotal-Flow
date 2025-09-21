/**
 * PASETO Token Service
 * Implements secure token management with PASETO and opaque tokens
 */
import type { FastifyInstance } from 'fastify';
export interface SessionData {
    userId: string;
    tenantId: string;
    organizationId: string;
    roles: string[];
    permissions: string[];
    memberships: TenantMembership[];
    createdAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
    fingerprint?: string;
}
export interface TenantMembership {
    tenantId: string;
    role: string;
}
export interface TokenBinding {
    ipAddress: string;
    userAgent: string;
    fingerprint?: string;
}
export interface PublicTokenPayload {
    tenant: string;
    resource: string;
    resourceType: string;
    purpose: string;
    iat: number;
    exp: number;
}
export interface AccessTokenInfo {
    id: string;
    token: string;
    userId: string;
    tenantId: string;
    sessionId: string;
    expiresAt: Date;
    lastActivity: Date;
    isActive: boolean;
}
export declare class PasetoTokenService {
    private fastify;
    private db;
    private redis;
    private initialized;
    constructor(fastify: FastifyInstance);
    private ensureInitialized;
    private initializeKeys;
    /**
     * Generate a cryptographically secure opaque token
     */
    private generateOpaqueToken;
    /**
     * Hash a token for database storage
     */
    private hashToken;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Generate opaque access token with Redis session storage
     */
    generateAccessToken(sessionData: SessionData, binding?: TokenBinding): Promise<string>;
    /**
     * Generate PASETO refresh token
     */
    generateRefreshToken(userId: string, tenantId: string, binding?: TokenBinding): Promise<string>;
    /**
     * Validate opaque access token
     */
    validateAccessToken(token: string, binding?: TokenBinding): Promise<SessionData | null>;
    /**
     * Validate PASETO refresh token
     */
    validateRefreshToken(token: string, binding?: TokenBinding): Promise<{
        userId: string;
        tenantId: string;
        sessionId: string;
    } | null>;
    /**
     * Generate public PASETO token for customer portal
     */
    generatePublicToken(tenantId: string, resourceType: string, resourceId: string, purpose: string, expiryDays?: number): Promise<string>;
    /**
     * Validate public PASETO token
     */
    validatePublicToken(token: string, binding?: TokenBinding): Promise<PublicTokenPayload | null>;
    /**
     * Revoke tokens by user/tenant/session
     */
    revokeTokens(options: {
        userId?: string;
        tenantId?: string;
        sessionId?: string;
        tokenType?: 'access' | 'refresh' | 'public';
        reason?: string;
        revokedBy?: string;
    }): Promise<number>;
    /**
     * Get active sessions for a user
     */
    getActiveSessions(userId: string): Promise<AccessTokenInfo[]>;
    /**
     * Clean up expired tokens
     */
    cleanupExpiredTokens(): Promise<number>;
    private validateTokenBinding;
    private updateTokenActivity;
    private reconstructSessionFromDatabase;
    private buildRevokeQuery;
    private auditLog;
}
export default PasetoTokenService;
//# sourceMappingURL=paseto-service.d.ts.map