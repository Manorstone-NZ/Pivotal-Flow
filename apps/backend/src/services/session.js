/**
 * Opaque Session Service
 * Implements secure session management with Redis storage
 */
import { randomBytes } from 'crypto';
// import type { FastifyInstance } from 'fastify'; // TODO: Use when implementing session management
import { logger } from '../lib/logger.js';
/**
 * Create session with sliding TTL
 */
export async function createSession(cache, sid, value, ttlSec = 900 // 15 minutes default
) {
    try {
        const serializedValue = JSON.stringify({
            ...value,
            issuedAt: Date.now(),
            lastActivity: Date.now()
        });
        await cache.set(sid, serializedValue, { EX: ttlSec });
        logger.debug({
            sid: sid.substring(0, 8) + '...',
            userId: value.userId,
            tenantId: value.tenantId,
            ttl: ttlSec
        }, 'Session created');
    }
    catch (error) {
        logger.error({ err: error, sid: sid.substring(0, 8) + '...' }, 'Failed to create session');
        throw error;
    }
}
/**
 * Get session with automatic TTL refresh
 */
export async function getSession(cache, sid, options = {}) {
    try {
        const value = await cache.get(sid);
        if (!value) {
            return null;
        }
        const sessionData = JSON.parse(value);
        // Update last activity and refresh TTL if sliding expiry enabled
        if (options.slidingExpiry !== false) {
            sessionData.lastActivity = Date.now();
            const ttl = options.ttlSeconds || 900;
            await cache.set(sid, JSON.stringify(sessionData), { EX: ttl });
            logger.debug({
                sid: sid.substring(0, 8) + '...',
                userId: sessionData.userId,
                lastActivity: new Date(sessionData.lastActivity).toISOString()
            }, 'Session refreshed');
        }
        return sessionData;
    }
    catch (error) {
        logger.error({ err: error, sid: sid.substring(0, 8) + '...' }, 'Failed to get session');
        return null;
    }
}
/**
 * Revoke single session
 */
export async function revokeSession(cache, sid) {
    try {
        const result = await cache.del(sid);
        logger.info({
            sid: sid.substring(0, 8) + '...',
            revoked: result > 0
        }, 'Session revoked');
        return result > 0;
    }
    catch (error) {
        logger.error({ err: error, sid: sid.substring(0, 8) + '...' }, 'Failed to revoke session');
        return false;
    }
}
/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(cache, userId, tenantId) {
    try {
        // Pattern to match user sessions
        const pattern = tenantId
            ? `session:*:${userId}:${tenantId}:*`
            : `session:*:${userId}:*`;
        const keys = await cache.keys(pattern);
        if (keys.length === 0) {
            return 0;
        }
        const result = await cache.del(keys);
        logger.info({
            userId,
            tenantId,
            revokedCount: result,
            pattern
        }, 'User sessions revoked');
        return result;
    }
    catch (error) {
        logger.error({ err: error, userId, tenantId }, 'Failed to revoke user sessions');
        return 0;
    }
}
/**
 * Generate secure session ID
 */
export function generateSessionId(userId, tenantId) {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(16).toString('base64url');
    return `session:${timestamp}:${userId}:${tenantId}:${random}`;
}
/**
 * Validate session binding (IP, User-Agent)
 */
export function validateSessionBinding(stored, current, options = {}) {
    // IP binding check (strict)
    if (options.bindToIp && stored.ipAddress && current.ipAddress) {
        if (stored.ipAddress !== current.ipAddress) {
            logger.warn({
                storedIp: stored.ipAddress,
                currentIp: current.ipAddress,
                userId: stored.userId
            }, 'Session IP binding validation failed');
            return false;
        }
    }
    // User-Agent binding check (warning only)
    if (options.bindToUserAgent && stored.userAgent && current.userAgent) {
        if (stored.userAgent !== current.userAgent) {
            logger.warn({
                userId: stored.userId,
                changed: 'user_agent'
            }, 'Session User-Agent changed');
            // Don't fail - user agents can change legitimately
        }
    }
    return true;
}
/**
 * Get session statistics
 */
export async function getSessionStats(cache) {
    try {
        const allSessions = await cache.keys('session:*');
        const totalSessions = allSessions.length;
        // Check which sessions are still active (have TTL > 0)
        let activeSessions = 0;
        let expiringSoon = 0;
        for (const key of allSessions) {
            const ttl = await cache.ttl(key);
            if (ttl > 0) {
                activeSessions++;
                if (ttl < 300) { // Expiring in < 5 minutes
                    expiringSoon++;
                }
            }
        }
        return {
            totalSessions,
            activeSessions,
            expiringSoon
        };
    }
    catch (error) {
        logger.error({ err: error }, 'Failed to get session stats');
        return {
            totalSessions: 0,
            activeSessions: 0,
            expiringSoon: 0
        };
    }
}
//# sourceMappingURL=session.js.map