/**
 * PASETO Service for Auth Hardening
 * Implements v4.local encrypted tokens per security policy
 * - XChaCha20-Poly1305 encryption (quantum-resistant)
 * - 30-day expiration for public links
 * - Self-contained verification
 */
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
    key: Uint8Array;
    keyId: string;
}
/**
 * PASETO Key Manager
 * Supports local dev file and KMS in production
 */
export declare class PasetoKeyManager {
    private keyPath?;
    private keyPair;
    private keyId;
    constructor(keyPath?: string | undefined);
    /**
     * Load or generate PASETO v4 public/private key pair
     */
    loadKeys(): Promise<KeyPair>;
    /**
     * Get public key for verification
     */
    getPublicKey(): Promise<Uint8Array>;
    /**
     * Get secret key for signing
     */
    getSecretKey(): Promise<Uint8Array>;
    /**
     * Get key ID for rotation tracking
     */
    getKeyId(): string;
}
/**
 * Sign PASETO v4 public token for links
 */
export declare function signLink(secretKey: Uint8Array, payload: LinkPayload, options?: {
    expiryMinutes?: number;
    audience?: string;
    issuer?: string;
}): Promise<string>;
/**
 * Verify PASETO v4 public token for links
 */
export declare function verifyLink(publicKey: Uint8Array, token: string, options?: {
    audience?: string;
    issuer?: string;
    clockTolerance?: number;
}): Promise<LinkPayload | null>;
/**
 * Generate secure quote access link
 */
export declare function generateQuoteLink(keyManager: PasetoKeyManager, tenantId: string, quoteId: string, expiryDays?: number): Promise<string>;
/**
 * Verify quote access link
 */
export declare function verifyQuoteLink(keyManager: PasetoKeyManager, token: string): Promise<{
    tenantId: string;
    quoteId: string;
} | null>;
/**
 * Session Service with Opaque Tokens
 */
export declare class SessionService {
    private fastify;
    private keyManager;
    constructor(fastify: FastifyInstance, keyManager: PasetoKeyManager);
    /**
     * Create opaque session for user
     */
    createUserSession(sessionData: Omit<SessionData, 'issuedAt' | 'lastActivity'>, binding?: {
        ipAddress?: string;
        userAgent?: string;
        fingerprint?: string;
    }, options?: SessionOptions): Promise<string>;
    /**
     * Validate opaque session
     */
    validateUserSession(sessionId: string, binding?: {
        ipAddress?: string;
        userAgent?: string;
    }, options?: SessionOptions): Promise<SessionData | null>;
    /**
     * Revoke user session
     */
    revokeUserSession(sessionId: string): Promise<boolean>;
    /**
     * Revoke all sessions for user
     */
    revokeAllUserSessions(userId: string, tenantId?: string): Promise<number>;
}
//# sourceMappingURL=paseto.d.ts.map