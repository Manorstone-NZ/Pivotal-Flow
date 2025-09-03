// Performance metrics collection for cache and repository operations

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
    hitRate: number; // percentage
    totalRequests: number;
    metrics: CacheMetrics;
  };
  fx: {
    hitRate: number; // percentage
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
export class MetricsCollector {
  private cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    busts: 0,
    errors: 0
  };

  private fxMetrics: FxMetrics = {
    lookups: 0,
    misses: 0,
    conversions: 0,
    errors: 0,
    conversionDuration: []
  };

  private paymentMetrics: PaymentMetrics = {
    created: 0,
    applied: 0,
    errors: 0,
    applyDuration: []
  };

  private repositoryMetrics: RepositoryMetrics[] = [];
  private readonly maxRepositoryMetrics = 1000; // Keep last 1000 operations

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheMetrics.hits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMetrics.misses++;
  }

  /**
   * Record cache set
   */
  recordCacheSet(): void {
    this.cacheMetrics.sets++;
  }

  /**
   * Record cache bust
   */
  recordCacheBust(): void {
    this.cacheMetrics.busts++;
  }

  /**
   * Record cache error
   */
  recordCacheError(): void {
    this.cacheMetrics.errors++;
  }

  /**
   * Record FX lookup
   */
  recordFxLookup(): void {
    this.fxMetrics.lookups++;
  }

  /**
   * Record FX miss
   */
  recordFxMiss(): void {
    this.fxMetrics.misses++;
  }

  /**
   * Record FX conversion
   */
  recordFxConversion(): void {
    this.fxMetrics.conversions++;
  }

  /**
   * Record FX error
   */
  recordFxError(): void {
    this.fxMetrics.errors++;
  }

  /**
   * Record payment created
   */
  recordPaymentCreated(): void {
    this.paymentMetrics.created++;
  }

  /**
   * Record payment applied
   */
  recordPaymentApply(duration: number): void {
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
  recordPaymentError(): void {
    this.paymentMetrics.errors++;
  }

  /**
   * Record repository operation
   */
  recordRepositoryOperation(operation: string, duration: number, success: boolean, error?: string): void {
    const metric: RepositoryMetrics = {
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
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics };
  }

  /**
   * Get cache hit rate as percentage
   */
  getCacheHitRate(): number {
    const total = this.cacheMetrics.hits + this.cacheMetrics.misses;
    if (total === 0) return 0;
    return Math.round((this.cacheMetrics.hits / total) * 100);
  }

  /**
   * Get current FX metrics
   */
  getFxMetrics(): FxMetrics {
    return { ...this.fxMetrics };
  }

  /**
   * Get FX hit rate as percentage
   */
  getFxHitRate(): number {
    const total = this.fxMetrics.lookups + this.fxMetrics.misses;
    if (total === 0) return 0;
    return Math.round((this.fxMetrics.lookups / total) * 100);
  }

  /**
   * Get current payment metrics
   */
  getPaymentMetrics(): PaymentMetrics {
    return { ...this.paymentMetrics };
  }

  /**
   * Get average payment apply duration
   */
  getAveragePaymentApplyDuration(): number {
    if (this.paymentMetrics.applyDuration.length === 0) return 0;
    const sum = this.paymentMetrics.applyDuration.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.paymentMetrics.applyDuration.length);
  }

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
  }> {
    const operationMap = new Map<string, number[]>();

    // Group durations by operation
    for (const metric of this.repositoryMetrics) {
      if (!operationMap.has(metric.operation)) {
        operationMap.set(metric.operation, []);
      }
      operationMap.get(metric.operation)!.push(metric.duration);
    }

    // Calculate statistics for each operation
    const results: Array<{
      operation: string;
      avgDuration: number;
      p50: number;
      p95: number;
      p99: number;
      totalCalls: number;
    }> = [];

    for (const [operation, durations] of operationMap) {
      if (durations.length === 0) continue;

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
  getPerformanceSummary(): PerformanceSummary {
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
  reset(): void {
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
  private calculatePercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    
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
export function recordMetrics(operation: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        const result = await method.apply(this, args);
        success = true;
        return result;
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const duration = Date.now() - start;
        globalMetrics.recordRepositoryOperation(operation, duration, success, error);
      }
    };

    return descriptor;
  };
}

export { prometheusMetrics } from './prometheus.js';
