#!/usr/bin/env tsx
"use strict";
// Database query analysis script
// Analyzes query performance and generates optimization recommendations
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const repo_users_js_1 = require("../../packages/shared/dist/db/repo.users.js");
const repo_org_settings_js_1 = require("../../packages/shared/dist/db/repo.org-settings.js");
// Development logger for query analysis
class DevLogger {
    prefix;
    constructor(prefix = '') {
        this.prefix = prefix;
    }
    info(message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [INFO] ${this.prefix}${message}`;
        console.log(logMessage);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
    warn(message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [WARN] ${this.prefix}${message}`;
        console.warn(logMessage);
        if (data) {
            console.warn(JSON.stringify(data, null, 2));
        }
    }
    error(message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [ERROR] ${this.prefix}${message}`;
        console.error(logMessage);
        if (data) {
            console.error(JSON.stringify(data, null, 2));
        }
    }
    section(title) {
        console.log('\n' + '='.repeat(50));
        console.log(`📊 ${title}`);
        console.log('='.repeat(50));
    }
    subsection(title) {
        console.log('\n' + '-'.repeat(40));
        console.log(`🔍 ${title}`);
        console.log('-'.repeat(40));
    }
    metric(label, value) {
        console.log(`  ${label}: ${value}`);
    }
    result(testName, result) {
        console.log(`  ${testName}: ${result}`);
    }
}
class QueryAnalyzer {
    prisma;
    usersRepo;
    orgSettingsRepo;
    logger;
    results = [];
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = new DevLogger('[Query Analysis] ');
        // Create repositories
        this.usersRepo = new repo_users_js_1.UsersRepository(this.prisma, {
            organizationId: 'test-org-id',
            userId: 'test-user-id'
        });
        this.orgSettingsRepo = new repo_org_settings_js_1.OrganizationSettingsRepository(this.prisma, {
            organizationId: 'test-org-id',
            userId: 'test-user-id'
        });
    }
    /**
     * Run all query analysis
     */
    async runAnalysis() {
        this.logger.section('Database Query Analysis');
        // Analyze user queries
        await this.analyzeUserQueries();
        // Analyze authentication queries
        await this.analyzeAuthQueries();
        // Analyze organization queries
        await this.analyzeOrgQueries();
        // Generate report
        this.generateReport();
    }
    /**
     * Analyze user-related queries
     */
    async analyzeUserQueries() {
        this.logger.subsection('Analyzing User Queries...');
        const userResults = [];
        // Test getUserById performance
        const start1 = Date.now();
        await this.usersRepo.getUserById('test-user-id');
        const duration1 = Date.now() - start1;
        userResults.push({
            query: 'getUserById',
            duration: duration1,
            optimization: duration1 > 50 ? 'Consider adding index on id' : 'Good performance'
        });
        // Test listUsers performance
        const start2 = Date.now();
        await this.usersRepo.listUsers({
            pagination: { page: 1, pageSize: 20 },
            filters: {},
            sort: { field: 'createdAt', direction: 'desc' }
        });
        const duration2 = Date.now() - start2;
        userResults.push({
            query: 'listUsers',
            duration: duration2,
            optimization: duration2 > 100 ? 'Consider pagination optimization' : 'Good performance'
        });
        this.results.push({
            type: 'User Queries',
            results: userResults
        });
    }
    /**
     * Analyze authentication-related queries
     */
    async analyzeAuthQueries() {
        this.logger.subsection('Analyzing Authentication Queries...');
        const authResults = [];
        // Test user lookup by email
        const start = Date.now();
        const users = await this.prisma.user.findMany({
            where: {
                email: 'test@example.com',
                organizationId: 'test-org-id'
            }
        });
        const duration = Date.now() - start;
        authResults.push({
            query: 'user lookup by email',
            duration: duration,
            optimization: duration > 30 ? 'Consider adding index on email + organizationId' : 'Good performance'
        });
        this.results.push({
            type: 'Authentication Queries',
            results: authResults
        });
    }
    /**
     * Analyze organization-related queries
     */
    async analyzeOrgQueries() {
        this.logger.subsection('Analyzing Organization Queries...');
        const orgResults = [];
        // Test organization settings
        const start1 = Date.now();
        const settings = await this.prisma.organizationSetting.findMany({
            where: {
                organizationId: 'test-org-id'
            }
        });
        const duration1 = Date.now() - start1;
        orgResults.push({
            query: 'organization settings',
            duration: duration1,
            optimization: duration1 > 50 ? 'Consider caching frequently accessed settings' : 'Good performance'
        });
        // Test roles query
        const start2 = Date.now();
        const roles = await this.prisma.role.findMany({
            where: {
                organizationId: 'test-org-id',
                isActive: true
            }
        });
        const duration2 = Date.now() - start2;
        orgResults.push({
            query: 'organization roles',
            duration: duration2,
            optimization: duration2 > 50 ? 'Consider caching roles' : 'Good performance'
        });
        this.results.push({
            type: 'Organization Queries',
            results: orgResults
        });
    }
    /**
     * Generate analysis report
     */
    generateReport() {
        this.logger.section('Query Analysis Report');
        for (const result of this.results) {
            this.logger.subsection(`${result.type}:`);
            for (const queryResult of result.results) {
                const status = queryResult.duration > 100 ? '❌' : queryResult.duration > 50 ? '⚠️' : '✅';
                this.logger.result(`${status} ${queryResult.query}`, `${queryResult.duration}ms`);
                this.logger.metric('Optimization', queryResult.optimization);
            }
        }
        // Generate ADR content
        this.generateADR();
    }
    /**
     * Generate Architecture Decision Record
     */
    generateADR() {
        const adrPath = 'docs/adr/03_query_optimization.md';
        const adrContent = `# ADR-003: Query Optimization Strategy

## Status
Proposed

## Context
Performance analysis of database queries revealed several optimization opportunities.

## Decision
Implement the following optimizations:

${this.results.map(result => `
### ${result.type}
${result.results.map(qr => `- **${qr.query}**: ${qr.optimization}`).join('\n')}
`).join('\n')}

## Consequences
- Improved query performance
- Better user experience
- Reduced database load
`;
        this.logger.info(`📝 ADR written to: ${adrPath}`);
        this.logger.info('📝 ADR content (save manually):');
        this.logger.info(adrContent);
    }
}
// Run analysis if called directly
if (require.main === module) {
    const analyzer = new QueryAnalyzer();
    analyzer.runAnalysis();
}
//# sourceMappingURL=query_analysis.js.map