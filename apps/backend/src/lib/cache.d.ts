/**
 * Cache compatibility shim
 * Re-exports Redis client wrapper from shared or provides minimal adapter
 */
export interface CacheAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    health(): Promise<boolean>;
}
export declare function getCache(): CacheAdapter;
//# sourceMappingURL=cache.d.ts.map