/**
 * PASETO v4.local Service for Auth Hardening
 * Implements encrypted tokens per security policy:
 * - XChaCha20-Poly1305 encryption (quantum-resistant)
 * - 30-day expiration for public links
 * - Self-contained verification
 * - No database lookup required
 */

import { V4 } from "paseto";
import { randomBytes } from 'crypto';
import { logger } from "../lib/logger.js";

export interface PasetoLocalPayload {
  sub: string;          // User ID
  org: string;          // Tenant/Organization ID
  scope: string[];      // Permissions/scopes
  exp: number;          // Expiration timestamp
  iat: number;          // Issued at timestamp
  jti: string;          // JWT ID (unique token identifier)
  purpose: string;      // Token purpose (e.g., 'quote-delivery', 'service-auth')
  resource?: string;    // Resource ID (e.g., quote ID)
  resourceType?: string; // Resource type (e.g., 'quote', 'invoice')
}

export interface EncryptionKey {
  key: Uint8Array;      // 256-bit symmetric key
  keyId: string;        // Key identifier for rotation
}

/**
 * PASETO v4.local Key Manager
 * Manages symmetric encryption keys for v4.local tokens
 */
export class PasetoLocalKeyManager {
  private encryptionKey: EncryptionKey | null = null;
  private keyId: string;
  
  constructor() {
    this.keyId = process.env.PASETO_KEY_ID || 'paseto-v4-local-dev';
  }

  /**
   * Generate or load 256-bit encryption key for v4.local
   */
  async getEncryptionKey(): Promise<EncryptionKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // In development: generate a random key
    // In production: load from secure key management (HSM/KMS)
    if (process.env.NODE_ENV === 'development') {
      const key = randomBytes(32); // 256-bit key
      this.encryptionKey = {
        key,
        keyId: this.keyId
      };
      
      logger.info({
        keyId: this.keyId,
        keyLength: key.length * 8
      }, 'PASETO v4.local encryption key generated for development');
      
      return this.encryptionKey;
    }

    // Production: implement secure key loading
    // TODO: Integrate with AWS KMS, Azure Key Vault, etc.
    throw new Error('Production key management not implemented');
  }
}

/**
 * PASETO v4.local Token Service
 * Handles encryption/decryption of PASETO v4.local tokens
 */
export class PasetoLocalService {
  private keyManager: PasetoLocalKeyManager;
  
  constructor() {
    this.keyManager = new PasetoLocalKeyManager();
  }

  /**
   * Generate encrypted PASETO v4.local token
   */
  async generateToken(payload: Omit<PasetoLocalPayload, 'iat' | 'jti'>): Promise<string> {
    try {
      const encKey = await this.keyManager.getEncryptionKey();
      
      // Add standard claims
      const fullPayload: PasetoLocalPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: randomBytes(16).toString('hex')
      };

      // Generate encrypted v4.local token
      const token = await V4.encrypt(fullPayload, encKey.key);
      
      logger.debug({
        purpose: payload.purpose,
        sub: payload.sub,
        org: payload.org,
        exp: new Date(payload.exp * 1000).toISOString(),
        keyId: encKey.keyId
      }, 'PASETO v4.local token generated');
      
      return token;
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate PASETO v4.local token');
      throw error;
    }
  }

  /**
   * Decrypt and verify PASETO v4.local token
   */
  async verifyToken(token: string): Promise<PasetoLocalPayload> {
    try {
      const encKey = await this.keyManager.getEncryptionKey();
      
      // Decrypt and parse token
      const payload = await V4.decrypt(token, encKey.key);
      
      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verify issued at (not in future)
      if (payload.iat && payload.iat > now + 60) { // 60 second clock skew tolerance
        throw new Error('Token issued in future');
      }
      
      logger.debug({
        purpose: payload.purpose,
        sub: payload.sub,
        org: payload.org,
        jti: payload.jti
      }, 'PASETO v4.local token verified');
      
      return payload as PasetoLocalPayload;
    } catch (error) {
      logger.error({ err: error }, 'Failed to verify PASETO v4.local token');
      throw error;
    }
  }

  /**
   * Generate public quote delivery token (30-day expiration)
   */
  async generateQuoteDeliveryToken(quoteId: string, tenantId: string, userId: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
    
    return this.generateToken({
      sub: userId,
      org: tenantId,
      scope: ['quote:view', 'quote:approve', 'quote:reject'],
      exp,
      purpose: 'quote-delivery',
      resource: quoteId,
      resourceType: 'quote'
    });
  }

  /**
   * Generate service-to-service authentication token (1 hour expiration)
   */
  async generateServiceToken(serviceId: string, tenantId: string, scopes: string[]): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour
    
    return this.generateToken({
      sub: serviceId,
      org: tenantId,
      scope: scopes,
      exp,
      purpose: 'service-auth'
    });
  }
}
