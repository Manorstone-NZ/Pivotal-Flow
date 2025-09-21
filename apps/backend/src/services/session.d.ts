/**
 * Opaque Session Service
 * Implements secure session management with Redis storage
 */
import type { RedisClientType } from 'redis';
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
    issuedAt: number;
    lastActivity: number;
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
}
export interface SessionOptions {
    ttlSeconds?: number;
    slidingExpiry?: boolean;
    bindToIp?: boolean;
    bindToUserAgent?: boolean;
}
/**
 * Create session with sliding TTL
 */
export declare function createSession(cache: RedisClientType, sid: string, value: SessionData, ttlSec?: number): Promise<void>;
/**
 * Get session with automatic TTL refresh
 */
export declare function getSession(cache: RedisClientType, sid: string, options?: SessionOptions): Promise<SessionData | null>;
/**
 * Revoke single session
 */
export declare function revokeSession(cache: RedisClientType, sid: string): Promise<boolean>;
/**
 * Revoke all sessions for a user
 */
export declare function revokeUserSessions(cache: RedisClientType, userId: string, tenantId?: string): Promise<number>;
/**
 * Generate secure session ID
 */
export declare function generateSessionId(userId: string, tenantId: string): string;
/**
 * Validate session binding (IP, User-Agent)
 */
export declare function validateSessionBinding(stored: SessionData, current: {
    ipAddress?: string;
    userAgent?: string;
}, options?: SessionOptions): boolean;
/**
 * Get session statistics
 */
export declare function getSessionStats(cache: RedisClientType): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiringSoon: number;
}>;
//# sourceMappingURL=session.d.ts.map