/**
 * PASETO v4.public Service for Signed Links & Service-to-Service Auth
 * Per security policy corrections:
 * - v4.public with Ed25519 signatures (NOT v4.local)
 * - Short-lived: 5-15 minutes (NOT 30 days)
 * - One-time use via JTI tracking in Redis
 * - Service-to-service authentication
 */

import { V4 } from "paseto";
import { randomBytes } from 'crypto';
import { logger } from "../lib/logger.js";
import type { FastifyInstance } from 'fastify';

export interface PasetoPublicPayload {
  sub: string;          // User ID or Service ID
  org: string;          // Tenant/Organization ID
  scope: string[];      // Narrow permissions/scopes
  exp: number;          // Expiration timestamp (5-15 minutes)
  iat: number;          // Issued at timestamp
  jti: string;          // JWT ID (unique token identifier for one-time use)
  purpose: string;      // Token purpose ('quote-link', 'service-auth', etc.)
  resource?: string;    // Resource ID (e.g., quote ID)
  resourceType?: string; // Resource type (e.g., 'quote', 'invoice')
}

export interface Ed25519KeyPair {
  publicKey: Uint8Array;  // Ed25519 public key for verification
  secretKey: Uint8Array;  // Ed25519 private key for signing
  keyId: string;          // Key identifier for rotation
}

/**
 * PASETO v4.public Key Manager
 * Manages Ed25519 key pairs for signing/verification
 */
export class PasetoPublicKeyManager {
  private keyPair: Ed25519KeyPair | null = null;
  private keyId: string;
  
  constructor() {
    this.keyId = process.env['PASETO_KEY_ID'] || 'paseto-v4-public-dev';
  }

  /**
   * Generate or load Ed25519 key pair for v4.public
   */
  async getKeyPair(): Promise<Ed25519KeyPair> {
    if (this.keyPair) {
      return this.keyPair;
    }

    // In development: generate Ed25519 key pair
    // In production: load from secure key management (HSM/KMS)
    if (process.env.NODE_ENV === 'development') {
      const keyPair = await V4.generateKey('public');
      this.keyPair = {
        publicKey: keyPair.publicKey.export({ type: 'spki', format: 'der' }) as Uint8Array,
        secretKey: keyPair.secretKey.export({ type: 'pkcs8', format: 'der' }) as Uint8Array,
        keyId: this.keyId
      };
      
      logger.info({
        keyId: this.keyId,
        algorithm: 'Ed25519'
      }, 'PASETO v4.public Ed25519 key pair generated for development');
      
      return this.keyPair;
    }

    // Production: implement secure key loading from KMS/HSM
    throw new Error('Production key management not implemented');
  }
}

/**
 * PASETO v4.public Token Service
 * Handles signing/verification of PASETO v4.public tokens
 */
export class PasetoPublicService {
  private keyManager: PasetoPublicKeyManager;
  private redis: any;
  
  constructor(fastify?: FastifyInstance) {
    this.keyManager = new PasetoPublicKeyManager();
    this.redis = (fastify as any)?.cache; // Redis client for JTI tracking
  }

  /**
   * Generate signed PASETO v4.public token
   */
  async generateToken(payload: Omit<PasetoPublicPayload, 'iat' | 'jti'>): Promise<string> {
    try {
      const keyPair = await this.keyManager.getKeyPair();
      
      // Add standard claims
      const jti = randomBytes(16).toString('hex');
      const fullPayload: PasetoPublicPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti
      };

      // Generate signed v4.public token
      const token = await V4.sign(fullPayload, keyPair.secretKey);
      
      logger.debug({
        purpose: payload.purpose,
        sub: payload.sub,
        org: payload.org,
        exp: new Date(payload.exp * 1000).toISOString(),
        jti,
        keyId: keyPair.keyId
      }, 'PASETO v4.public token generated');
      
      return token;
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate PASETO v4.public token');
      throw error;
    }
  }

  /**
   * Verify and consume PASETO v4.public token (one-time use)
   */
  async verifyAndConsumeToken(token: string): Promise<PasetoPublicPayload> {
    try {
      const keyPair = await this.keyManager.getKeyPair();
      
      // Verify signature and parse token
      const payload = await V4.verify(token, keyPair.publicKey);
      
      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verify issued at (not in future, with 60s clock skew tolerance)
      if (payload.iat && payload.iat > now + 60) {
        throw new Error('Token issued in future');
      }

      // Check if token has already been used (JTI tracking)
      if (this.redis && payload.jti) {
        const jtiKey = `paseto:jti:${payload.jti}`;
        const alreadyUsed = await this.redis.get(jtiKey);
        
        if (alreadyUsed) {
          logger.warn({
            jti: payload.jti,
            purpose: payload.purpose
          }, 'PASETO token reuse attempt blocked');
          throw new Error('Token already used');
        }

        // Mark token as used (TTL = remaining token lifetime + buffer)
        const ttl = Math.max(payload.exp - now + 300, 300); // 5 min buffer
        await this.redis.set(jtiKey, 'used', ttl);
      }
      
      logger.debug({
        purpose: payload.purpose,
        sub: payload.sub,
        org: payload.org,
        jti: payload.jti
      }, 'PASETO v4.public token verified and consumed');
      
      return payload as PasetoPublicPayload;
    } catch (error) {
      logger.error({ err: error }, 'Failed to verify PASETO v4.public token');
      throw error;
    }
  }

  /**
   * Verify PASETO v4.public token without consuming (for read-only checks)
   */
  async verifyTokenReadOnly(token: string): Promise<PasetoPublicPayload> {
    try {
      const keyPair = await this.keyManager.getKeyPair();
      
      // Verify signature and parse token
      const payload = await V4.verify(token, keyPair.publicKey);
      
      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verify issued at
      if (payload.iat && payload.iat > now + 60) {
        throw new Error('Token issued in future');
      }
      
      return payload as PasetoPublicPayload;
    } catch (error) {
      logger.error({ err: error }, 'Failed to verify PASETO v4.public token (read-only)');
      throw error;
    }
  }

  /**
   * Generate quote delivery link token (15-minute expiry, one-time use)
   */
  async generateQuoteDeliveryToken(quoteId: string, tenantId: string, userId: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
    
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
   * Generate service-to-service authentication token (5-minute expiry)
   */
  async generateServiceToken(serviceId: string, tenantId: string, scopes: string[]): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + (5 * 60); // 5 minutes
    
    return this.generateToken({
      sub: serviceId,
      org: tenantId,
      scope: scopes,
      exp,
      purpose: 'service-auth'
    });
  }

  /**
   * Generate invoice access token (10-minute expiry, one-time use)
   */
  async generateInvoiceAccessToken(invoiceId: string, tenantId: string, userId: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + (10 * 60); // 10 minutes
    
    return this.generateToken({
      sub: userId,
      org: tenantId,
      scope: ['invoice:view'],
      exp,
      purpose: 'invoice-access',
      resource: invoiceId,
      resourceType: 'invoice'
    });
  }
}
