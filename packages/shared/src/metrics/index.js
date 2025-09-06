// Performance metrics collection for cache and repository operations
import { required } from '../utils/strict.js';
/**
 * Metrics collector for cache and repository performance
 */
export class MetricsCollector {
    cacheMetrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        busts: 0,
        errors: 0
    };
    fxMetrics = {
        lookups: 0,
        misses: 0,
        conversions: 0,
        errors: 0,
        conversionDuration: []
    };
    paymentMetrics = {
        created: 0,
        applied: 0,
        errors: 0,
        applyDuration: []
    };
    repositoryMetrics = [];
    maxRepositoryMetrics = 1000; // Keep last 1000 operations
    /**
     * Record cache hit
     */
    recordCacheHit() {
        this.cacheMetrics.hits++;
    }
    /**
     * Record cache miss
     */
    recordCacheMiss() {
        this.cacheMetrics.misses++;
    }
    /**
     * Record cache set
     */
    recordCacheSet() {
        this.cacheMetrics.sets++;
    }
    /**
     * Record cache bust
     */
    recordCacheBust() {
        this.cacheMetrics.busts++;
    }
    /**
     * Record cache error
     */
    recordCacheError() {
        this.cacheMetrics.errors++;
    }
    /**
     * Record FX lookup
     */
    recordFxLookup() {
        this.fxMetrics.lookups++;
    }
    /**
     * Record FX miss
     */
    recordFxMiss() {
        this.fxMetrics.misses++;
    }
    /**
     * Record FX conversion
     */
    recordFxConversion() {
        this.fxMetrics.conversions++;
    }
    /**
     * Record FX error
     */
    recordFxError() {
        this.fxMetrics.errors++;
    }
    /**
     * Record payment created
     */
    recordPaymentCreated() {
        this.paymentMetrics.created++;
    }
    /**
     * Record payment applied
     */
    recordPaymentApply(duration) {
        this.paymentMetrics.applied++;
        this.paymentMetrics.applyDuration.push(duration);
        // Keep only the last 1000 durations
        if (this.paymentMetrics.applyDuration.length > 1000) {
            this.paymentMetrics.applyDuration = this.paymentMetrics.applyDuration.slice(-1000);
        }
    }
    /**
     * Record payment error
     */
    recordPaymentError() {
        this.paymentMetrics.errors++;
    }
    /**
     * Record repository operation
     */
    recordRepositoryOperation(operation, duration, success, error) {
        const metric = {
            operation,
            duration,
            timestamp: new Date(),
            success,
            error
        };
        this.repositoryMetrics.push(metric);
        // Keep only the last maxRepositoryMetrics
        if (this.repositoryMetrics.length > this.maxRepositoryMetrics) {
            this.repositoryMetrics = this.repositoryMetrics.slice(-this.maxRepositoryMetrics);
        }
    }
    /**
     * Get current cache metrics
     */
    getCacheMetrics() {
        return { ...this.cacheMetrics };
    }
    /**
     * Get cache hit rate as percentage
     */
    getCacheHitRate() {
        const total = this.cacheMetrics.hits + this.cacheMetrics.misses;
        if (total === 0)
            return 0;
        return Math.round((this.cacheMetrics.hits / total) * 100);
    }
    /**
     * Get current FX metrics
     */
    getFxMetrics() {
        return { ...this.fxMetrics };
    }
    /**
     * Get FX hit rate as percentage
     */
    getFxHitRate() {
        const total = this.fxMetrics.lookups + this.fxMetrics.misses;
        if (total === 0)
            return 0;
        return Math.round((this.fxMetrics.lookups / total) * 100);
    }
    /**
     * Get current payment metrics
     */
    getPaymentMetrics() {
        return { ...this.paymentMetrics };
    }
    /**
     * Get average payment apply duration
     */
    getAveragePaymentApplyDuration() {
        if (this.paymentMetrics.applyDuration.length === 0)
            return 0;
        const sum = this.paymentMetrics.applyDuration.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.paymentMetrics.applyDuration.length);
    }
    /**
     * Get repository performance summary
     */
    getRepositoryPerformance() {
        const operationMap = new Map();
        // Group durations by operation
        for (const metric of this.repositoryMetrics) {
            if (!operationMap.has(metric.operation)) {
                operationMap.set(metric.operation, []);
            }
            const operationMetrics = required(operationMap.get(metric.operation), `Operation ${metric.operation} should exist in map`);
            operationMetrics.push(metric.duration);
        }
        // Calculate statistics for each operation
        const results = [];
        for (const [operation, durations] of operationMap) {
            if (durations.length === 0)
                continue;
            const sorted = durations.sort((a, b) => a - b);
            const totalCalls = durations.length;
            const avgDuration = durations.reduce((sum, d) => sum + d, 0) / totalCalls;
            const p50 = this.calculatePercentile(sorted, 50);
            const p95 = this.calculatePercentile(sorted, 95);
            const p99 = this.calculatePercentile(sorted, 99);
            results.push({
                operation,
                avgDuration: Math.round(avgDuration * 100) / 100,
                p50: Math.round(p50 * 100) / 100,
                p95: Math.round(p95 * 100) / 100,
                p99: Math.round(p99 * 100) / 100,
                totalCalls
            });
        }
        // Sort by average duration (slowest first)
        return results.sort((a, b) => b.avgDuration - a.avgDuration);
    }
    /**
     * Get complete performance summary
     */
    getPerformanceSummary() {
        const topOperations = this.getRepositoryPerformance().slice(0, 10); // Top 10 operations
        return {
            cache: {
                hitRate: this.getCacheHitRate(),
                totalRequests: this.cacheMetrics.hits + this.cacheMetrics.misses,
                metrics: this.getCacheMetrics()
            },
            fx: {
                hitRate: this.getFxHitRate(),
                totalLookups: this.fxMetrics.lookups + this.fxMetrics.misses,
                metrics: this.getFxMetrics()
            },
            payments: {
                totalCreated: this.paymentMetrics.created,
                totalApplied: this.paymentMetrics.applied,
                totalErrors: this.paymentMetrics.errors,
                avgApplyDuration: this.getAveragePaymentApplyDuration(),
                metrics: this.getPaymentMetrics()
            },
            repositories: {
                topOperations,
                totalOperations: this.repositoryMetrics.length
            },
            timestamp: new Date()
        };
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.cacheMetrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            busts: 0,
            errors: 0
        };
        this.fxMetrics = {
            lookups: 0,
            misses: 0,
            conversions: 0,
            errors: 0,
            conversionDuration: []
        };
        this.paymentMetrics = {
            created: 0,
            applied: 0,
            errors: 0,
            applyDuration: []
        };
        this.repositoryMetrics = [];
    }
    /**
     * Calculate percentile from sorted array
     */
    calculatePercentile(sorted, percentile) {
        if (sorted.length === 0)
            return 0;
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        const safeIndex = Math.max(0, index);
        return sorted[safeIndex] || 0;
    }
}
// Global metrics collector instance
export const globalMetrics = new MetricsCollector();
/**
 * Decorator to automatically record repository operation metrics
 */
export function recordMetrics(operation) {
    return function (_target, _propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            let success = false;
            let error;
            try {
                const result = await method.apply(this, args);
                success = true;
                return result;
            }
            catch (err) {
                error = err instanceof Error ? err.message : String(err);
                throw err;
            }
            finally {
                const duration = Date.now() - start;
                globalMetrics.recordRepositoryOperation(operation, duration, success, error);
            }
        };
        return descriptor;
    };
}
export { prometheusMetrics } from './prometheus.js';
//# sourceMappingURL=index.js.map