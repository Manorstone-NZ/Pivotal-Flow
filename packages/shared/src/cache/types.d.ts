export interface CacheApi {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<{
        connected: boolean;
        keyCount: number;
        memoryUsage: string;
        hitRate: number;
    }>;
    clear(): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map