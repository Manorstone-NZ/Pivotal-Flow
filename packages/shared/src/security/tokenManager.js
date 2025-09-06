/**
 * Token management types and implementation
 * Provides secure token storage and management
 */
export class TokenManager {
    store;
    refreshTtlSeconds;
    constructor(store, refreshTtlSeconds) {
        this.store = store;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }
    async setRefresh(jti, rec) {
        const tokenRecord = {
            ...rec,
            kind: "refresh"
        };
        await this.store.set(`refresh:${jti}`, JSON.stringify(tokenRecord), 'EX', this.refreshTtlSeconds);
    }
    async getRefresh(jti) {
        const data = await this.store.get(`refresh:${jti}`);
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async rotateRefresh(oldJti, newJti, rec) {
        // Atomic swap pattern: set new token first, then delete old
        await this.setRefresh(newJti, rec);
        await this.revokeRefresh(oldJti);
    }
    async revokeRefresh(jti) {
        await this.store.del(`refresh:${jti}`);
    }
}
//# sourceMappingURL=tokenManager.js.map