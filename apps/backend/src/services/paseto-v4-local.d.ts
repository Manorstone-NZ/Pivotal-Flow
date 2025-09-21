/**
 * PASETO v4.local Service for Auth Hardening
 * Implements encrypted tokens per security policy:
 * - XChaCha20-Poly1305 encryption (quantum-resistant)
 * - 30-day expiration for public links
 * - Self-contained verification
 * - No database lookup required
 */
export interface PasetoLocalPayload {
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
export interface EncryptionKey {
    key: Uint8Array;
    keyId: string;
}
/**
 * PASETO v4.local Key Manager
 * Manages symmetric encryption keys for v4.local tokens
 */
export declare class PasetoLocalKeyManager {
    private encryptionKey;
    private keyId;
    constructor();
    /**
     * Generate or load 256-bit encryption key for v4.local
     */
    getEncryptionKey(): Promise<EncryptionKey>;
}
/**
 * PASETO v4.local Token Service
 * Handles encryption/decryption of PASETO v4.local tokens
 */
export declare class PasetoLocalService {
    private keyManager;
    constructor();
    /**
     * Generate encrypted PASETO v4.local token
     */
    generateToken(payload: Omit<PasetoLocalPayload, 'iat' | 'jti'>): Promise<string>;
    /**
     * Decrypt and verify PASETO v4.local token
     */
    verifyToken(token: string): Promise<PasetoLocalPayload>;
    /**
     * Generate public quote delivery token (30-day expiration)
     */
    generateQuoteDeliveryToken(quoteId: string, tenantId: string, userId: string): Promise<string>;
    /**
     * Generate service-to-service authentication token (1 hour expiration)
     */
    generateServiceToken(serviceId: string, tenantId: string, scopes: string[]): Promise<string>;
}
//# sourceMappingURL=paseto-v4-local.d.ts.map