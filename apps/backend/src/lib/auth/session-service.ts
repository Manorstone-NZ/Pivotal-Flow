/**
 * F2B Session Service for Opaque Token Management
 * Manages server-side sessions using database storage
 */

import { createHash } from 'crypto';
import { eq, and, gt, lt, isNull } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../db.js';
import { sessions, users, tenants } from '../schema.js';
import { logger } from '../logger.js';

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
  // Additional user details for /me endpoint
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

export class SessionService {
  private db = getDatabase();

  /**
   * Create a new session for a user
   */
  async createSession(
    userId: string,
    tenantId: string,
    _sessionData: SessionData,
    options: CreateSessionOptions = {}
  ): Promise<string> {
    // Use the default tenant if the provided tenant doesn't exist
    const validTenantId = tenantId || 'fc86afa8-9319-4e1f-be7b-4bc1c1ab7e68';
    const sessionId = generateId(); // Use generateId for UUID
    const now = new Date();
    const ttlMinutes = options.rememberMe ? 30 * 24 * 60 : 15; // 30 days or 15 minutes
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    // Create device fingerprint and IP hash
    const deviceFingerprint = options.fingerprint || this.generateDeviceFingerprint(options.userAgent || '');
    const ipHash = options.ipAddress ? createHash('sha256').update(options.ipAddress).digest('hex') : '';

    // Store session in database
    await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      tenantId: validTenantId,
      deviceFingerprint,
      ipHash,
      refreshKid: generateId(), // Generate a refresh key ID
      createdAt: now,
      expiresAt,
      revokedAt: null
    });

    logger.info({
      sessionId: this.hashSessionId(sessionId),
      userId,
      tenantId,
      expiresAt: expiresAt.toISOString(),
      rememberMe: options.rememberMe
    }, 'Session created successfully');

    return sessionId;
  }

  /**
   * Validate and retrieve session data
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    try {
      // Look up session with user and tenant data
      const sessionResult = await this.db
        .select({
          session: sessions,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            organizationId: users.organizationId,
          },
          tenant: {
            id: tenants.id,
            name: tenants.name,
          }
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .leftJoin(tenants, eq(sessions.tenantId, tenants.id))
        .where(
          and(
            eq(sessions.id, sessionId),
            isNull(sessions.revokedAt), // Not revoked
            gt(sessions.expiresAt, new Date()) // Not expired
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        logger.debug({
          sessionId: this.hashSessionId(sessionId)
        }, 'Session not found or expired');
        return null;
      }

      const sessionRecord = sessionResult[0];
      if (!sessionRecord) {
        return null;
      }
      const { session, user, tenant } = sessionRecord;

      if (!user || !tenant) {
        logger.error({
          sessionId: this.hashSessionId(sessionId),
          hasUser: !!user,
          hasTenant: !!tenant
        }, 'Session validation failed - missing user or tenant');
        return null;
      }

      // Build session data
      const validatedSessionData: SessionData = {
        userId: user.id,
        tenantId: tenant.id,
        organizationId: user.organizationId,
        roles: [], // TODO: Load from database
        permissions: [], // TODO: Load from database
        memberships: [{
          tenantId: tenant.id,
          role: 'member' // TODO: Load actual role
        }],
        ipAddress: '', // We don't store the actual IP, only hash
        userAgent: '', // We don't store the actual UA
        fingerprint: session.deviceFingerprint,
        // Add user details for /me endpoint
        email: user.email,
        displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      // Update last activity
      await this.updateSessionActivity(sessionId);

      return validatedSessionData;

    } catch (error) {
      logger.error({
        err: error,
        sessionId: this.hashSessionId(sessionId)
      }, 'Session validation error');
      return null;
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      const result = await this.db
        .update(sessions)
        .set({ 
          revokedAt: new Date()
        })
        .where(
          and(
            eq(sessions.id, sessionId),
            isNull(sessions.revokedAt) // Only revoke if not already revoked
          )
        );

      const success = (result as any).rowCount > 0;

      logger.info({
        sessionId: this.hashSessionId(sessionId),
        reason,
        success
      }, 'Session revocation attempted');

      return success;

    } catch (error) {
      logger.error({
        err: error,
        sessionId: this.hashSessionId(sessionId)
      }, 'Session revocation error');
      return false;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId: string, reason?: string): Promise<number> {
    try {
      const result = await this.db
        .update(sessions)
        .set({ 
          revokedAt: new Date()
        })
        .where(
          and(
            eq(sessions.userId, userId),
            isNull(sessions.revokedAt) // Only revoke if not already revoked
          )
        );

      const revokedCount = (result as any).rowCount || 0;

      logger.info({
        userId,
        reason,
        revokedCount
      }, 'User sessions revoked');

      return revokedCount;

    } catch (error) {
      logger.error({
        err: error,
        userId
      }, 'User session revocation error');
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.db
        .delete(sessions)
        .where(
          lt(sessions.expiresAt, new Date())
        );

      const deletedCount = (result as any).rowCount || 0;

      logger.info({
        deletedCount
      }, 'Expired sessions cleaned up');

      return deletedCount;

    } catch (error) {
      logger.error({
        err: error
      }, 'Session cleanup error');
      return 0;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    createdAt: Date;
    expiresAt: Date;
    deviceFingerprint: string;
    isActive: boolean;
  }>> {
    try {
      const result = await this.db
        .select({
          id: sessions.id,
          createdAt: sessions.createdAt,
          expiresAt: sessions.expiresAt,
          deviceFingerprint: sessions.deviceFingerprint,
          revokedAt: sessions.revokedAt
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            gt(sessions.expiresAt, new Date()) // Not expired
          )
        )
        .orderBy(sessions.createdAt);

      return result.map(session => ({
        id: this.hashSessionId(session.id), // Return hashed ID for security
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        deviceFingerprint: session.deviceFingerprint,
        isActive: !session.revokedAt
      }));

    } catch (error) {
      logger.error({
        err: error,
        userId
      }, 'Get user sessions error');
      return [];
    }
  }

  // Private helper methods

  private async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      // Note: The current sessions table doesn't have a lastActivity field
      // We could add updatedAt or implement this when we add that field
      // For now, this is a no-op
    } catch (error) {
      logger.warn({
        err: error,
        sessionId: this.hashSessionId(sessionId)
      }, 'Failed to update session activity');
    }
  }

  private generateDeviceFingerprint(userAgent: string): string {
    // Simple fingerprint based on user agent
    // In production, this could include more sophisticated fingerprinting
    return createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
  }

  private hashSessionId(sessionId: string): string {
    return createHash('sha256').update(sessionId).digest('hex').substring(0, 8);
  }
}

export default SessionService;
