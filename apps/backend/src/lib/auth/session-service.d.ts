/**
 * F2B Session Service for Opaque Token Management
 * Manages server-side sessions using database storage
 */
export interface SessionData {
    userId: string;
    tenantId: string;
    organizationId: string;
    roles: string[];
    permissions: string[];
    memberships: Array<{
        tenantId: string;
        role: string;
    }>;
    ipAddress: string;
    userAgent: string;
    fingerprint?: string;
    email?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
}
export interface CreateSessionOptions {
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
}
export declare class SessionService {
    private db;
    /**
     * Create a new session for a user
     */
    createSession(userId: string, tenantId: string, _sessionData: SessionData, options?: CreateSessionOptions): Promise<string>;
    /**
     * Validate and retrieve session data
     */
    validateSession(sessionId: string): Promise<SessionData | null>;
    /**
     * Revoke a session
     */
    revokeSession(sessionId: string, reason?: string): Promise<boolean>;
    /**
     * Revoke all sessions for a user
     */
    revokeUserSessions(userId: string, reason?: string): Promise<number>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Get active sessions for a user
     */
    getUserSessions(userId: string): Promise<Array<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
        deviceFingerprint: string;
        isActive: boolean;
    }>>;
    private updateSessionActivity;
    private generateDeviceFingerprint;
    private hashSessionId;
}
export default SessionService;
//# sourceMappingURL=session-service.d.ts.map