#!/usr/bin/env node
/**
 * Comprehensive Test Runner for Pivotal Flow Backend
 *
 * This script runs different types of tests and provides detailed reporting
 */
declare const TEST_TYPES: {
    UNIT: string;
    INTEGRATION: string;
    E2E: string;
    ALL: string;
};
declare const TEST_CATEGORIES: {
    API: string;
    DATABASE: string;
    SERVICE: string;
    WORKFLOW: string;
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
declare class TestRunner {
    private results;
    private startTime;
    constructor();
    runTests(testType?: string): Promise<TestReport>;
    private runUnitTests;
    private runIntegrationTests;
    private runE2ETests;
    private runAllTests;
    private runTestPattern;
    private parseTestOutput;
    private generateReport;
    private generateSummary;
    private saveReport;
    private printReport;
}
export { TestRunner, TEST_TYPES, TEST_CATEGORIES };
//# sourceMappingURL=test-runner.d.ts.map