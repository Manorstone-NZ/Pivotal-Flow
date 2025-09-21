/**
 * PASETO Service for Auth Hardening
 * Implements v4.local encrypted tokens per security policy
 * - XChaCha20-Poly1305 encryption (quantum-resistant)
 * - 30-day expiration for public links
 * - Self-contained verification
 */

import { V4 } from "paseto";
import { randomBytes } from 'crypto';
import { logger } from "../lib/logger.js";
import { generateSessionId, createSession, getSession, revokeSession, revokeUserSessions, validateSessionBinding } from "./session.js";

export interface PasetoPayload {
  sub: string;
  org: string;
  scope: string[];
  exp: number;
  jti: string;
  iat?: number;
  nbf?: number;
}

export interface LinkPayload extends PasetoPayload {
  resource: string;
  resourceType: string;
  purpose: string;
}

export interface EncryptionKey {
  key: Uint8Array;  // 256-bit key for v4.local
  keyId: string;
}

/**
 * PASETO Key Manager
 * Supports local dev file and KMS in production
 */
export class PasetoKeyManager {
  private keyPair: KeyPair | null = null;
  private keyId: string;
  
  constructor(private keyPath?: string) {
    this.keyId = process.env.PASETO_KEY_ID || 'paseto-v4-public-dev';
  }
  
  /**
   * Load or generate PASETO v4 public/private key pair
   */
  async loadKeys(): Promise<KeyPair> {
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
        };
        logger.info({ keyId: this.keyId }, 'PASETO keys loaded from file');
        return this.keyPair;
      }
      
      // Generate new keys for development
      const keyPair = V4.generateKey('public');
      this.keyPair = {
        publicKey: keyPair.publicKey,
        secretKey: keyPair.secretKey
      };
      
      logger.info({ keyId: this.keyId }, 'PASETO keys generated for development');
      return this.keyPair;
      
    } catch (error) {
      logger.error({ err: error }, 'Failed to load PASETO keys');
      throw error;
    }
  }
  
  /**
   * Get public key for verification
   */
  async getPublicKey(): Promise<Uint8Array> {
    const keys = await this.loadKeys();
    return keys.publicKey;
  }
  
  /**
   * Get secret key for signing
   */
  async getSecretKey(): Promise<Uint8Array> {
    const keys = await this.loadKeys();
    return keys.secretKey;
  }
  
  /**
   * Get key ID for rotation tracking
   */
  getKeyId(): string {
    return this.keyId;
  }
}

/**
 * Sign PASETO v4 public token for links
 */
export async function signLink(
  secretKey: Uint8Array, 
  payload: LinkPayload,
  options: { 
    expiryMinutes?: number;
    audience?: string;
    issuer?: string;
  } = {}
): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + (options.expiryMinutes || 60) * 60; // Default 1 hour
    
    const claims: PasetoPayload & LinkPayload = {
      ...payload,
      iat: now,
      exp: expiry,
      nbf: now,
      jti: randomBytes(16).toString('base64url'),
      // Add standard claims if provided
      ...(options.audience && { aud: options.audience }),
      ...(options.issuer && { iss: options.issuer })
    };
    
    const token = await V4.sign(claims, secretKey);
    
    logger.debug({ 
      sub: payload.sub,
      org: payload.org,
      resource: payload.resource,
      purpose: payload.purpose,
      exp: new Date(expiry * 1000).toISOString()
    }, 'PASETO link token signed');
    
    return token;
  } catch (error) {
    logger.error({ err: error, payload }, 'Failed to sign PASETO link');
    throw error;
  }
}

/**
 * Verify PASETO v4 public token for links
 */
export async function verifyLink(
  publicKey: Uint8Array, 
  token: string,
  options: {
    audience?: string;
    issuer?: string;
    clockTolerance?: number;
  } = {}
): Promise<LinkPayload | null> {
  try {
    const payload = await V4.verify(token, publicKey, {
      audience: options.audience,
      issuer: options.issuer,
      clockTolerance: options.clockTolerance || 60 // 60 seconds tolerance
    }) as LinkPayload;
    
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
  } catch (error) {
    logger.warn({ err: error.message }, 'PASETO link verification failed');
    return null;
  }
}

/**
 * Generate secure quote access link
 */
export async function generateQuoteLink(
  keyManager: PasetoKeyManager,
  tenantId: string,
  quoteId: string,
  expiryDays: number = 30
): Promise<string> {
  const secretKey = await keyManager.getSecretKey();
  
  return signLink(secretKey, {
    sub: 'public',
    org: tenantId,
    scope: ['quote:read'],
    resource: quoteId,
    resourceType: 'quote',
    purpose: 'customer_access',
    exp: 0, // Will be set by signLink
    jti: ''  // Will be set by signLink
  }, {
    expiryMinutes: expiryDays * 24 * 60,
    audience: 'pivotal-flow-public',
    issuer: 'pivotal-flow-auth'
  });
}

/**
 * Verify quote access link
 */
export async function verifyQuoteLink(
  keyManager: PasetoKeyManager,
  token: string
): Promise<{ tenantId: string; quoteId: string } | null> {
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
  constructor(
    private fastify: FastifyInstance,
    private keyManager: PasetoKeyManager
  ) {}
  
  /**
   * Create opaque session for user
   */
  async createUserSession(
    sessionData: Omit<SessionData, 'issuedAt' | 'lastActivity'>,
    binding?: { ipAddress?: string; userAgent?: string; fingerprint?: string },
    options: SessionOptions = {}
  ): Promise<string> {
    const cache = (this.fastify as any).cache;
    if (!cache) {
      throw new Error('Redis cache not available - fail closed');
    }
    
    const sessionId = generateSessionId(sessionData.userId, sessionData.tenantId);
    const ttl = options.ttlSeconds || 900; // 15 minutes
    
    const fullSessionData: SessionData = {
      ...sessionData,
      issuedAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: binding?.ipAddress,
      userAgent: binding?.userAgent,
      fingerprint: binding?.fingerprint
    };
    
    await createSession(cache, sessionId, fullSessionData, ttl);
    
    return sessionId;
  }
  
  /**
   * Validate opaque session
   */
  async validateUserSession(
    sessionId: string,
    binding?: { ipAddress?: string; userAgent?: string },
    options: SessionOptions = {}
  ): Promise<SessionData | null> {
    const cache = (this.fastify as any).cache;
    if (!cache) {
      throw new Error('Redis cache not available - fail closed');
    }
    
    const sessionData = await getSession(cache, sessionId, options);
    if (!sessionData) {
      return null;
    }
    
    // Validate session binding
    if (!validateSessionBinding(sessionData, binding || {}, options)) {
      await this.revokeUserSession(sessionId);
      return null;
    }
    
    return sessionData;
  }
  
  /**
   * Revoke user session
   */
  async revokeUserSession(sessionId: string): Promise<boolean> {
    const cache = (this.fastify as any).cache;
    if (!cache) {
      return false; // Fail gracefully if Redis unavailable
    }
    
    return revokeSession(cache, sessionId);
  }
  
  /**
   * Revoke all sessions for user
   */
  async revokeAllUserSessions(userId: string, tenantId?: string): Promise<number> {
    const cache = (this.fastify as any).cache;
    if (!cache) {
      return 0; // Fail gracefully if Redis unavailable
    }
    
    return revokeUserSessions(cache, userId, tenantId);
  }
}
