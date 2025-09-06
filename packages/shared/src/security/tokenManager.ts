/**
 * Token management types and implementation
 * Provides secure token storage and management
 */

export type TokenKind = "access" | "refresh"

export interface TokenRecord {
  jti: string
  userId: string
  organisationId: string
  kind: TokenKind
  expiresAt: number
}

export interface KeyValue {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: string, ttl?: number): Promise<unknown>
  del(key: string): Promise<unknown>
}

export class TokenManager {
  constructor(
    private readonly store: KeyValue,
    private readonly refreshTtlSeconds: number
  ) {}

  async setRefresh(jti: string, rec: Omit<TokenRecord, "kind">): Promise<void> {
    const tokenRecord: TokenRecord = {
      ...rec,
      kind: "refresh"
    }
    
    await this.store.set(
      `refresh:${jti}`,
      JSON.stringify(tokenRecord),
      'EX',
      this.refreshTtlSeconds
    )
  }

  async getRefresh(jti: string): Promise<TokenRecord | null> {
    const data = await this.store.get(`refresh:${jti}`)
    if (!data) {
      return null
    }

    try {
      return JSON.parse(data) as TokenRecord
    } catch {
      return null
    }
  }

  async rotateRefresh(oldJti: string, newJti: string, rec: Omit<TokenRecord, "kind">): Promise<void> {
    // Atomic swap pattern: set new token first, then delete old
    await this.setRefresh(newJti, rec)
    await this.revokeRefresh(oldJti)
  }

  async revokeRefresh(jti: string): Promise<void> {
    await this.store.del(`refresh:${jti}`)
  }
}
