#!/usr/bin/env node

/**
 * Simple Test Runner for Pivotal Flow Backend
 * 
 * This script demonstrates the test suite functionality
 */

import { execSync } from 'child_process';

console.log('🧪 Pivotal Flow Backend Test Suite');
console.log('=====================================\n');

// Test categories
const testCategories = [
  { name: 'API Functionality', file: 'src/__tests__/api.functionality.test.ts' },
  { name: 'Database Integration', file: 'src/__tests__/database.integration.test.ts' },
  { name: 'Service Layer', file: 'src/__tests__/service.layer.test.ts' },
  { name: 'End-to-End Workflow', file: 'src/__tests__/e2e.workflow.test.ts' }
];

async function runTests() {
  console.log('📋 Test Categories:');
  testCategories.forEach((category, index) => {
    console.log(`  ${index + 1}. ${category.name}`);
  });
  
  console.log('\n🚀 Running Tests...\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const category of testCategories) {
    console.log(`📝 Running ${category.name} tests...`);
    
    try {
      const output = execSync(`npx vitest run ${category.file} --reporter=verbose`, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse output to count passed/failed tests
      const lines = output.split('\n');
      const passedMatch = lines.find(line => line.includes('✓') && line.includes('passed'));
      const failedMatch = lines.find(line => line.includes('✗') && line.includes('failed'));
      
      if (passedMatch) {
        const passedCount = parseInt(passedMatch.match(/(\d+)/)?.[1] || '0');
        totalPassed += passedCount;
        console.log(`  ✅ ${passedCount} tests passed`);
      }
      
      if (failedMatch) {
        const failedCount = parseInt(failedMatch.match(/(\d+)/)?.[1] || '0');
        totalFailed += failedCount;
        console.log(`  ❌ ${failedCount} tests failed`);
      }
      
      console.log(`  ✅ ${category.name} completed\n`);
      
    } catch (error: any) {
      console.log(`  ❌ ${category.name} failed: ${error.message}\n`);
      totalFailed++;
    }
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('================');
  console.log(`Total Tests: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success Rate: ${totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please review the results above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
