import { register, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Prometheus metrics for cache and repository performance
 */
export class PrometheusMetrics {
  // Cache metrics
  private cacheHitsTotal: Counter<string>;
  private cacheMissesTotal: Counter<string>;
  private cacheSetsTotal: Counter<string>;
  private cacheBustsTotal: Counter<string>;
  private cacheErrorsTotal: Counter<string>;
  
  // Cache performance metrics
  private cacheHitRate: Gauge<string>;
  private cacheLatency: Histogram<string>;
  
  // Repository performance metrics
  private repositoryOperationDuration: Histogram<string>;
  private repositoryOperationTotal: Counter<string>;
  private repositoryOperationErrors: Counter<string>;

  // Internal counters for easy access
  private _cacheHits = 0;
  private _cacheMisses = 0;
  private _cacheSets = 0;
  private _cacheBusts = 0;
  private _cacheErrors = 0;

  constructor() {
    // Initialize cache metrics
    this.cacheHitsTotal = new Counter({
      name: 'pivotal_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type', 'operation']
    });

    this.cacheMissesTotal = new Counter({
      name: 'pivotal_cache_miss_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type', 'operation']
    });

    this.cacheSetsTotal = new Counter({
      name: 'pivotal_cache_sets_total',
      help: 'Total number of cache sets',
      labelNames: ['cache_type', 'operation']
    });

    this.cacheBustsTotal = new Counter({
      name: 'pivotal_cache_busts_total',
      help: 'Total number of cache busts',
      labelNames: ['cache_type', 'operation']
    });

    this.cacheErrorsTotal = new Counter({
      name: 'pivotal_cache_errors_total',
      help: 'Total number of cache errors',
      labelNames: ['cache_type', 'operation']
    });

    // Cache performance metrics
    this.cacheHitRate = new Gauge({
      name: 'pivotal_cache_hit_rate',
      help: 'Cache hit rate as percentage',
      labelNames: ['cache_type']
    });

    this.cacheLatency = new Histogram({
      name: 'pivotal_cache_latency_seconds',
      help: 'Cache operation latency in seconds',
      labelNames: ['cache_type', 'operation'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
    });

    // Repository performance metrics
    this.repositoryOperationDuration = new Histogram({
      name: 'pivotal_repository_operation_duration_seconds',
      help: 'Repository operation duration in seconds',
      labelNames: ['repository', 'operation'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    });

    this.repositoryOperationTotal = new Counter({
      name: 'pivotal_repository_operation_total',
      help: 'Total number of repository operations',
      labelNames: ['repository', 'operation', 'status']
    });

    this.repositoryOperationErrors = new Counter({
      name: 'pivotal_repository_operation_errors_total',
      help: 'Total number of repository operation errors',
      labelNames: ['repository', 'operation', 'error_type']
    });

    // Register all metrics
    register.registerMetric(this.cacheHitsTotal);
    register.registerMetric(this.cacheMissesTotal);
    register.registerMetric(this.cacheSetsTotal);
    register.registerMetric(this.cacheBustsTotal);
    register.registerMetric(this.cacheErrorsTotal);
    register.registerMetric(this.cacheHitRate);
    register.registerMetric(this.cacheLatency);
    register.registerMetric(this.repositoryOperationDuration);
    register.registerMetric(this.repositoryOperationTotal);
    register.registerMetric(this.repositoryOperationErrors);
  }

  /**
   * Record cache hit
   */
  recordCacheHit(cacheType: string = 'redis', operation: string = 'get'): void {
    this.cacheHitsTotal.inc({ cache_type: cacheType, operation });
    this._cacheHits++;
    this.updateCacheHitRate();
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(cacheType: string = 'redis', operation: string = 'get'): void {
    this.cacheMissesTotal.inc({ cache_type: cacheType, operation });
    this._cacheMisses++;
    this.updateCacheHitRate();
  }

  /**
   * Record cache set
   */
  recordCacheSet(cacheType: string = 'redis', operation: string = 'set'): void {
    this.cacheSetsTotal.inc({ cache_type: cacheType, operation });
    this._cacheSets++;
  }

  /**
   * Record cache bust
   */
  recordCacheBust(cacheType: string = 'redis', operation: string = 'delete'): void {
    this.cacheBustsTotal.inc({ cache_type: cacheType, operation });
    this._cacheBusts++;
  }

  /**
   * Record cache error
   */
  recordCacheError(cacheType: string = 'redis', operation: string = 'unknown'): void {
    this.cacheErrorsTotal.inc({ cache_type: cacheType, operation });
    this._cacheErrors++;
  }

  /**
   * Record cache operation latency
   */
  recordCacheLatency(cacheType: string, operation: string, durationSeconds: number): void {
    this.cacheLatency.observe({ cache_type: cacheType, operation }, durationSeconds);
  }

  /**
   * Record repository operation
   */
  recordRepositoryOperation(
    repository: string,
    operation: string,
    durationSeconds: number,
    success: boolean,
    errorType?: string
  ): void {
    this.repositoryOperationDuration.observe({ repository, operation }, durationSeconds);
    this.repositoryOperationTotal.inc({ 
      repository, 
      operation, 
      status: success ? 'success' : 'error' 
    });

    if (!success && errorType) {
      this.repositoryOperationErrors.inc({ repository, operation, error_type: errorType });
    }
  }

  /**
   * Update cache hit rate gauge
   */
  private updateCacheHitRate(): void {
    const hits = this._cacheHits;
    const misses = this._cacheMisses;
    const total = hits + misses;
    
    if (total > 0) {
      const hitRate = (hits / total) * 100;
      this.cacheHitRate.set({ cache_type: 'redis' }, hitRate);
    }
  }

  /**
   * Get all metrics as Prometheus text format
   */
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  /**
   * Get cache hits total
   */
  getCacheHitsTotal(): number {
    return this._cacheHits;
  }

  /**
   * Get cache misses total
   */
  getCacheMissesTotal(): number {
    return this._cacheMisses;
  }

  /**
   * Get cache sets total
   */
  getCacheSetsTotal(): number {
    return this._cacheSets;
  }

  /**
   * Get cache busts total
   */
  getCacheBustsTotal(): number {
    return this._cacheBusts;
  }

  /**
   * Get cache errors total
   */
  getCacheErrorsTotal(): number {
    return this._cacheErrors;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this._cacheHits = 0;
    this._cacheMisses = 0;
    this._cacheSets = 0;
    this._cacheBusts = 0;
    this._cacheErrors = 0;
    register.clear();
  }
}

// Export singleton instance
export const prometheusMetrics = new PrometheusMetrics();
