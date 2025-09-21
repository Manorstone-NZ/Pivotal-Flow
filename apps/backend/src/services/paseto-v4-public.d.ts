/**
 * PASETO v4.public Service for Signed Links & Service-to-Service Auth
 * Per security policy corrections:
 * - v4.public with Ed25519 signatures (NOT v4.local)
 * - Short-lived: 5-15 minutes (NOT 30 days)
 * - One-time use via JTI tracking in Redis
 * - Service-to-service authentication
 */
import type { FastifyInstance } from 'fastify';
export interface PasetoPublicPayload {
    sub: string;
    org: string;
    scope: string[];
    exp: number;
    iat: number;
    jti: string;
    purpose: string;
    resource?: string;
    resourceType?: string;
}
export interface Ed25519KeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
    keyId: string;
}
/**
 * PASETO v4.public Key Manager
 * Manages Ed25519 key pairs for signing/verification
 */
export declare class PasetoPublicKeyManager {
    private keyPair;
    private keyId;
    constructor();
    /**
     * Generate or load Ed25519 key pair for v4.public
     */
    getKeyPair(): Promise<Ed25519KeyPair>;
}
/**
 * PASETO v4.public Token Service
 * Handles signing/verification of PASETO v4.public tokens
 */
export declare class PasetoPublicService {
    private keyManager;
    private redis;
    constructor(fastify?: FastifyInstance);
    /**
     * Generate signed PASETO v4.public token
     */
    generateToken(payload: Omit<PasetoPublicPayload, 'iat' | 'jti'>): Promise<string>;
    /**
     * Verify and consume PASETO v4.public token (one-time use)
     */
    verifyAndConsumeToken(token: string): Promise<PasetoPublicPayload>;
    /**
     * Verify PASETO v4.public token without consuming (for read-only checks)
     */
    verifyTokenReadOnly(token: string): Promise<PasetoPublicPayload>;
    /**
     * Generate quote delivery link token (15-minute expiry, one-time use)
     */
    generateQuoteDeliveryToken(quoteId: string, tenantId: string, userId: string): Promise<string>;
    /**
     * Generate service-to-service authentication token (5-minute expiry)
     */
    generateServiceToken(serviceId: string, tenantId: string, scopes: string[]): Promise<string>;
    /**
     * Generate invoice access token (10-minute expiry, one-time use)
     */
    generateInvoiceAccessToken(invoiceId: string, tenantId: string, userId: string): Promise<string>;
}
//# sourceMappingURL=paseto-v4-public.d.ts.map