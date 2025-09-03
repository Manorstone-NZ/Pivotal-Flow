#!/usr/bin/env node

/**
 * Comprehensive CI Coverage Report Generator
 * 
 * This script generates detailed coverage reports for the CI pipeline
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CoverageData {
  totalStatements: number;
  coveredStatements: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  totalLines: number;
  coveredLines: number;
  percentage: number;
}

interface ModuleCoverage {
  module: string;
  coverage: CoverageData;
  missingTests: string[];
  criticalPaths: string[];
}

interface CoverageReport {
  timestamp: string;
  overallCoverage: CoverageData;
  moduleCoverage: ModuleCoverage[];
  recommendations: string[];
  summary: string;
}

class CoverageReporter {
  private moduleCoverage: ModuleCoverage[] = [];

  async generateReport(): Promise<CoverageReport> {
    console.log('📊 Generating Comprehensive Coverage Report...\n');

    try {
      // Run coverage for each module
      await this.runBackendCoverage();
      await this.runSharedCoverage();
      await this.runFrontendCoverage();
      
      // Analyze missing tests
      await this.analyzeMissingTests();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations();
      
      // Calculate overall coverage
      const overallCoverage = this.calculateOverallCoverage();
      
      const report: CoverageReport = {
        timestamp: new Date().toISOString(),
        overallCoverage,
        moduleCoverage: this.moduleCoverage,
        recommendations,
        summary: this.generateSummary(overallCoverage)
      };

      this.saveReport(report);
      this.printReport(report);

      return report;
    } catch (error) {
      console.error('❌ Coverage report generation failed:', error);
      throw error;
    }
  }

  private async runBackendCoverage(): Promise<void> {
    console.log('🔧 Running Backend Coverage...');
    
    try {
      const output = execSync('cd apps/backend && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const coverage = this.parseCoverageOutput(output, 'backend');
      this.moduleCoverage.push({
        module: 'backend',
        coverage,
        missingTests: [],
        criticalPaths: []
      });

      console.log(`  ✅ Backend coverage: ${coverage.percentage.toFixed(1)}%`);
    } catch (error: any) {
      console.log(`  ❌ Backend coverage failed: ${error.message}`);
      this.moduleCoverage.push({
        module: 'backend',
        coverage: { totalStatements: 0, coveredStatements: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0, totalLines: 0, coveredLines: 0, percentage: 0 },
        missingTests: [],
        criticalPaths: []
      });
    }
  }

  private async runSharedCoverage(): Promise<void> {
    console.log('📦 Running Shared Package Coverage...');
    
    try {
      const output = execSync('cd packages/shared && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const coverage = this.parseCoverageOutput(output, 'shared');
      this.moduleCoverage.push({
        module: 'shared',
        coverage,
        missingTests: [],
        criticalPaths: []
      });

      console.log(`  ✅ Shared coverage: ${coverage.percentage.toFixed(1)}%`);
    } catch (error: any) {
      console.log(`  ❌ Shared coverage failed: ${error.message}`);
      this.moduleCoverage.push({
        module: 'shared',
        coverage: { totalStatements: 0, coveredStatements: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0, totalLines: 0, coveredLines: 0, percentage: 0 },
        missingTests: [],
        criticalPaths: []
      });
    }
  }

  private async runFrontendCoverage(): Promise<void> {
    console.log('🎨 Running Frontend Coverage...');
    
    try {
      const output = execSync('cd apps/frontend && pnpm test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const coverage = this.parseCoverageOutput(output, 'frontend');
      this.moduleCoverage.push({
        module: 'frontend',
        coverage,
        missingTests: [],
        criticalPaths: []
      });

      console.log(`  ✅ Frontend coverage: ${coverage.percentage.toFixed(1)}%`);
    } catch (error: any) {
      console.log(`  ❌ Frontend coverage failed: ${error.message}`);
      this.moduleCoverage.push({
        module: 'frontend',
        coverage: { totalStatements: 0, coveredStatements: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0, totalLines: 0, coveredLines: 0, percentage: 0 },
        missingTests: [],
        criticalPaths: []
      });
    }
  }

  private parseCoverageOutput(output: string, module: string): CoverageData {
    try {
      // Look for coverage summary in output
      const lines = output.split('\n');
      let coverageData: CoverageData = {
        totalStatements: 0,
        coveredStatements: 0,
        totalBranches: 0,
        coveredBranches: 0,
        totalFunctions: 0,
        coveredFunctions: 0,
        totalLines: 0,
        coveredLines: 0,
        percentage: 0
      };

      for (const line of lines) {
        if (line.includes('Statements') && line.includes('%')) {
          const match = line.match(/(\d+)\/(\d+)\s+\((\d+\.\d+)%\)/);
          if (match) {
            coverageData.coveredStatements = parseInt(match[1]);
            coverageData.totalStatements = parseInt(match[2]);
            coverageData.percentage = parseFloat(match[3]);
          }
        }
      }

      return coverageData;
    } catch (error) {
      return {
        totalStatements: 0,
        coveredStatements: 0,
        totalBranches: 0,
        coveredBranches: 0,
        totalFunctions: 0,
        coveredFunctions: 0,
        totalLines: 0,
        coveredLines: 0,
        percentage: 0
      };
    }
  }

  private async analyzeMissingTests(): Promise<void> {
    console.log('🔍 Analyzing Missing Tests...');

    // Check for modules without test directories
    const modulesWithoutTests = [
      'apps/backend/src/modules/auth',
      'apps/backend/src/modules/users', 
      'apps/backend/src/modules/payments',
      'apps/backend/src/modules/currencies'
    ];

    for (const module of modulesWithoutTests) {
      if (!existsSync(join(module, '__tests__'))) {
        const moduleName = module.split('/').pop();
        const moduleCoverage = this.moduleCoverage.find(m => m.module === 'backend');
        if (moduleCoverage) {
          moduleCoverage.missingTests.push(`${moduleName} module`);
        }
      }
    }

    // Check for critical paths without tests
    const criticalPaths = [
      'apps/backend/src/routes',
      'apps/backend/src/lib',
      'apps/backend/src/middleware'
    ];

    for (const path of criticalPaths) {
      const moduleCoverage = this.moduleCoverage.find(m => m.module === 'backend');
      if (moduleCoverage) {
        moduleCoverage.criticalPaths.push(path);
      }
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Coverage-based recommendations
    for (const module of this.moduleCoverage) {
      if (module.coverage.percentage < 80) {
        recommendations.push(`Increase ${module.module} test coverage from ${module.coverage.percentage.toFixed(1)}% to at least 80%`);
      }
    }

    // Missing tests recommendations
    for (const module of this.moduleCoverage) {
      if (module.missingTests.length > 0) {
        recommendations.push(`Add test coverage for ${module.missingTests.join(', ')} in ${module.module}`);
      }
    }

    // Critical paths recommendations
    for (const module of this.moduleCoverage) {
      if (module.criticalPaths.length > 0) {
        recommendations.push(`Add integration tests for critical paths: ${module.criticalPaths.join(', ')}`);
      }
    }

    return recommendations;
  }

  private calculateOverallCoverage(): CoverageData {
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    for (const module of this.moduleCoverage) {
      totalStatements += module.coverage.totalStatements;
      coveredStatements += module.coverage.coveredStatements;
      totalBranches += module.coverage.totalBranches;
      coveredBranches += module.coverage.coveredBranches;
      totalFunctions += module.coverage.totalFunctions;
      coveredFunctions += module.coverage.coveredFunctions;
      totalLines += module.coverage.totalLines;
      coveredLines += module.coverage.coveredLines;
    }

    const percentage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;

    return {
      totalStatements,
      coveredStatements,
      totalBranches,
      coveredBranches,
      totalFunctions,
      coveredFunctions,
      totalLines,
      coveredLines,
      percentage
    };
  }

  private generateSummary(overallCoverage: CoverageData): string {
    if (overallCoverage.percentage >= 90) {
      return `🎉 Excellent coverage! ${overallCoverage.percentage.toFixed(1)}% overall coverage`;
    } else if (overallCoverage.percentage >= 80) {
      return `✅ Good coverage! ${overallCoverage.percentage.toFixed(1)}% overall coverage`;
    } else if (overallCoverage.percentage >= 70) {
      return `⚠️  Coverage needs improvement: ${overallCoverage.percentage.toFixed(1)}% overall coverage`;
    } else {
      return `❌ Critical coverage issues: ${overallCoverage.percentage.toFixed(1)}% overall coverage`;
    }
  }

  private saveReport(report: CoverageReport): void {
    const reportPath = join(process.cwd(), 'coverage-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Coverage report saved to: ${reportPath}`);
  }

  private printReport(report: CoverageReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PIVOTAL FLOW COVERAGE REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📅 Timestamp: ${report.timestamp}`);
    console.log(`📈 Overall Coverage: ${report.overallCoverage.percentage.toFixed(1)}%`);
    
    console.log('\n📋 Module Coverage:');
    console.log('-'.repeat(40));
    
    for (const module of report.moduleCoverage) {
      const status = module.coverage.percentage >= 80 ? '✅' : '❌';
      console.log(`${status} ${module.module}: ${module.coverage.percentage.toFixed(1)}%`);
      
      if (module.missingTests.length > 0) {
        console.log(`   Missing tests: ${module.missingTests.join(', ')}`);
      }
    }
    
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(40));
    
    for (const recommendation of report.recommendations) {
      console.log(`• ${recommendation}`);
    }
    
    console.log('\n💬 Summary:');
    console.log('-'.repeat(40));
    console.log(report.summary);
    
    console.log('\n' + '='.repeat(60));
  }
}

// CLI Interface
async function main() {
  const reporter = new CoverageReporter();
  
  try {
    const report = await reporter.generateReport();
    
    if (report.overallCoverage.percentage < 80) {
      console.log('\n❌ Coverage below target threshold. Please improve test coverage.');
      process.exit(1);
    } else {
      console.log('\n🎉 Coverage meets target threshold!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Coverage report generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CoverageReporter };
