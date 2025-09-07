#!/usr/bin/env node

/**
 * Bundle Budget Checker for E6 Performance
 * 
 * This script analyzes bundle sizes and fails CI if budgets are exceeded.
 * Based on E0 requirements and industry best practices.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle size budgets (from E0 requirements)
const BUNDLE_BUDGETS = {
  // Individual chunk limits
  'react-vendor': { max: 150, warning: 120 }, // React + ReactDOM
  'router-state': { max: 80, warning: 60 },    // Router + State management
  'ui-vendor': { max: 100, warning: 80 },      // UI libraries
  'utils': { max: 50, warning: 40 },           // Utility libraries
  
  // Route chunk limits
  'dashboard': { max: 100, warning: 80 },
  'quotes': { max: 120, warning: 100 },
  'quote-detail': { max: 100, warning: 80 },
  'rate-cards': { max: 100, warning: 80 },
  'users': { max: 100, warning: 80 },
  'payments': { max: 100, warning: 80 },
  'settings': { max: 100, warning: 80 },
  
  // Total bundle limits
  'total': { max: 500, warning: 400 },         // Total initial bundle
  'total-gzipped': { max: 150, warning: 120 }, // Total gzipped bundle
};

interface BundleStats {
  name: string;
  size: number;
  gzipSize: number;
  brotliSize: number;
  isInitial: boolean;
  isDynamic: boolean;
}

interface BudgetResult {
  name: string;
  size: number;
  budget: number;
  warning: number;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

class BundleBudgetChecker {
  private statsPath: string;
  private results: BudgetResult[] = [];

  constructor(statsPath: string) {
    this.statsPath = statsPath;
  }

  async checkBudgets(): Promise<BudgetResult[]> {
    console.log('🔍 Analyzing bundle sizes...');
    
    if (!fs.existsSync(this.statsPath)) {
      throw new Error(`Bundle stats file not found: ${this.statsPath}`);
    }

    const stats = await this.parseStats();
    this.analyzeChunks(stats);
    this.analyzeTotals(stats);
    
    return this.results;
  }

  private async parseStats(): Promise<BundleStats[]> {
    const statsContent = fs.readFileSync(this.statsPath, 'utf-8');
    const stats = JSON.parse(statsContent);
    
    return stats.chunks.map((chunk: any) => ({
      name: chunk.names[0] || 'unknown',
      size: chunk.size,
      gzipSize: chunk.gzipSize || 0,
      brotliSize: chunk.brotliSize || 0,
      isInitial: chunk.initial,
      isDynamic: chunk.dynamic,
    }));
  }

  private analyzeChunks(stats: BundleStats[]): void {
    stats.forEach(chunk => {
      const budget = BUNDLE_BUDGETS[chunk.name as keyof typeof BUNDLE_BUDGETS];
      if (!budget) return;

      const sizeKB = Math.round(chunk.size / 1024);
      const status = this.getStatus(sizeKB, budget);
      
      this.results.push({
        name: chunk.name,
        size: sizeKB,
        budget: budget.max,
        warning: budget.warning,
        status,
        message: this.getMessage(chunk.name, sizeKB, budget, status),
      });
    });
  }

  private analyzeTotals(stats: BundleStats[]): void {
    const initialChunks = stats.filter(chunk => chunk.isInitial);
    const totalSize = initialChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = initialChunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    
    const totalSizeKB = Math.round(totalSize / 1024);
    const totalGzipSizeKB = Math.round(totalGzipSize / 1024);
    
    // Check total bundle size
    const totalBudget = BUNDLE_BUDGETS.total;
    const totalStatus = this.getStatus(totalSizeKB, totalBudget);
    this.results.push({
      name: 'total',
      size: totalSizeKB,
      budget: totalBudget.max,
      warning: totalBudget.warning,
      status: totalStatus,
      message: this.getMessage('Total Bundle', totalSizeKB, totalBudget, totalStatus),
    });
    
    // Check total gzipped size
    const gzipBudget = BUNDLE_BUDGETS['total-gzipped'];
    const gzipStatus = this.getStatus(totalGzipSizeKB, gzipBudget);
    this.results.push({
      name: 'total-gzipped',
      size: totalGzipSizeKB,
      budget: gzipBudget.max,
      warning: gzipBudget.warning,
      status: gzipStatus,
      message: this.getMessage('Total Gzipped', totalGzipSizeKB, gzipBudget, gzipStatus),
    });
  }

  private getStatus(size: number, budget: { max: number; warning: number }): 'pass' | 'warning' | 'fail' {
    if (size > budget.max) return 'fail';
    if (size > budget.warning) return 'warning';
    return 'pass';
  }

  private getMessage(name: string, size: number, budget: { max: number; warning: number }, status: string): string {
    const budgetKB = budget.max;
    const warningKB = budget.warning;
    
    switch (status) {
      case 'fail':
        return `❌ ${name}: ${size}KB exceeds budget of ${budgetKB}KB (${Math.round((size / budgetKB) * 100)}%)`;
      case 'warning':
        return `⚠️  ${name}: ${size}KB exceeds warning threshold of ${warningKB}KB (${Math.round((size / budgetKB) * 100)}%)`;
      case 'pass':
        return `✅ ${name}: ${size}KB within budget (${Math.round((size / budgetKB) * 100)}%)`;
      default:
        return `${name}: ${size}KB`;
    }
  }

  printResults(): void {
    console.log('\n📊 Bundle Budget Analysis Results:');
    console.log('=====================================');
    
    this.results.forEach(result => {
      console.log(result.message);
    });
    
    const failed = this.results.filter(r => r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warning');
    const passed = this.results.filter(r => r.status === 'pass');
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\n🚨 Budget violations detected!');
      console.log('Consider:');
      console.log('- Code splitting large components');
      console.log('- Lazy loading non-critical features');
      console.log('- Tree shaking unused code');
      console.log('- Optimizing dependencies');
    }
  }

  hasFailures(): boolean {
    return this.results.some(result => result.status === 'fail');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const statsPath = args[0] || path.join(__dirname, '../dist/stats.json');
  
  try {
    const checker = new BundleBudgetChecker(statsPath);
    const results = await checker.checkBudgets();
    checker.printResults();
    
    if (checker.hasFailures()) {
      console.log('\n💥 Bundle budget check failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 All bundle budgets passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Bundle budget check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BundleBudgetChecker, BUNDLE_BUDGETS };
