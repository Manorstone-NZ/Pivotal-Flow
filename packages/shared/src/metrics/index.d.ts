export interface CacheMetrics {
    hits: number;
    misses: number;
    sets: number;
    busts: number;
    errors: number;
}
export interface FxMetrics {
    lookups: number;
    misses: number;
    conversions: number;
    errors: number;
    conversionDuration: number[];
}
export interface PaymentMetrics {
    created: number;
    applied: number;
    errors: number;
    applyDuration: number[];
}
export interface RepositoryMetrics {
    operation: string;
    duration: number;
    timestamp: Date;
    success: boolean;
    error: string | undefined;
}
export interface PerformanceSummary {
    cache: {
        hitRate: number;
        totalRequests: number;
        metrics: CacheMetrics;
    };
    fx: {
        hitRate: number;
        totalLookups: number;
        metrics: FxMetrics;
    };
    payments: {
        totalCreated: number;
        totalApplied: number;
        totalErrors: number;
        avgApplyDuration: number;
        metrics: PaymentMetrics;
    };
    repositories: {
        topOperations: Array<{
            operation: string;
            avgDuration: number;
            p50: number;
            p95: number;
            p99: number;
            totalCalls: number;
        }>;
        totalOperations: number;
    };
    timestamp: Date;
}
/**
 * Metrics collector for cache and repository performance
 */
export declare class MetricsCollector {
    private cacheMetrics;
    private fxMetrics;
    private paymentMetrics;
    private repositoryMetrics;
    private readonly maxRepositoryMetrics;
    /**
     * Record cache hit
     */
    recordCacheHit(): void;
    /**
     * Record cache miss
     */
    recordCacheMiss(): void;
    /**
     * Record cache set
     */
    recordCacheSet(): void;
    /**
     * Record cache bust
     */
    recordCacheBust(): void;
    /**
     * Record cache error
     */
    recordCacheError(): void;
    /**
     * Record FX lookup
     */
    recordFxLookup(): void;
    /**
     * Record FX miss
     */
    recordFxMiss(): void;
    /**
     * Record FX conversion
     */
    recordFxConversion(): void;
    /**
     * Record FX error
     */
    recordFxError(): void;
    /**
     * Record payment created
     */
    recordPaymentCreated(): void;
    /**
     * Record payment applied
     */
    recordPaymentApply(duration: number): void;
    /**
     * Record payment error
     */
    recordPaymentError(): void;
    /**
     * Record repository operation
     */
    recordRepositoryOperation(operation: string, duration: number, success: boolean, error?: string): void;
    /**
     * Get current cache metrics
     */
    getCacheMetrics(): CacheMetrics;
    /**
     * Get cache hit rate as percentage
     */
    getCacheHitRate(): number;
    /**
     * Get current FX metrics
     */
    getFxMetrics(): FxMetrics;
    /**
     * Get FX hit rate as percentage
     */
    getFxHitRate(): number;
    /**
     * Get current payment metrics
     */
    getPaymentMetrics(): PaymentMetrics;
    /**
     * Get average payment apply duration
     */
    getAveragePaymentApplyDuration(): number;
    /**
     * Get repository performance summary
     */
    getRepositoryPerformance(): Array<{
        operation: string;
        avgDuration: number;
        p50: number;
        p95: number;
        p99: number;
        totalCalls: number;
    }>;
    /**
     * Get complete performance summary
     */
    getPerformanceSummary(): PerformanceSummary;
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Calculate percentile from sorted array
     */
    private calculatePercentile;
}
export declare const globalMetrics: MetricsCollector;
/**
 * Decorator to automatically record repository operation metrics
 */
export declare function recordMetrics(operation: string): (_target: any, _propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export { prometheusMetrics } from './prometheus.js';
//# sourceMappingURL=index.d.ts.map