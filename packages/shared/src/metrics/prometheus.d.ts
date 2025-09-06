/**
 * Prometheus metrics for cache and repository performance
 */
export declare class PrometheusMetrics {
    private cacheHitsTotal;
    private cacheMissesTotal;
    private cacheSetsTotal;
    private cacheBustsTotal;
    private cacheErrorsTotal;
    private cacheHitRate;
    private cacheLatency;
    private repositoryOperationDuration;
    private repositoryOperationTotal;
    private repositoryOperationErrors;
    private _cacheHits;
    private _cacheMisses;
    private _cacheSets;
    private _cacheBusts;
    private _cacheErrors;
    constructor();
    /**
     * Record cache hit
     */
    recordCacheHit(cacheType?: string, operation?: string): void;
    /**
     * Record cache miss
     */
    recordCacheMiss(cacheType?: string, operation?: string): void;
    /**
     * Record cache set
     */
    recordCacheSet(cacheType?: string, operation?: string): void;
    /**
     * Record cache bust
     */
    recordCacheBust(cacheType?: string, operation?: string): void;
    /**
     * Record cache error
     */
    recordCacheError(cacheType?: string, operation?: string): void;
    /**
     * Record cache operation latency
     */
    recordCacheLatency(cacheType: string, operation: string, durationSeconds: number): void;
    /**
     * Record repository operation
     */
    recordRepositoryOperation(repository: string, operation: string, durationSeconds: number, success: boolean, errorType?: string): void;
    /**
     * Update cache hit rate gauge
     */
    private updateCacheHitRate;
    /**
     * Get all metrics as Prometheus text format
     */
    getMetrics(): Promise<string>;
    /**
     * Get cache hits total
     */
    getCacheHitsTotal(): number;
    /**
     * Get cache misses total
     */
    getCacheMissesTotal(): number;
    /**
     * Get cache sets total
     */
    getCacheSetsTotal(): number;
    /**
     * Get cache busts total
     */
    getCacheBustsTotal(): number;
    /**
     * Get cache errors total
     */
    getCacheErrorsTotal(): number;
    /**
     * Reset all metrics
     */
    reset(): void;
}
export declare const prometheusMetrics: PrometheusMetrics;
//# sourceMappingURL=prometheus.d.ts.map