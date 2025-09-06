#!/usr/bin/env tsx

// Repository users list performance testing script
// Tests repository performance for listing users with various filters and pagination

const { PrismaClient } = require('@prisma/client');
const { UsersRepository } = require('../../packages/shared/dist/db/repo.users.js');
const { MemoryCacheProvider, CacheWrapper } = require('../../packages/shared/dist/cache/index.js');

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

interface TestCase {
  name: string;
  filters: {
    q?: string;
    isActive?: boolean;
    roleId?: string;
  };
  sort: {
    field: 'createdAt' | 'email';
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
  };
}

interface PerformanceMetrics {
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
}

class RepositoryPerformanceTester {
  private prisma: PrismaClient;
  private cache: CacheWrapper;
  private usersRepo: UsersRepository;
  private logger: DevLogger;
  private metrics: Array<{ operation: string; duration: number }> = [];

  constructor() {
    this.prisma = new PrismaClient();
    this.logger = new DevLogger('[Repo Performance] ');
    
    // Create cache wrapper
    const cacheProvider = new MemoryCacheProvider();
    this.cache = new CacheWrapper(cacheProvider, { 
      ttl: 300,
      jitter: true,
      jitterRange: 30
    });
    
    // Create repository
    this.usersRepo = new UsersRepository(
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
    this.logger.section('Testing Users List Repository Performance');

    const testCases: TestCase[] = [
      {
        name: 'Basic List (No Filters)',
        filters: {},
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, pageSize: 20 }
      },
      {
        name: 'Search by Email',
        filters: { q: 'test@example.com' },
        sort: { field: 'email', direction: 'asc' },
        pagination: { page: 1, pageSize: 10 }
      },
      {
        name: 'Active Users Only',
        filters: { isActive: true },
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, pageSize: 50 }
      },
      {
        name: 'Users with Admin Role',
        filters: { roleId: 'admin-role-id' },
        sort: { field: 'email', direction: 'asc' },
        pagination: { page: 1, pageSize: 15 }
      },
      {
        name: 'Large Page Size',
        filters: {},
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, pageSize: 100 }
      }
    ];

    // Run each test case
    for (const testCase of testCases) {
      await this.runTestCase(testCase);
    }

    // Test cache performance
    await this.testCachePerformance();

    // Print summary
    this.printSummary();
  }

  /**
   * Run a single test case
   */
  private async runTestCase(testCase: TestCase): Promise<void> {
    this.logger.subsection(testCase.name);

    const iterations = 10;
    const durations: number[] = [];

    // Run iterations
    this.logger.info(`Running ${iterations} iterations...`);
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        await this.usersRepo.listUsers({
          pagination: testCase.pagination,
          filters: testCase.filters,
          sort: testCase.sort
        });
        
        const duration = Date.now() - start;
        durations.push(duration);
        
        // Show progress
        if (i % 5 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        this.logger.error(`Iteration ${i + 1} failed:`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    console.log(); // New line after dots

    // Calculate metrics
    const metrics = this.calculateMetrics(durations);
    
    this.logger.info(`✅ Completed ${durations.length} iterations`);
    this.logger.metric('Duration (ms)', `min=${metrics.min.toFixed(2)}, max=${metrics.max.toFixed(2)}`);
    this.logger.metric('Statistics (ms)', `mean=${metrics.mean.toFixed(2)}, median=${metrics.median.toFixed(2)}, p95=${metrics.p95.toFixed(2)}, p99=${metrics.p99.toFixed(2)}`);

    // Store metrics
    this.metrics.push({
      operation: testCase.name,
      duration: metrics.median
    });

    // Check performance budgets
    this.checkPerformanceBudgets(testCase.name, metrics);
  }

  /**
   * Test cache performance
   */
  private async testCachePerformance(): Promise<void> {
    this.logger.subsection('Cache Performance');

    const testCase: TestCase = {
      name: 'Cache Performance',
      filters: {},
      sort: { field: 'createdAt', direction: 'desc' },
      pagination: { page: 1, pageSize: 20 }
    };

    // First call (cache miss)
    const start1 = Date.now();
    await this.usersRepo.listUsers({
      pagination: testCase.pagination,
      filters: testCase.filters,
      sort: testCase.sort
    });
    const cacheMissDuration = Date.now() - start1;

    // Second call (cache hit)
    const start2 = Date.now();
    await this.usersRepo.listUsers({
      pagination: testCase.pagination,
      filters: testCase.filters,
      sort: testCase.sort
    });
    const cacheHitDuration = Date.now() - start2;

    this.logger.metric('Cache Miss', `${cacheMissDuration.toFixed(2)}ms`);
    this.logger.metric('Cache Hit', `${cacheHitDuration.toFixed(2)}ms`);
    this.logger.metric('Cache Speedup', `${(cacheMissDuration / cacheHitDuration).toFixed(2)}x`);

    // Get cache metrics
    const metrics = await this.cache.getMetrics();
    this.logger.metric('Cache Metrics', metrics);
  }

  /**
   * Calculate performance metrics from durations
   */
  private calculateMetrics(durations: number[]): PerformanceMetrics {
    const sorted = [...durations].sort((a, b) => a - b);
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;

    return { min, max, mean, median, p95, p99 };
  }

  /**
   * Check performance budgets
   */
  private checkPerformanceBudgets(operation: string, metrics: PerformanceMetrics): void {
    const budget = {
      median: 100, // 100ms median
      p95: 200     // 200ms p95
    };

    const medianPass = metrics.median <= budget.median;
    const p95Pass = metrics.p95 <= budget.p95;

    this.logger.metric('Performance Budgets', '');
    this.logger.result('Median', `${metrics.median.toFixed(2)}ms ${medianPass ? '✅' : '❌'} (target: ≤${budget.median}ms)`);
    this.logger.result('P95', `${metrics.p95.toFixed(2)}ms ${p95Pass ? '✅' : '❌'} (target: ≤${budget.p95}ms)`);

    if (!medianPass || !p95Pass) {
      this.logger.warn(`⚠️  Performance budget exceeded for ${operation}`);
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    this.logger.section('Performance Test Summary');

    const operations = ['Basic List (No Filters)', 'Search by Email', 'Active Users Only', 'Users with Admin Role', 'Large Page Size'];
    
    for (const operation of operations) {
      const operationMetrics = this.metrics.filter(m => m.operation === operation);
      if (operationMetrics.length > 0) {
        const avgDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;
        
        this.logger.result(operation, `${avgDuration.toFixed(2)}ms`);
      }
    }

    const totalTests = this.metrics.length;
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalTests;
    
    this.logger.metric('Total Tests', totalTests);
    this.logger.metric('Average Duration', `${avgDuration.toFixed(2)}ms`);
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
  const tester = new RepositoryPerformanceTester();
  
  try {
    await tester.runAllTests();
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
