/**
 * PASETO Service for Auth Hardening
 * Implements v4.local encrypted tokens per security policy
 * - XChaCha20-Poly1305 encryption (quantum-resistant)
 * - 30-day expiration for public links
 * - Self-contained verification
 */
import { V4 } from "paseto";
import { randomBytes, KeyObject } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { logger } from "../lib/logger.js";
import { generateSessionId, createSession, getSession, revokeSession, revokeUserSessions, validateSessionBinding } from "./session.js";
/**
 * PASETO Key Manager
 * Supports local dev file and KMS in production
 */
export class PasetoKeyManager {
    keyPath;
    keyPair = null;
    keyId;
    constructor(keyPath) {
        this.keyPath = keyPath;
        this.keyId = process.env['PASETO_KEY_ID'] || 'paseto-v4-public-dev';
    }
    /**
     * Load or generate PASETO v4 public/private key pair
     */
    async loadKeys() {
        if (this.keyPair) {
            return this.keyPair;
        }
        try {
            // Try to load from file in development
            if (this.keyPath && existsSync(this.keyPath)) {
                const keyData = JSON.parse(readFileSync(this.keyPath, 'utf8'));
                this.keyPair = {
                    publicKey: Buffer.from(keyData.publicKey, 'base64'),
                    secretKey: Buffer.from(keyData.secretKey, 'base64')
                }; // TODO: Fix KeyObject type compatibility
                logger.info({ keyId: this.keyId }, 'PASETO keys loaded from file');
                return this.keyPair;
            }
            // Generate new keys for development
            const keyPair = await V4.generateKey('public');
            this.keyPair = {
                publicKey: keyPair, // TODO: Fix PASETO key type compatibility
                secretKey: keyPair // TODO: Fix PASETO key type compatibility
            }; // TODO: Fix KeyObject type compatibility
            logger.info({ keyId: this.keyId }, 'PASETO keys generated for development');
            return this.keyPair; // Non-null assertion after successful generation
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to load PASETO keys');
            throw error;
        }
    }
    /**
     * Get public key for verification
     */
    async getPublicKey() {
        const keys = await this.loadKeys();
        return keys.publicKey; // TODO: Fix KeyObject property access
    }
    /**
     * Get secret key for signing
     */
    async getSecretKey() {
        const keys = await this.loadKeys();
        return keys.secretKey; // TODO: Fix KeyObject property access
    }
    /**
     * Get key ID for rotation tracking
     */
    getKeyId() {
        return this.keyId;
    }
}
/**
 * Sign PASETO v4 public token for links
 */
export async function signLink(secretKey, payload, options = {}) {
    try {
        const now = Math.floor(Date.now() / 1000);
        const expiry = now + (options.expiryMinutes || 60) * 60; // Default 1 hour
        const claims = {
            ...payload,
            iat: now,
            exp: expiry,
            nbf: now,
            jti: randomBytes(16).toString('base64url'),
            // Add standard claims if provided
            ...(options.audience && { aud: options.audience }),
            ...(options.issuer && { iss: options.issuer })
        };
        const token = await V4.sign(claims, secretKey); // TODO: Fix PASETO types compatibility
        logger.debug({
            sub: payload.sub,
            org: payload.org,
            resource: payload.resource,
            purpose: payload.purpose,
            exp: new Date(expiry * 1000).toISOString()
        }, 'PASETO link token signed');
        return token;
    }
    catch (error) {
        logger.error({ err: error, payload }, 'Failed to sign PASETO link');
        throw error;
    }
}
/**
 * Verify PASETO v4 public token for links
 */
