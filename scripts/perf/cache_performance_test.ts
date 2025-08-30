#!/usr/bin/env tsx

// Cache performance testing script
// Tests cache hit/miss performance and compares with no-cache scenarios

import { PrismaClient } from '@prisma/client';
import { UsersRepository } from '../../packages/shared/dist/db/repo.users.js';
import { OrganizationSettingsRepository } from '../../packages/shared/dist/db/repo.org-settings.js';
import { MemoryCacheProvider, CacheWrapper } from '../../packages/shared/dist/cache/index.js';
import { globalMetrics } from '../../packages/shared/dist/metrics/index.js';

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

  constructor() {
    this.prisma = new PrismaClient();
    
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
    console.log('🧪 Cache Performance Testing Suite');
    console.log('==================================');

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
    console.log('\n📊 Test 1: User by ID Caching');
    console.log('-'.repeat(40));

    const testUserId = 'test-user-id';
    const iterations = 20;

    // Test with cache (first call will miss, subsequent calls will hit)
    console.log('Testing with cache...');
    const withCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.usersRepo.getUserById(testUserId);
      const duration = Date.now() - start;
      withCacheDurations.push(duration);
      
      if (i === 0) {
        console.log(`  First call (cache miss): ${duration}ms`);
      }
    }

    // Test without cache
    console.log('Testing without cache...');
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
    console.log('\n📊 Test 2: Organization Settings Caching');
    console.log('-'.repeat(40));

    const iterations = 15;

    // Test with cache
    console.log('Testing with cache...');
    const withCacheDurations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.orgSettingsRepo.getOrganizationSettings();
      const duration = Date.now() - start;
      withCacheDurations.push(duration);
      
      if (i === 0) {
        console.log(`  First call (cache miss): ${duration}ms`);
      }
    }

    // Test without cache
    console.log('Testing without cache...');
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
    console.log('\n📊 Test 3: Cache Stampede Prevention');
    console.log('-'.repeat(40));

    const concurrentRequests = 10;
    const testUserId = 'test-user-id';

    console.log(`Testing ${concurrentRequests} concurrent requests...`);

    const start = Date.now();
    
    // Make concurrent requests to the same user ID
    const promises = Array(concurrentRequests).fill(0).map(async () => {
      return this.usersRepo.getUserById(testUserId);
    });

    await Promise.all(promises);
    
    const totalDuration = Date.now() - start;
    const avgDuration = totalDuration / concurrentRequests;

    console.log(`  Total duration: ${totalDuration}ms`);
    console.log(`  Average per request: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Stampede prevention: ${avgDuration < 50 ? '✅ Working' : '❌ Failed'}`);
  }

  /**
   * Test cache invalidation
   */
  private async testCacheInvalidation(): Promise<void> {
    console.log('\n📊 Test 4: Cache Invalidation');
    console.log('-'.repeat(40));

    const testUserId = 'test-user-id';

    // First call - should cache
    console.log('First call (should cache)...');
    const start1 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration1 = Date.now() - start1;
    console.log(`  Duration: ${duration1}ms`);

    // Second call - should hit cache
    console.log('Second call (should hit cache)...');
    const start2 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration2 = Date.now() - start2;
    console.log(`  Duration: ${duration2}ms`);

    // Simulate cache invalidation
    console.log('Simulating cache invalidation...');
    await this.cache.bustUserCache('test-org-id', testUserId);

    // Third call - should miss cache (rebuilt)
    console.log('Third call (after invalidation, should miss cache)...');
    const start3 = Date.now();
    await this.usersRepo.getUserById(testUserId);
    const duration3 = Date.now() - start3;
    console.log(`  Duration: ${duration3}ms`);

    console.log(`  Cache hit performance: ${duration2 < duration1 ? '✅ Working' : '❌ Failed'}`);
    console.log(`  Invalidation performance: ${duration3 > duration2 ? '✅ Working' : '❌ Failed'}`);
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
    console.log('\n📋 Performance Test Results');
    console.log('============================');

    for (const result of this.testResults) {
      console.log(`\n${result.testName}:`);
      console.log(`  With Cache:    ${result.withCache.avgDuration}ms avg, ${result.withCache.p95}ms p95 (${result.withCache.cacheHitRate}% hit rate)`);
      console.log(`  Without Cache: ${result.withoutCache.avgDuration}ms avg, ${result.withoutCache.p95}ms p95`);
      console.log(`  Improvement:   ${result.improvement.avgSpeedup.toFixed(2)}x avg, ${result.improvement.p95Speedup.toFixed(2)}x p95`);
    }

    // Overall metrics
    const overallMetrics = globalMetrics.getPerformanceSummary();
    console.log(`\n📊 Overall Cache Metrics:`);
    console.log(`  Hit Rate: ${overallMetrics.cache.hitRate}%`);
    console.log(`  Total Requests: ${overallMetrics.cache.totalRequests}`);
    console.log(`  Hits: ${overallMetrics.cache.metrics.hits}, Misses: ${overallMetrics.cache.metrics.misses}`);
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

