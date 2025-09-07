#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Pivotal Flow Backend
 * 
 * This script runs different types of tests and provides detailed reporting
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const TEST_TYPES = {
  UNIT: 'unit',
  INTEGRATION: 'integration', 
  E2E: 'e2e',
  ALL: 'all'
};

const TEST_CATEGORIES = {
  API: 'api',
  DATABASE: 'database',
  SERVICE: 'service',
  WORKFLOW: 'workflow'
};

interface TestResult {
  type: string;
  category: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
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

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async runTests(testType: string = TEST_TYPES.ALL): Promise<TestReport> {
    console.log('🚀 Starting Pivotal Flow Test Suite...\n');

    try {
      switch (testType) {
        case TEST_TYPES.UNIT:
          await this.runUnitTests();
          break;
        case TEST_TYPES.INTEGRATION:
          await this.runIntegrationTests();
          break;
        case TEST_TYPES.E2E:
          await this.runE2ETests();
          break;
        case TEST_TYPES.ALL:
        default:
          await this.runAllTests();
          break;
      }

      return this.generateReport();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('📋 Running Unit Tests...');
    
    const unitTests = [
      { category: TEST_CATEGORIES.SERVICE, pattern: '**/service.layer.test.ts' },
      { category: TEST_CATEGORIES.API, pattern: '**/health.test.ts' }
    ];

    for (const test of unitTests) {
      await this.runTestPattern(test.category, test.pattern);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running Integration Tests...');
    
    const integrationTests = [
      { category: TEST_CATEGORIES.DATABASE, pattern: '**/database.integration.test.ts' },
      { category: TEST_CATEGORIES.API, pattern: '**/api.functionality.test.ts' }
    ];

    for (const test of integrationTests) {
      await this.runTestPattern(test.category, test.pattern);
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('🌐 Running End-to-End Tests...');
    
    const e2eTests = [
      { category: TEST_CATEGORIES.WORKFLOW, pattern: '**/e2e.workflow.test.ts' }
    ];

    for (const test of e2eTests) {
      await this.runTestPattern(test.category, test.pattern);
    }
  }

  private async runAllTests(): Promise<void> {
    console.log('🎯 Running All Tests...');
    
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
  }

  private async runTestPattern(category: string, pattern: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`  Running ${category} tests...`);
      
      const command = `npx vitest run --reporter=json --coverage ${pattern}`;
      const output = execSync(command, { 
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const testResult = this.parseTestOutput(output, category, startTime);
      this.results.push(testResult);
      
      console.log(`  ✅ ${category} tests completed: ${testResult.passed} passed, ${testResult.failed} failed`);
    } catch (error: unknown) {
      const testResult: TestResult = {
        type: 'vitest',
        category,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime
      };
      
      this.results.push(testResult);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ ${category} tests failed: ${errorMessage}`);
    }
  }

  private parseTestOutput(output: string, category: string, startTime: number): TestResult {
    try {
      const lines = output.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      if (!lastLine) {
        throw new Error('No output to parse');
      }
      const result = JSON.parse(lastLine) as {
        numPassedTests?: number;
        numFailedTests?: number;
        numSkippedTests?: number;
        coverage?: { total?: { statements?: { pct?: number } } };
      };

      return {
        type: 'vitest',
        category,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numSkippedTests || 0,
        duration: Date.now() - startTime,
        coverage: result.coverage?.total?.statements?.pct || 0
      };
    } catch (error) {
      return {
        type: 'vitest',
        category,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime
      };
    }
  }

  private generateReport(): TestReport {
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
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

    const report: TestReport = {
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

    this.saveReport(report);
    this.printReport(report);

    return report;
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
    const reportPath = join(process.cwd(), 'test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Test report saved to: ${reportPath}`);
  }

  private printReport(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PIVOTAL FLOW TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📅 Timestamp: ${report.timestamp}`);
    console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log(`📈 Coverage: ${report.averageCoverage.toFixed(1)}%`);
    
    console.log('\n📋 Test Results:');
    console.log('-'.repeat(40));
    
    for (const result of report.results) {
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${result.category}: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`);
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
  const args = process.argv.slice(2);
  const testType = args[0] || TEST_TYPES.ALL;
  
  if (!Object.values(TEST_TYPES).includes(testType)) {
    console.error('❌ Invalid test type. Valid options: unit, integration, e2e, all');
    process.exit(1);
  }

  const runner = new TestRunner();
  
  try {
    const report = await runner.runTests(testType);
    
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

export { TestRunner, TEST_TYPES, TEST_CATEGORIES };