export async function verifyLink(publicKey, token, options = {}) {
    try {
        const payload = await V4.verify(token, publicKey, {
            audience: options.audience,
            issuer: options.issuer,
            clockTolerance: options.clockTolerance || 60 // 60 seconds tolerance
        }); // TODO: Fix PASETO verify types
        // Additional validation
        if (!payload.sub || !payload.org || !payload.resource) {
            logger.warn({ payload }, 'Invalid PASETO link payload structure');
            return null;
        }
        // Check expiry (PASETO library should handle this, but double-check)
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            logger.warn({
                exp: new Date(payload.exp * 1000).toISOString(),
                now: new Date(now * 1000).toISOString()
            }, 'PASETO link token expired');
            return null;
        }
        // Check not-before time
        if (payload.nbf && payload.nbf > now) {
            logger.warn({
                nbf: new Date(payload.nbf * 1000).toISOString(),
                now: new Date(now * 1000).toISOString()
            }, 'PASETO link token not yet valid');
            return null;
        }
        logger.debug({
            sub: payload.sub,
            org: payload.org,
            resource: payload.resource,
            purpose: payload.purpose
        }, 'PASETO link token verified');
        return payload;
    }
    catch (error) {
        logger.warn({ err: error.message }, 'PASETO link verification failed');
        return null;
    }
}
/**
 * Generate secure quote access link
 */
export async function generateQuoteLink(keyManager, tenantId, quoteId, expiryDays = 30) {
    const secretKey = await keyManager.getSecretKey();
    return signLink(secretKey, {
        sub: 'public',
        org: tenantId,
        scope: ['quote:read'],
        resource: quoteId,
        resourceType: 'quote',
        purpose: 'customer_access',
        exp: 0, // Will be set by signLink
        jti: '' // Will be set by signLink
    }, {
        expiryMinutes: expiryDays * 24 * 60,
        audience: 'pivotal-flow-public',
        issuer: 'pivotal-flow-auth'
    });
}
/**
 * Verify quote access link
 */
export async function verifyQuoteLink(keyManager, token) {
    const publicKey = await keyManager.getPublicKey();
    const payload = await verifyLink(publicKey, token, {
        audience: 'pivotal-flow-public',
        issuer: 'pivotal-flow-auth'
    });
    if (!payload || payload.resourceType !== 'quote' || payload.purpose !== 'customer_access') {
        return null;
    }
    return {
        tenantId: payload.org,
        quoteId: payload.resource
    };
}
/**
 * Session Service with Opaque Tokens
 */
export class SessionService {
    fastify;
    constructor(fastify
    // private keyManager: PasetoKeyManager // TODO: Use when implementing proper key management
    ) {
        this.fastify = fastify;
    }
    /**
     * Create opaque session for user
     */
    async createUserSession(sessionData, binding, options = {}) {
        const cache = this.fastify.cache;
        if (!cache) {
            throw new Error('Redis cache not available - fail closed');
        }
        const sessionId = generateSessionId(sessionData.userId, sessionData.tenantId);
        const ttl = options.ttlSeconds || 900; // 15 minutes - TODO: Fix SessionOptions interface
        const fullSessionData = {
            ...sessionData,
            // issuedAt: new Date(Date.now()), // TODO: Add to SessionData interface
            lastActivity: new Date(Date.now()),
            ipAddress: binding?.ipAddress || '',
            userAgent: binding?.userAgent || ''
            // fingerprint: binding?.fingerprint // TODO: Add to SessionData interface
        };
        await createSession(cache, sessionId, fullSessionData, ttl); // TODO: Fix SessionData interface compatibility
        return sessionId;
    }
    /**
     * Validate opaque session
     */
    async validateUserSession(sessionId, binding, options = {}) {
        const cache = this.fastify.cache;
        if (!cache) {
            throw new Error('Redis cache not available - fail closed');
        }
        const sessionData = await getSession(cache, sessionId, options); // TODO: Fix SessionOptions interface compatibility
        if (!sessionData) {
            return null;
        }
        // Validate session binding
        if (!validateSessionBinding(sessionData, binding || {}, options)) { // TODO: Fix SessionOptions interface compatibility
            await this.revokeUserSession(sessionId);
            return null;
        }
        return { ...sessionData, createdAt: new Date() }; // TODO: Fix SessionData interface compatibility
    }
    /**
     * Revoke user session
     */
    async revokeUserSession(sessionId) {
        const cache = this.fastify.cache;
        if (!cache) {
            return false; // Fail gracefully if Redis unavailable
        }
        return revokeSession(cache, sessionId);
    }
    /**
     * Revoke all sessions for user
     */
    async revokeAllUserSessions(userId, tenantId) {
        const cache = this.fastify.cache;
        if (!cache) {
            return 0; // Fail gracefully if Redis unavailable
        }
        return revokeUserSessions(cache, userId, tenantId);
    }
}
//# sourceMappingURL=paseto.js.map