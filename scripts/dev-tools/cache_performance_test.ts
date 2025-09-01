#!/usr/bin/env tsx

// Cache performance testing script
// Tests cache hit/miss performance and compares with no-cache scenarios

import { PrismaClient } from '@prisma/client';
import { UsersRepository } from '../../packages/shared/dist/db/repo.users.js';
import { OrganizationSettingsRepository } from '../../packages/shared/dist/db/repo.org-settings.js';
import { MemoryCacheProvider, CacheWrapper } from '../../packages/shared/dist/cache/index.js';
import { globalMetrics } from '../../packages/shared/dist/metrics/index.js';

// Development logger for performance testing
class DevLogger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  info(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [INFO] ${this.prefix}${message}`;
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WARN] ${this.prefix}${message}`;
    console.warn(logMessage);
    if (data) {
      console.warn(JSON.stringify(data, null, 2));
    }
  }

  error(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [ERROR] ${this.prefix}${message}`;
    console.error(logMessage);
    if (data) {
      console.error(JSON.stringify(data, null, 2));
    }
  }

  section(title: string): void {
    console.log('\n' + '='.repeat(50));
    console.log(`📊 ${title}`);
    console.log('='.repeat(50));
  }

  subsection(title: string): void {
    console.log('\n' + '-'.repeat(40));
    console.log(`🔍 ${title}`);
    console.log('-'.repeat(40));
  }

  metric(label: string, value: string | number): void {
    console.log(`  ${label}: ${value}`);
  }

  result(testName: string, result: string): void {
    console.log(`  ${testName}: ${result}`);
  }
}

interface PerformanceTestResult {
  testName: string;
  withCache: {
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
    cacheHitRate: number;
  };
  withoutCache: {
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
  };
  improvement: {
    avgSpeedup: number;
    p95Speedup: number;
  };
}

class CachePerformanceTester {
  private prisma: PrismaClient;
  private cache: CacheWrapper;
  private usersRepo: UsersRepository;
  private orgSettingsRepo: OrganizationSettingsRepository;
  private testResults: PerformanceTestResult[] = [];
  private logger: DevLogger;

  constructor() {
    this.prisma = new PrismaClient();
    this.logger = new DevLogger('[Cache Performance] ');
    
    // Create cache wrapper with memory provider
    const cacheProvider = new MemoryCacheProvider();
    this.cache = new CacheWrapper(cacheProvider, { 
      ttl: 60,
      jitter: true,
      jitterRange: 10
    });
    
    // Create repositories
    this.usersRepo = new UsersRepository(
      this.prisma,
      {
        organizationId: 'test-org-id',
        userId: 'test-user-id'
      },
      this.cache
    );

    this.orgSettingsRepo = new OrganizationSettingsRepository(
      this.prisma,
      {
        organizationId: 'test-org-id',
        userId: 'test-user-id'
      },
      this.cache
    );
  }

  /**
   * Run all performance tests
   */
  async runAllTests(): Promise<void> {
    this.logger.section('Cache Performance Testing Suite');

    // Reset metrics before testing
    globalMetrics.reset();

    // Test 1: User by ID with caching
    await this.testUserByIdCaching();

    // Test 2: Organization settings with caching
    await this.testOrgSettingsCaching();

    // Test 3: Cache stampede prevention
    await this.testCacheStampedePrevention();

    // Test 4: Cache invalidation
    await this.testCacheInvalidation();

    // Print results
    this.printResults();
  }

  /**
   * Test user by ID caching performance
   */
  private async testUserByIdCaching(): Promise<void> {
    this.logger.subsection('User by ID Caching');

    const testUserId = 'test-user-id';
    const iterations = 20;

    // Test with cache (first call will miss, subsequent calls will hit)
    this.logger.info('Testing with cache...');
    const withCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.usersRepo.getUserById(testUserId);
      const duration = Date.now() - start;
      withCacheDurations.push(duration);
      
      if (i === 0) {
        this.logger.info(`  First call (cache miss): ${duration}ms`);
      }
    }

    // Test without cache
    this.logger.info('Testing without cache...');
    const withoutCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      // Create a new repository without cache
      const noCacheRepo = new UsersRepository(
        this.prisma,
        {
          organizationId: 'test-org-id',
          userId: 'test-user-id'
        }
      );
      await noCacheRepo.getUserById(testUserId);
      const duration = Date.now() - start;
      withoutCacheDurations.push(duration);
    }

    const result = this.calculateTestResult(
      'User by ID Caching',
      withCacheDurations,
      withoutCacheDurations
    );

    this.testResults.push(result);
  }

  /**
   * Test organization settings caching performance
   */
  private async testOrgSettingsCaching(): Promise<void> {
    this.logger.subsection('Organization Settings Caching');

    const iterations = 15;

    // Test with cache
    this.logger.info('Testing with cache...');
    const withCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.orgSettingsRepo.getOrganizationSettings();
      const duration = Date.now() - start;
      withCacheDurations.push(duration);
      
      if (i === 0) {
        this.logger.info(`  First call (cache miss): ${duration}ms`);
      }
    }

    // Test without cache
    this.logger.info('Testing without cache...');
    const withoutCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const noCacheRepo = new OrganizationSettingsRepository(
        this.prisma,
        {
          organizationId: 'test-org-id',
          userId: 'test-user-id'
        }
      );
      await noCacheRepo.getOrganizationSettings();
      const duration = Date.now() - start;
      withoutCacheDurations.push(duration);
    }

    const result = this.calculateTestResult(
      'Organization Settings Caching',
      withCacheDurations,
      withoutCacheDurations
    );

    this.testResults.push(result);
  }

  /**
   * Test cache stampede prevention
   */
  private async testCacheStampedePrevention(): Promise<void> {
    this.logger.subsection('Cache Stampede Prevention');

    const concurrentRequests = 10;
    const testUserId = 'test-user-id';

    this.logger.info(`Testing ${concurrentRequests} concurrent requests...`);

    const start = Date.now();
    
    // Make concurrent requests to the same user ID
    const promises = Array(concurrentRequests).fill(0).map(async () => {
      return this.usersRepo.getUserById(testUserId);
    });

    await Promise.all(promises);
    
    const totalDuration = Date.now() - start;
    const avgDuration = totalDuration / concurrentRequests;

    this.logger.info(`  Total duration: ${totalDuration}ms`);
    this.logger.info(`  Average per request: ${avgDuration.toFixed(2)}ms`);
    this.logger.result('Stampede prevention', avgDuration < 50 ? '✅ Working' : '❌ Failed');
  }

  /**
   * Test cache invalidation
   */
  private async testCacheInvalidation(): Promise<void> {
    this.logger.subsection('Cache Invalidation');

    const testUserId = 'test-user-id';

    // First call - should cache
    this.logger.info('First call (should cache)...');
    const start1 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration1 = Date.now() - start1;
    this.logger.info(`  Duration: ${duration1}ms`);

    // Second call - should hit cache
    this.logger.info('Second call (should hit cache)...');
    const start2 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration2 = Date.now() - start2;
    this.logger.info(`  Duration: ${duration2}ms`);

    // Simulate cache invalidation
    this.logger.info('Simulating cache invalidation...');
    await this.cache.bustUserCache('test-org-id', testUserId);

    // Third call - should miss cache (rebuilt)
    this.logger.info('Third call (after invalidation, should miss cache)...');
    const start3 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration3 = Date.now() - start3;
    this.logger.info(`  Duration: ${duration3}ms`);

    this.logger.result('Cache hit performance', duration2 < duration1 ? '✅ Working' : '❌ Failed');
    this.logger.result('Invalidation performance', duration3 > duration2 ? '✅ Working' : '❌ Failed');
  }

  /**
   * Calculate test result with statistics
   */
  private calculateTestResult(
    testName: string,
    withCacheDurations: number[],
    withoutCacheDurations: number[]
  ): PerformanceTestResult {
    const withCacheStats = this.calculateStats(withCacheDurations);
    const withoutCacheStats = this.calculateStats(withoutCacheDurations);

    const improvement = {
      avgSpeedup: withoutCacheStats.avgDuration / withCacheStats.avgDuration,
      p95Speedup: withoutCacheStats.p95 / withCacheStats.p95
    };

    return {
      testName,
      withCache: {
        ...withCacheStats,
        cacheHitRate: globalMetrics.getCacheHitRate()
      },
      withoutCache: withoutCacheStats,
      improvement
    };
  }

  /**
   * Calculate statistics for duration array
   */
  private calculateStats(durations: number[]): {
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const sorted = durations.sort((a, b) => a - b);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    
    return {
      avgDuration: Math.round(avgDuration * 100) / 100,
      p50: this.calculatePercentile(sorted, 50),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99)
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Print test results
   */
  private printResults(): void {
    this.logger.section('Performance Test Results');

    for (const result of this.testResults) {
      this.logger.result(result.testName, '');
      this.logger.metric('With Cache', `${result.withCache.avgDuration}ms avg, ${result.withCache.p95}ms p95 (${result.withCache.cacheHitRate}% hit rate)`);
      this.logger.metric('Without Cache', `${result.withoutCache.avgDuration}ms avg, ${result.withoutCache.p95}ms p95`);
      this.logger.metric('Improvement', `${result.improvement.avgSpeedup.toFixed(2)}x avg, ${result.improvement.p95Speedup.toFixed(2)}x p95`);
    }

    // Overall metrics
    const overallMetrics = globalMetrics.getPerformanceSummary();
    this.logger.section('Overall Cache Metrics');
    this.logger.metric('Hit Rate', `${overallMetrics.cache.hitRate}%`);
    this.logger.metric('Total Requests', overallMetrics.cache.totalRequests);
    this.logger.metric('Hits', overallMetrics.cache.metrics.hits);
    this.logger.metric('Misses', overallMetrics.cache.metrics.misses);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const tester = new CachePerformanceTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Cache performance test failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

