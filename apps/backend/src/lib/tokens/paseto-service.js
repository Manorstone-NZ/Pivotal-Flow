/**
 * PASETO Token Service
 * Implements secure token management with PASETO and opaque tokens
 */
import * as paseto from 'paseto';
const { V4 } = paseto;
import { randomBytes, createHash } from 'crypto';
import { eq, and, gt, lt } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { logger } from '../logger.js';
// Database tables (will be added to schema)
const accessTokens = {
    id: 'id',
    token: 'token',
    userId: 'user_id',
    tenantId: 'tenant_id',
    sessionId: 'session_id',
    createdAt: 'created_at',
    expiresAt: 'expires_at',
    lastActivity: 'last_activity',
    ipAddress: 'ip_address',
    userAgent: 'user_agent',
    fingerprint: 'fingerprint',
    isActive: 'is_active',
    revokedAt: 'revoked_at',
    revokedBy: 'revoked_by',
    revocationReason: 'revocation_reason'
};
const refreshTokens = {
    id: 'id',
    tokenHash: 'token_hash',
    userId: 'user_id',
    tenantId: 'tenant_id',
    sessionId: 'session_id',
    createdAt: 'created_at',
    expiresAt: 'expires_at',
    lastUsed: 'last_used',
    ipAddress: 'ip_address',
    userAgent: 'user_agent',
    isActive: 'is_active',
    revokedAt: 'revoked_at',
    revokedBy: 'revoked_by',
    revocationReason: 'revocation_reason'
};
const publicTokens = {
    id: 'id',
    tokenHash: 'token_hash',
    tenantId: 'tenant_id',
    resourceType: 'resource_type',
    resourceId: 'resource_id',
    purpose: 'purpose',
    createdAt: 'created_at',
    expiresAt: 'expires_at',
    lastAccessed: 'last_accessed',
    accessCount: 'access_count',
    ipAddress: 'ip_address',
    userAgent: 'user_agent',
    isActive: 'is_active',
    revokedAt: 'revoked_at',
    revocationReason: 'revocation_reason'
};
const tokenAuditLogs = {
    id: 'id',
    tokenType: 'token_type',
    tokenId: 'token_id',
    userId: 'user_id',
    tenantId: 'tenant_id',
    action: 'action',
    ipAddress: 'ip_address',
    userAgent: 'user_agent',
    additionalData: 'additional_data',
    createdAt: 'created_at'
};
const pasetoKeys = {
    id: 'id',
    keyId: 'key_id',
    keyType: 'key_type',
    keyPurpose: 'key_purpose',
    keyData: 'key_data',
    createdAt: 'created_at',
    expiresAt: 'expires_at',
    isActive: 'is_active',
    revokedAt: 'revoked_at'
};
export class PasetoTokenService {
    fastify;
    db;
    redis;
    localKey = null;
    publicKey = null;
    secretKey = null;
    initialized = false;
    constructor(fastify) {
        this.fastify = fastify;
        this.db = fastify.db;
        this.redis = fastify.cache?.client; // Access Redis through cache plugin
        logger.info({
            hasDb: !!this.db,
            hasCache: !!(fastify.cache),
            hasRedis: !!this.redis,
            cacheType: typeof (fastify.cache)
        }, 'PasetoTokenService initialized');
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        if (!this.db) {
            this.db = this.fastify.db;
        }
        if (!this.redis) {
            this.redis = this.fastify.cache?.client;
            logger.info({
                hasCache: !!(this.fastify.cache),
                hasRedis: !!this.redis,
                cacheKeys: this.fastify.cache ? Object.keys(this.fastify.cache) : []
            }, 'Attempting to get Redis client');
        }
        // Initialize keys (in production, load from secure storage)
        await this.initializeKeys();
        this.initialized = true;
    }
    async initializeKeys() {
        try {
            // For development, generate keys on startup
            // In production, these should be loaded from secure key management
            // Generate keys using crypto.randomBytes for development
            // For v4.local (symmetric encryption)
            this.localKey = randomBytes(32); // 32 bytes for ChaCha20-Poly1305
            // For v4.public (asymmetric signing) - use Ed25519
            // Generate a simple key pair for development
            this.secretKey = randomBytes(32); // Ed25519 private key
            this.publicKey = randomBytes(32); // Ed25519 public key (derived from private)
            logger.info('PASETO keys generated successfully for development');
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to initialize PASETO keys');
            throw error;
        }
    }
    /**
     * Generate a cryptographically secure opaque token
     */
    generateOpaqueToken() {
        return randomBytes(32).toString('base64url');
    }
    /**
     * Hash a token for database storage
     */
    hashToken(token) {
        return createHash('sha256').update(token).digest('hex');
    }
    /**
     * Generate session ID
     */
    generateSessionId() {
        return generateId();
    }
    /**
     * Generate opaque access token with Redis session storage
     */
    async generateAccessToken(sessionData, binding) {
        await this.ensureInitialized();
        const token = this.generateOpaqueToken();
        const sessionId = this.generateSessionId();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Store in Redis for fast access (if available)
        if (this.redis) {
            try {
                const redisKey = `session:${token}`;
                const redisData = {
                    ...sessionData,
                    sessionId,
                    binding,
                    createdAt: sessionData.createdAt.toISOString(),
                    lastActivity: new Date().toISOString()
                };
                await this.redis.setex(redisKey, 900, JSON.stringify(redisData)); // 15 minutes
            }
            catch (error) {
                logger.warn({ err: error }, 'Redis session storage failed, continuing with database only');
            }
        }
        // Store in database for persistence and audit
        await this.db.execute(`
      INSERT INTO access_tokens (
        id, token, user_id, tenant_id, session_id, expires_at,
        ip_address, user_agent, fingerprint, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    `, [
            generateId(),
            token,
            sessionData.userId,
            sessionData.tenantId,
            sessionId,
            expiresAt,
            binding?.ipAddress,
            binding?.userAgent,
            binding?.fingerprint
        ]);
        // Audit log
        await this.auditLog('access', null, sessionData.userId, sessionData.tenantId, 'created', {
            sessionId,
            expiresAt: expiresAt.toISOString()
        }, binding);
        return token;
    }
    /**
     * Generate PASETO refresh token
     */
    async generateRefreshToken(userId, tenantId, binding) {
        await this.ensureInitialized();
        const sessionId = this.generateSessionId();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const payload = {
            sub: userId,
            tenant: tenantId,
            session: sessionId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(expiresAt.getTime() / 1000),
            purpose: 'refresh'
        };
        const token = await V4.encrypt(payload, this.localKey);
        const tokenHash = this.hashToken(token);
        // Store in database
        await this.db.execute(`
      INSERT INTO refresh_tokens (
        id, token_hash, user_id, tenant_id, session_id, expires_at,
        ip_address, user_agent, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
    `, [
            generateId(),
            tokenHash,
            userId,
            tenantId,
            sessionId,
            expiresAt,
            binding?.ipAddress,
            binding?.userAgent
        ]);
        // Audit log
        await this.auditLog('refresh', null, userId, tenantId, 'created', {
            sessionId,
            expiresAt: expiresAt.toISOString()
        }, binding);
        return token;
    }
    /**
     * Validate opaque access token
     */
    async validateAccessToken(token, binding) {
        await this.ensureInitialized();
        try {
            // Check Redis cache first (if available)
            if (this.redis) {
                try {
                    const redisKey = `session:${token}`;
                    const cached = await this.redis.get(redisKey);
                    if (cached) {
                        const sessionData = JSON.parse(cached);
                        // Validate token binding if provided
                        if (binding && !this.validateTokenBinding(sessionData.binding, binding)) {
                            await this.auditLog('access', null, sessionData.userId, sessionData.tenantId, 'binding_failed', {
                                expected: sessionData.binding,
                                actual: binding
                            });
                            return null;
                        }
                        // Update last activity
                        await this.updateTokenActivity(token, binding);
                        // Audit successful validation
                        await this.auditLog('access', null, sessionData.userId, sessionData.tenantId, 'validated', {
                            sessionId: sessionData.sessionId
                        }, binding);
                        return {
                            ...sessionData,
                            createdAt: new Date(sessionData.createdAt),
                            lastActivity: new Date()
                        };
                    }
                }
                catch (error) {
                    logger.warn({ err: error }, 'Redis cache access failed, falling back to database');
                }
            }
            // Fallback to database
            const dbResult = await this.db.execute(`
        SELECT at.*, u.email, u.first_name, u.last_name
        FROM access_tokens at
        JOIN users u ON at.user_id = u.id
        WHERE at.token = $1 
          AND at.is_active = true 
          AND at.expires_at > NOW()
      `, [token]);
            if (dbResult.length === 0) {
                return null;
            }
            const tokenData = dbResult[0];
            // Reconstruct session from database (this is slower)
            const sessionData = await this.reconstructSessionFromDatabase(tokenData);
            if (!sessionData) {
                return null;
            }
            // Validate token binding
            if (binding && !this.validateTokenBinding({
                ipAddress: tokenData.ip_address,
                userAgent: tokenData.user_agent,
                fingerprint: tokenData.fingerprint
            }, binding)) {
                await this.auditLog('access', tokenData.id, sessionData.userId, sessionData.tenantId, 'binding_failed', {
                    expected: { ipAddress: tokenData.ip_address, userAgent: tokenData.user_agent },
                    actual: binding
                });
                return null;
            }
            // Update activity and re-cache
            await this.updateTokenActivity(token, binding);
            return sessionData;
        }
        catch (error) {
            logger.error({ err: error, token: token.substring(0, 8) + '...' }, 'Token validation failed');
            return null;
        }
    }
    /**
     * Validate PASETO refresh token
     */
    async validateRefreshToken(token, binding) {
        await this.ensureInitialized();
        try {
            // Decrypt and verify PASETO token
            const payload = await V4.decrypt(token, this.localKey);
            if (!payload.sub || !payload.tenant || !payload.session) {
                return null;
            }
            // Check if token exists in database and is active
            const tokenHash = this.hashToken(token);
            const dbResult = await this.db.execute(`
        SELECT * FROM refresh_tokens 
        WHERE token_hash = $1 
          AND is_active = true 
          AND expires_at > NOW()
      `, [tokenHash]);
            if (dbResult.length === 0) {
                return null;
            }
            const tokenData = dbResult[0];
            // Validate token binding
            if (binding && !this.validateTokenBinding({
                ipAddress: tokenData.ip_address,
                userAgent: tokenData.user_agent
            }, binding)) {
                await this.auditLog('refresh', tokenData.id, payload.sub, payload.tenant, 'binding_failed', {
                    expected: { ipAddress: tokenData.ip_address, userAgent: tokenData.user_agent },
                    actual: binding
                });
                return null;
            }
            // Update last used timestamp
            await this.db.execute(`
        UPDATE refresh_tokens 
        SET last_used = NOW() 
        WHERE id = $1
      `, [tokenData.id]);
            // Audit log
            await this.auditLog('refresh', tokenData.id, payload.sub, payload.tenant, 'validated', {
                sessionId: payload.session
            }, binding);
            return {
                userId: payload.sub,
                tenantId: payload.tenant,
                sessionId: payload.session
            };
        }
        catch (error) {
            logger.error({ err: error }, 'Refresh token validation failed');
            return null;
        }
    }
    /**
     * Generate public PASETO token for customer portal
     */
    async generatePublicToken(tenantId, resourceType, resourceId, purpose, expiryDays = 30) {
        const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        const payload = {
            tenant: tenantId,
            resource: resourceId,
            resourceType,
            purpose,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(expiresAt.getTime() / 1000)
        };
        const token = await V4.sign(payload, this.secretKey);
        const tokenHash = this.hashToken(token);
        // Store in database for tracking
        await this.db.execute(`
      INSERT INTO public_tokens (
        id, token_hash, tenant_id, resource_type, resource_id, 
        purpose, expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    `, [
            generateId(),
            tokenHash,
            tenantId,
            resourceType,
            resourceId,
            purpose,
            expiresAt
        ]);
        // Audit log
        await this.auditLog('public', null, null, tenantId, 'created', {
            resourceType,
            resourceId,
            purpose,
            expiresAt: expiresAt.toISOString()
        });
        return token;
    }
    /**
     * Validate public PASETO token
     */
    async validatePublicToken(token, binding) {
        try {
            // Verify PASETO signature
            const payload = await V4.verify(token, this.publicKey);
            if (!payload.tenant || !payload.resource || !payload.resourceType) {
                return null;
            }
            // Check if token exists in database and is active
            const tokenHash = this.hashToken(token);
            const dbResult = await this.db.execute(`
        SELECT * FROM public_tokens 
        WHERE token_hash = $1 
          AND is_active = true 
          AND expires_at > NOW()
      `, [tokenHash]);
            if (dbResult.length === 0) {
                return null;
            }
            const tokenData = dbResult[0];
            // Update access tracking
            await this.db.execute(`
        UPDATE public_tokens 
        SET last_accessed = NOW(), 
            access_count = access_count + 1,
            ip_address = $2,
            user_agent = $3
        WHERE id = $1
      `, [tokenData.id, binding?.ipAddress, binding?.userAgent]);
            // Audit log
            await this.auditLog('public', tokenData.id, null, payload.tenant, 'validated', {
                resourceType: payload.resourceType,
                resourceId: payload.resource,
                purpose: payload.purpose
            }, binding);
            return payload;
        }
        catch (error) {
            logger.error({ err: error }, 'Public token validation failed');
            return null;
        }
    }
    /**
     * Revoke tokens by user/tenant/session
     */
    async revokeTokens(options) {
        let revokedCount = 0;
        try {
            if (!options.tokenType || options.tokenType === 'access') {
                // Revoke access tokens
                const accessQuery = this.buildRevokeQuery('access_tokens', options);
                const accessResult = await this.db.execute(accessQuery.sql, accessQuery.params);
                revokedCount += accessResult.length;
                // Clear Redis sessions
                if (options.sessionId) {
                    const keys = await this.redis.keys(`session:*`);
                    for (const key of keys) {
                        const sessionData = await this.redis.get(key);
                        if (sessionData) {
                            const parsed = JSON.parse(sessionData);
                            if (parsed.sessionId === options.sessionId) {
                                await this.redis.del(key);
                            }
                        }
                    }
                }
            }
            if (!options.tokenType || options.tokenType === 'refresh') {
                // Revoke refresh tokens
                const refreshQuery = this.buildRevokeQuery('refresh_tokens', options);
                const refreshResult = await this.db.execute(refreshQuery.sql, refreshQuery.params);
                revokedCount += refreshResult.length;
            }
            if (!options.tokenType || options.tokenType === 'public') {
                // Revoke public tokens
                const publicQuery = this.buildRevokeQuery('public_tokens', options);
                const publicResult = await this.db.execute(publicQuery.sql, publicQuery.params);
                revokedCount += publicResult.length;
            }
            // Audit log
            await this.auditLog(options.tokenType || 'all', null, options.userId || null, options.tenantId || null, 'revoked', {
                reason: options.reason,
                revokedBy: options.revokedBy,
                revokedCount
            });
            logger.info({ revokedCount, options }, 'Tokens revoked successfully');
            return revokedCount;
        }
        catch (error) {
            logger.error({ err: error, options }, 'Token revocation failed');
            throw error;
        }
    }
    /**
     * Get active sessions for a user
     */
    async getActiveSessions(userId) {
        const result = await this.db.execute(`
      SELECT id, token, user_id, tenant_id, session_id, expires_at, last_activity, is_active
      FROM access_tokens
      WHERE user_id = $1 
        AND is_active = true 
        AND expires_at > NOW()
      ORDER BY last_activity DESC
    `, [userId]);
        return result.map((row) => ({
            id: row.id,
            token: row.token.substring(0, 8) + '...', // Masked token
            userId: row.user_id,
            tenantId: row.tenant_id,
            sessionId: row.session_id,
            expiresAt: new Date(row.expires_at),
            lastActivity: new Date(row.last_activity),
            isActive: row.is_active
        }));
    }
    /**
     * Clean up expired tokens
     */
    async cleanupExpiredTokens() {
        const result = await this.db.execute(`
      SELECT cleanup_expired_tokens() as deleted_count
    `);
        const deletedCount = result[0]?.deleted_count || 0;
        logger.info({ deletedCount }, 'Expired tokens cleaned up');
        return deletedCount;
    }
    // Private helper methods
    validateTokenBinding(stored, current) {
        if (!stored || !current) {
            return true; // No binding required
        }
        // Strict IP validation (consider mobile users)
        if (stored.ipAddress && current.ipAddress && stored.ipAddress !== current.ipAddress) {
            return false;
        }
        // User agent validation (warning only, don't fail)
        if (stored.userAgent && current.userAgent && stored.userAgent !== current.userAgent) {
            logger.warn({ stored: stored.userAgent, current: current.userAgent }, 'User agent mismatch');
        }
        return true;
    }
    async updateTokenActivity(token, binding) {
        // Update Redis
        const redisKey = `session:${token}`;
        const cached = await this.redis.get(redisKey);
        if (cached) {
            const sessionData = JSON.parse(cached);
            sessionData.lastActivity = new Date().toISOString();
            if (binding) {
                sessionData.binding = binding;
            }
            await this.redis.setex(redisKey, 900, JSON.stringify(sessionData));
        }
        // Update database
        await this.db.execute(`
      UPDATE access_tokens 
      SET last_activity = NOW(),
          ip_address = COALESCE($2, ip_address),
          user_agent = COALESCE($3, user_agent)
      WHERE token = $1
    `, [token, binding?.ipAddress, binding?.userAgent]);
    }
    async reconstructSessionFromDatabase(tokenData) {
        // This would need to load user permissions, roles, etc.
        // For now, return a basic session structure
        return {
            userId: tokenData.user_id,
            tenantId: tokenData.tenant_id,
            organizationId: tokenData.tenant_id, // Legacy compatibility
            roles: [], // Would load from database
            permissions: [], // Would load from database
            memberships: [], // Would load from database
            createdAt: new Date(tokenData.created_at),
            lastActivity: new Date(),
            ipAddress: tokenData.ip_address,
            userAgent: tokenData.user_agent,
            fingerprint: tokenData.fingerprint
        };
    }
    buildRevokeQuery(table, options) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (options.userId) {
            conditions.push(`user_id = $${paramIndex++}`);
            params.push(options.userId);
        }
        if (options.tenantId) {
            conditions.push(`tenant_id = $${paramIndex++}`);
            params.push(options.tenantId);
        }
        if (options.sessionId) {
            conditions.push(`session_id = $${paramIndex++}`);
            params.push(options.sessionId);
        }
        conditions.push(`is_active = true`);
        const sql = `
      UPDATE ${table} 
      SET is_active = false, 
          revoked_at = NOW(),
          revoked_by = $${paramIndex++},
          revocation_reason = $${paramIndex++}
      WHERE ${conditions.join(' AND ')}
      RETURNING id
    `;
        params.push(options.revokedBy || null);
        params.push(options.reason || 'Manual revocation');
        return { sql, params };
    }
    async auditLog(tokenType, tokenId, userId, tenantId, action, additionalData, binding) {
        try {
            await this.db.execute(`
        INSERT INTO token_audit_logs (
          id, token_type, token_id, user_id, tenant_id, action,
          ip_address, user_agent, additional_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
                generateId(),
                tokenType,
                tokenId,
                userId,
                tenantId,
                action,
                binding?.ipAddress,
                binding?.userAgent,
                additionalData ? JSON.stringify(additionalData) : null
            ]);
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to write audit log');
            // Don't throw - audit logging failure shouldn't break token operations
        }
    }
}
export default PasetoTokenService;
//# sourceMappingURL=paseto-service.js.map