#!/usr/bin/env node

/**
 * Comprehensive Test Runner for CI Pipeline
 * 
 * This script runs all tests and generates comprehensive reports
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  module: string;
  status: 'pass' | 'fail' | 'error';
  duration: number;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  averageCoverage: number;
  results: TestResult[];
  summary: string;
}

class ComprehensiveTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Running Comprehensive Test Suite...\n');

    try {
      // Run tests for each module
      await this.runBackendTests();
      await this.runSharedTests();
      await this.runFrontendTests();
      await this.runIntegrationTests();
      await this.runE2ETests();

      const report = this.generateReport();
      this.saveReport(report);
      this.printReport(report);

      return report;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  private async runBackendTests(): Promise<void> {
    console.log('🔧 Running Backend Tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('cd apps/backend && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const result = this.parseTestOutput(output, 'backend', startTime);
      this.results.push(result);
      
      console.log(`  ✅ Backend tests: ${result.passed} passed, ${result.failed} failed`);
    } catch (error: any) {
      const result: TestResult = {
        module: 'backend',
        status: 'error',
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
      
      this.results.push(result);
      console.log(`  ❌ Backend tests failed: ${error.message}`);
    }
  }

  private async runSharedTests(): Promise<void> {
    console.log('📦 Running Shared Package Tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('cd packages/shared && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const result = this.parseTestOutput(output, 'shared', startTime);
      this.results.push(result);
      
      console.log(`  ✅ Shared tests: ${result.passed} passed, ${result.failed} failed`);
    } catch (error: any) {
      const result: TestResult = {
        module: 'shared',
        status: 'error',
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
      
      this.results.push(result);
      console.log(`  ❌ Shared tests failed: ${error.message}`);
    }
  }

  private async runFrontendTests(): Promise<void> {
    console.log('🎨 Running Frontend Tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('cd apps/frontend && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const result = this.parseTestOutput(output, 'frontend', startTime);
      this.results.push(result);
      
      console.log(`  ✅ Frontend tests: ${result.passed} passed, ${result.failed} failed`);
    } catch (error: any) {
      const result: TestResult = {
        module: 'frontend',
        status: 'error',
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
      
      this.results.push(result);
      console.log(`  ❌ Frontend tests failed: ${error.message}`);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running Integration Tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('cd apps/backend && pnpm test:integration', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const result = this.parseTestOutput(output, 'integration', startTime);
      this.results.push(result);
      
      console.log(`  ✅ Integration tests: ${result.passed} passed, ${result.failed} failed`);
    } catch (error: any) {
      const result: TestResult = {
        module: 'integration',
        status: 'error',
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
      
      this.results.push(result);
      console.log(`  ❌ Integration tests failed: ${error.message}`);
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('🌐 Running End-to-End Tests...');
    
    try {
      const startTime = Date.now();
      const output = execSync('cd apps/frontend && pnpm test:e2e', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const result = this.parseTestOutput(output, 'e2e', startTime);
      this.results.push(result);
      
      console.log(`  ✅ E2E tests: ${result.passed} passed, ${result.failed} failed`);
    } catch (error: any) {
      const result: TestResult = {
        module: 'e2e',
        status: 'error',
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
      
      this.results.push(result);
      console.log(`  ❌ E2E tests failed: ${error.message}`);
    }
  }

  private parseTestOutput(output: string, module: string, startTime: number): TestResult {
    try {
      const lines = output.split('\n');
      let tests = 0, passed = 0, failed = 0, skipped = 0, coverage = 0;

      // Parse test results
      for (const line of lines) {
        if (line.includes('Tests:')) {
          const match = line.match(/(\d+) passed, (\d+) failed, (\d+) skipped/);
          if (match) {
            passed = parseInt(match[1]);
            failed = parseInt(match[2]);
            skipped = parseInt(match[3]);
            tests = passed + failed + skipped;
          }
        }
        
        if (line.includes('Statements') && line.includes('%')) {
          const match = line.match(/(\d+\.\d+)%/);
          if (match) {
            coverage = parseFloat(match[1]);
          }
        }
      }

      return {
        module,
        status: failed === 0 ? 'pass' : 'fail',
        duration: Date.now() - startTime,
        tests,
        passed,
        failed,
        skipped,
        coverage
      };
    } catch (error) {
      return {
        module,
        status: 'error',
        duration: Date.now() - startTime,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
    }
  }

  private generateReport(): TestReport {
    const totalTests = this.results.reduce((sum, r) => sum + r.tests, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalDuration = Date.now() - this.startTime;
    
    const coverageResults = this.results.filter(r => r.coverage !== undefined);
    const averageCoverage = coverageResults.length > 0 
      ? coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length 
      : 0;

    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    
    const summary = this.generateSummary(successRate, totalTests, totalFailed);

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      averageCoverage,
      results: this.results,
      summary
    };
  }

  private generateSummary(successRate: number, totalTests: number, totalFailed: number): string {
    if (totalFailed === 0) {
      return `🎉 All ${totalTests} tests passed! (${successRate.toFixed(1)}% success rate)`;
    } else if (successRate >= 90) {
      return `✅ ${totalTests - totalFailed}/${totalTests} tests passed (${successRate.toFixed(1)}% success rate)`;
    } else if (successRate >= 75) {
      return `⚠️  ${totalTests - totalFailed}/${totalTests} tests passed (${successRate.toFixed(1)}% success rate) - Needs attention`;
    } else {
      return `❌ ${totalFailed} tests failed (${successRate.toFixed(1)}% success rate) - Critical issues detected`;
    }
  }

  private saveReport(report: TestReport): void {
    const reportPath = join(process.cwd(), 'comprehensive-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Comprehensive test report saved to: ${reportPath}`);
  }

  private printReport(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📅 Timestamp: ${report.timestamp}`);
    console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log(`📈 Average Coverage: ${report.averageCoverage.toFixed(1)}%`);
    
    console.log('\n📋 Test Results:');
    console.log('-'.repeat(40));
    
    for (const result of report.results) {
      const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '💥';
      console.log(`${status} ${result.module}: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`);
      if (result.coverage) {
        console.log(`   Coverage: ${result.coverage.toFixed(1)}%`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('-'.repeat(40));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.totalPassed}`);
    console.log(`Failed: ${report.totalFailed}`);
    console.log(`Skipped: ${report.totalSkipped}`);
    console.log(`Success Rate: ${((report.totalPassed / report.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n💬 Summary:');
    console.log('-'.repeat(40));
    console.log(report.summary);
    
    console.log('\n' + '='.repeat(60));
  }
}

// CLI Interface
async function main() {
  const runner = new ComprehensiveTestRunner();
  
  try {
    const report = await runner.runAllTests();
    
    if (report.totalFailed > 0) {
      console.log('\n❌ Some tests failed. Please review the results above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ComprehensiveTestRunner };
