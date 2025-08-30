#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Database Query Analysis Script
 * Identifies top queries and suggests optimizations
 */
class QueryAnalyzer {
  private prisma: PrismaClient;
  private results: any[] = [];

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Run all query analysis
   */
  async runAnalysis(): Promise<void> {
    console.log('🔍 Database Query Analysis');
    console.log('='.repeat(50));

    try {
      await this.analyzeUserQueries();
      await this.analyzeAuthQueries();
      await this.analyzeOrganizationQueries();
      await this.generateReport();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Analyze user-related queries
   */
  private async analyzeUserQueries(): Promise<void> {
    console.log('\n📊 Analyzing User Queries...');

    // Test getUserById performance
    const start = Date.now();
    const user = await this.prisma.user.findFirst({
      where: { id: 'test-user-id' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    const duration = Date.now() - start;

    this.results.push({
      query: 'getUserById with roles',
      duration,
      type: 'user',
      optimization: duration > 10 ? 'Consider composite index on (id, organizationId)' : 'Good performance'
    });

    // Test listUsers performance
    const listStart = Date.now();
    const users = await this.prisma.user.findMany({
      where: { organizationId: 'test-org-id' },
      take: 50,
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    const listDuration = Date.now() - listStart;

    this.results.push({
      query: 'listUsers with roles',
      duration: listDuration,
      type: 'user',
      optimization: listDuration > 50 ? 'Consider composite index on (organizationId, status, createdAt)' : 'Good performance'
    });
  }

  /**
   * Analyze authentication-related queries
   */
  private async analyzeAuthQueries(): Promise<void> {
    console.log('\n🔐 Analyzing Authentication Queries...');

    // Test user lookup by email
    const start = Date.now();
    const user = await this.prisma.user.findFirst({
      where: { 
        email: 'test@example.com',
        organizationId: 'test-org-id'
      }
    });
    const duration = Date.now() - start;

    this.results.push({
      query: 'findUserByEmail',
      duration,
      type: 'auth',
      optimization: duration > 5 ? 'Ensure composite index on (email, organizationId)' : 'Good performance'
    });
  }

  /**
   * Analyze organization-related queries
   */
  private async analyzeOrganizationQueries(): Promise<void> {
    console.log('\n🏢 Analyzing Organization Queries...');

    // Test organization settings
    const start = Date.now();
    const settings = await this.prisma.organizationSetting.findMany({
      where: { organizationId: 'test-org-id' }
    });
    const duration = Date.now() - start;

    this.results.push({
      query: 'getOrganizationSettings',
      duration,
      type: 'organization',
      optimization: duration > 10 ? 'Ensure index on (organizationId, category, key)' : 'Good performance'
    });

    // Test roles query
    const rolesStart = Date.now();
    const roles = await this.prisma.role.findMany({
      where: { 
        organizationId: 'test-org-id',
        isActive: true
      }
    });
    const rolesDuration = Date.now() - rolesStart;

    this.results.push({
      query: 'getOrganizationRoles',
      duration: rolesDuration,
      type: 'organization',
      optimization: rolesDuration > 10 ? 'Consider composite index on (organizationId, isActive, name)' : 'Good performance'
    });
  }

  /**
   * Generate analysis report
   */
  private async generateReport(): Promise<void> {
    console.log('\n📋 Query Analysis Report');
    console.log('='.repeat(50));

    // Group by type
    const byType = this.results.reduce((acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(byType).forEach(([type, results]) => {
      console.log(`\n${type.toUpperCase()} Queries:`);
      results.forEach(result => {
        const status = result.duration > 20 ? '⚠️  SLOW' : '✅ FAST';
        console.log(`  ${status} ${result.query}: ${result.duration}ms`);
        console.log(`    Optimization: ${result.optimization}`);
      });
    });

    // Generate ADR content
    const adrContent = this.generateADRContent();
    const adrPath = join(process.cwd(), 'docs', 'adr', '01_query_tuning.md');
    
    try {
      writeFileSync(adrPath, adrContent);
      console.log(`\n📝 ADR written to: ${adrPath}`);
    } catch (error) {
      console.log('\n📝 ADR content (save manually):');
      console.log(adrContent);
    }
  }

  /**
   * Generate ADR content for query tuning
   */
  private generateADRContent(): string {
    const slowQueries = this.results.filter(r => r.duration > 20);
    const fastQueries = this.results.filter(r => r.duration <= 20);

    return `# Query Tuning Analysis

**Date**: ${new Date().toISOString().split('T')[0]}
**Status**: Analysis Complete

## Executive Summary

This analysis identifies ${slowQueries.length} slow queries and ${fastQueries.length} well-performing queries in the Pivotal Flow platform.

## Query Performance Analysis

### Slow Queries (>20ms)

${slowQueries.map(q => `- **${q.query}**: ${q.duration}ms - ${q.optimization}`).join('\n')}

### Fast Queries (≤20ms)

${fastQueries.map(q => `- **${q.query}**: ${q.duration}ms - ${q.optimization}`).join('\n')}

## Recommended Indexes

### High Priority
${slowQueries.filter(q => q.type === 'user').map(q => 
  `- Composite index on \`users\` table: \`(organizationId, status, createdAt)\` for listUsers queries`
).join('\n')}

${slowQueries.filter(q => q.type === 'auth').map(q => 
  `- Composite index on \`users\` table: \`(email, organizationId)\` for authentication lookups`
).join('\n')}

${slowQueries.filter(q => q.type === 'organization').map(q => 
  `- Composite index on \`organization_settings\` table: \`(organizationId, category, key)\` for settings queries`
).join('\n')}

## Implementation Notes

1. **Index Creation**: Use Prisma migrations to add indexes
2. **Testing**: Verify performance improvements in staging environment
3. **Monitoring**: Track query performance after index implementation
4. **Rollback**: Keep migration files for easy rollback if needed

## Next Steps

1. Create database migration for recommended indexes
2. Test performance improvements
3. Monitor query performance in production
4. Schedule regular query analysis reviews
`;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new QueryAnalyzer();
  analyzer.runAnalysis();
}
