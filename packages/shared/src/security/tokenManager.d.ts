/**
 * Token management types and implementation
 * Provides secure token storage and management
 */
export type TokenKind = "access" | "refresh";
export interface TokenRecord {
    jti: string;
    userId: string;
    organisationId: string;
    kind: TokenKind;
    expiresAt: number;
}
export interface KeyValue {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: string, ttl?: number): Promise<unknown>;
    del(key: string): Promise<unknown>;
}
export declare class TokenManager {
    private readonly store;
    private readonly refreshTtlSeconds;
    constructor(store: KeyValue, refreshTtlSeconds: number);
    setRefresh(jti: string, rec: Omit<TokenRecord, "kind">): Promise<void>;
    getRefresh(jti: string): Promise<TokenRecord | null>;
    rotateRefresh(oldJti: string, newJti: string, rec: Omit<TokenRecord, "kind">): Promise<void>;
    revokeRefresh(jti: string): Promise<void>;
}
//# sourceMappingURL=tokenManager.d.ts.map