#!/usr/bin/env tsx

// Performance testing script for users list repository operations
// Runs list operation ten times and prints median and p95

import { PrismaClient } from '@prisma/client';
import { UsersRepository } from '../../packages/shared/src/db/repo.users.js';
import { MemoryCacheProvider, CacheWrapper } from '../../packages/shared/src/db/cache/index.js';

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
}

class PerformanceTester {
  private prisma: PrismaClient;
  private usersRepo: UsersRepository;
  private cache: CacheWrapper;
  private metrics: PerformanceMetrics[] = [];

  constructor() {
    this.prisma = new PrismaClient();
    
    // Create cache wrapper with memory provider for testing
    const cacheProvider = new MemoryCacheProvider();
    this.cache = new CacheWrapper(cacheProvider, { ttl: 60 });
    
    // Create users repository
    this.usersRepo = new UsersRepository(
      this.prisma,
      {
        organizationId: 'test-org-id', // Use test organization ID
        userId: 'test-user-id'
      },
      this.cache
    );
  }

  /**
   * Run performance test for users list operation
   */
  async testUsersList(): Promise<void> {
    console.log('🧪 Testing Users List Repository Performance');
    console.log('===========================================');

    const testCases = [
      {
        name: 'Basic List (no filters)',
        options: {
          pagination: { page: 1, pageSize: 20 },
          filters: {},
          sort: { field: 'createdAt', direction: 'desc' }
        }
      },
      {
        name: 'Filtered List (active users)',
        options: {
          pagination: { page: 1, pageSize: 20 },
          filters: { isActive: true },
          sort: { field: 'createdAt', direction: 'desc' }
        }
      },
      {
        name: 'Search List (with query)',
        options: {
          pagination: { page: 1, pageSize: 20 },
          filters: { q: 'test' },
          sort: { field: 'email', direction: 'asc' }
        }
      },
      {
        name: 'Large Page Size (50 users)',
        options: {
          pagination: { page: 1, pageSize: 50 },
          filters: {},
          sort: { field: 'createdAt', direction: 'desc' }
        }
      },
      {
        name: 'Role Filtered List',
        options: {
          pagination: { page: 1, pageSize: 20 },
          filters: { roleId: 'test-role-id' },
          sort: { field: 'createdAt', direction: 'desc' }
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📊 Test Case: ${testCase.name}`);
      console.log('-'.repeat(50));
      
      await this.runPerformanceTest(
        testCase.name,
        () => this.usersRepo.listUsers(testCase.options)
      );
    }

    // Test cache performance
    console.log('\n📊 Test Case: Cache Performance');
    console.log('-'.repeat(50));
    await this.testCachePerformance();

    // Print summary
    this.printSummary();
  }

  /**
   * Run a single performance test
   */
  private async runPerformanceTest(
    operation: string,
    testFn: () => Promise<unknown>
  ): Promise<void> {
    const iterations = 10;
    const durations: number[] = [];

    console.log(`Running ${iterations} iterations...`);

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      try {
        await testFn();
        const duration = performance.now() - start;
        durations.push(duration);
        
        this.metrics.push({
          operation,
          duration,
          timestamp: new Date()
        });

        process.stdout.write('.');
      } catch (error) {
        console.error(`\n❌ Error in iteration ${i + 1}:`, error);
        process.stdout.write('x');
      }
    }

    console.log(); // New line after dots

    if (durations.length > 0) {
      const sorted = durations.sort((a, b) => a - b);
      const median = this.calculateMedian(sorted);
      const p95 = this.calculatePercentile(sorted, 95);
      const p99 = this.calculatePercentile(sorted, 99);
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      const mean = durations.reduce((a, b) => a + b, 0) / durations.length;

      console.log(`✅ Completed ${durations.length} iterations`);
      console.log(`📈 Duration (ms): min=${min.toFixed(2)}, max=${max.toFixed(2)}`);
      console.log(`📊 Statistics (ms): mean=${mean.toFixed(2)}, median=${median.toFixed(2)}, p95=${p95.toFixed(2)}, p99=${p99.toFixed(2)}`);
      
      // Check performance budgets
      this.checkPerformanceBudgets(operation, median, p95);
    }
  }

  /**
   * Test cache performance
   */
  private async testCachePerformance(): Promise<void> {
    const testOptions = {
      pagination: { page: 1, pageSize: 20 },
      filters: {},
      sort: { field: 'createdAt', direction: 'desc' }
    };

    console.log('Testing cache hit performance...');
    
    // First call (cache miss)
    const start1 = performance.now();
    await this.usersRepo.listUsers(testOptions);
    const cacheMissDuration = performance.now() - start1;

    // Second call (cache hit)
    const start2 = performance.now();
    await this.usersRepo.listUsers(testOptions);
    const cacheHitDuration = performance.now() - start2;

    console.log(`📊 Cache Miss: ${cacheMissDuration.toFixed(2)}ms`);
    console.log(`📊 Cache Hit: ${cacheHitDuration.toFixed(2)}ms`);
    console.log(`📊 Cache Speedup: ${(cacheMissDuration / cacheHitDuration).toFixed(2)}x`);

    // Test cache metrics
    const metrics = await this.cache.getMetrics();
    console.log(`📊 Cache Metrics:`, metrics);
  }

  /**
   * Calculate median
   */
  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Check performance budgets
   */
  private checkPerformanceBudgets(operation: string, median: number, p95: number): void {
    const budgets: Record<string, { median: number; p95: number }> = {
      'Basic List (no filters)': { median: 200, p95: 500 },
      'Filtered List (active users)': { median: 200, p95: 500 },
      'Search List (with query)': { median: 200, p95: 500 },
      'Large Page Size (50 users)': { median: 300, p95: 800 },
      'Role Filtered List': { median: 250, p95: 600 }
    };

    const budget = budgets[operation];
    if (budget) {
      const medianPass = median <= budget.median;
      const p95Pass = p95 <= budget.p95;

      console.log(`🎯 Performance Budgets:`);
      console.log(`   Median: ${median.toFixed(2)}ms ${medianPass ? '✅' : '❌'} (target: ≤${budget.median}ms)`);
      console.log(`   P95: ${p95.toFixed(2)}ms ${p95Pass ? '✅' : '❌'} (target: ≤${budget.p95}ms)`);

      if (!medianPass || !p95Pass) {
        console.log(`⚠️  Performance budget exceeded for ${operation}`);
      }
    }
  }

  /**
   * Print performance summary
   */
  private printSummary(): void {
    console.log('\n📋 Performance Test Summary');
    console.log('============================');

    const operations = [...new Set(this.metrics.map(m => m.operation))];
    
    for (const operation of operations) {
      const operationMetrics = this.metrics.filter(m => m.operation === operation);
      const durations = operationMetrics.map(m => m.duration);
      
      if (durations.length > 0) {
        const sorted = durations.sort((a, b) => a - b);
        const median = this.calculateMedian(sorted);
        const p95 = this.calculatePercentile(sorted, 95);
        
        console.log(`\n${operation}:`);
        console.log(`  Median: ${median.toFixed(2)}ms`);
        console.log(`  P95: ${p95.toFixed(2)}ms`);
        console.log(`  Samples: ${durations.length}`);
      }
    }

    console.log(`\n📊 Total Tests: ${this.metrics.length}`);
    console.log(`📊 Average Duration: ${(this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length).toFixed(2)}ms`);
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
  const tester = new PerformanceTester();
  
  try {
    await tester.testUsersList();
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
