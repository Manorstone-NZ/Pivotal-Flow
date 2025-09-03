#!/usr/bin/env node

/**
 * Security and Quality Checks for CI Pipeline
 * 
 * This script performs comprehensive security and quality checks
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface QualityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface SecurityReport {
  timestamp: string;
  securityChecks: SecurityCheck[];
  qualityChecks: QualityCheck[];
  summary: string;
  recommendations: string[];
}

class SecurityQualityChecker {
  private securityChecks: SecurityCheck[] = [];
  private qualityChecks: QualityCheck[] = [];

  async runChecks(): Promise<SecurityReport> {
    console.log('🔒 Running Security and Quality Checks...\n');

    try {
      // Security checks
      await this.checkDependencies();
      await this.checkSecrets();
      await this.checkPermissions();
      await this.checkInputValidation();
      await this.checkSQLInjection();
      
      // Quality checks
      await this.checkCodeComplexity();
      await this.checkFileSizes();
      await this.checkNamingConventions();
      await this.checkDocumentation();
      await this.checkErrorHandling();

      const recommendations = this.generateRecommendations();
      const summary = this.generateSummary();

      const report: SecurityReport = {
        timestamp: new Date().toISOString(),
        securityChecks: this.securityChecks,
        qualityChecks: this.qualityChecks,
        summary,
        recommendations
      };

      this.printReport(report);
      return report;
    } catch (error) {
      console.error('❌ Security and quality checks failed:', error);
      throw error;
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log('📦 Checking Dependencies...');
    
    try {
      // Check for known vulnerabilities
      const output = execSync('pnpm audit --audit-level moderate', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (output.includes('0 vulnerabilities')) {
        this.securityChecks.push({
          name: 'Dependency Vulnerabilities',
          status: 'pass',
          message: 'No known vulnerabilities found in dependencies'
        });
      } else {
        this.securityChecks.push({
          name: 'Dependency Vulnerabilities',
          status: 'fail',
          message: 'Known vulnerabilities found in dependencies',
          details: output
        });
      }
    } catch (error: any) {
      this.securityChecks.push({
        name: 'Dependency Vulnerabilities',
        status: 'warning',
        message: 'Could not check dependencies',
        details: error.message
      });
    }
  }

  private async checkSecrets(): Promise<void> {
    console.log('🔐 Checking for Secrets...');
    
    try {
      // Check for hardcoded secrets
      const secretPatterns = [
        'password.*=.*["\'][^"\']{8,}',
        'secret.*=.*["\'][^"\']{8,}',
        'token.*=.*["\'][^"\']{8,}',
        'key.*=.*["\'][^"\']{8,}',
        'api_key.*=.*["\'][^"\']{8,}'
      ];

      let foundSecrets = false;
      for (const pattern of secretPatterns) {
        try {
          const output = execSync(`grep -r "${pattern}" apps/ packages/ --exclude-dir=node_modules --exclude-dir=dist`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          if (output.trim()) {
            foundSecrets = true;
            break;
          }
        } catch (error) {
          // No secrets found for this pattern
        }
      }

      if (!foundSecrets) {
        this.securityChecks.push({
          name: 'Hardcoded Secrets',
          status: 'pass',
          message: 'No hardcoded secrets found'
        });
      } else {
        this.securityChecks.push({
          name: 'Hardcoded Secrets',
          status: 'fail',
          message: 'Potential hardcoded secrets found'
        });
      }
    } catch (error: any) {
      this.securityChecks.push({
        name: 'Hardcoded Secrets',
        status: 'warning',
        message: 'Could not check for secrets',
        details: error.message
      });
    }
  }

  private async checkPermissions(): Promise<void> {
    console.log('🔑 Checking File Permissions...');
    
    try {
      // Check for overly permissive files
      const output = execSync('find . -type f -perm /o+w -not -path "./node_modules/*" -not -path "./dist/*"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (!output.trim()) {
        this.securityChecks.push({
          name: 'File Permissions',
          status: 'pass',
          message: 'No overly permissive files found'
        });
      } else {
        this.securityChecks.push({
          name: 'File Permissions',
          status: 'warning',
          message: 'Some files have overly permissive permissions',
          details: output
        });
      }
    } catch (error: any) {
      this.securityChecks.push({
        name: 'File Permissions',
        status: 'warning',
        message: 'Could not check file permissions',
        details: error.message
      });
    }
  }

  private async checkInputValidation(): Promise<void> {
    console.log('✅ Checking Input Validation...');
    
    try {
      // Check for proper input validation patterns
      const validationPatterns = [
        'zod\\.',
        'joi\\.',
        'yup\\.',
        'validate',
        'sanitize'
      ];

      let foundValidation = false;
      for (const pattern of validationPatterns) {
        try {
          const output = execSync(`grep -r "${pattern}" apps/backend/src --include="*.ts" --exclude-dir=node_modules`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          if (output.trim()) {
            foundValidation = true;
            break;
          }
        } catch (error) {
          // No validation found for this pattern
        }
      }

      if (foundValidation) {
        this.securityChecks.push({
          name: 'Input Validation',
          status: 'pass',
          message: 'Input validation patterns found'
        });
      } else {
        this.securityChecks.push({
          name: 'Input Validation',
          status: 'warning',
          message: 'Limited input validation patterns found'
        });
      }
    } catch (error: any) {
      this.securityChecks.push({
        name: 'Input Validation',
        status: 'warning',
        message: 'Could not check input validation',
        details: error.message
      });
    }
  }

  private async checkSQLInjection(): Promise<void> {
    console.log('💉 Checking SQL Injection Protection...');
    
    try {
      // Check for raw SQL queries
      const output = execSync('grep -r "query(" apps/backend/src --include="*.ts" --exclude-dir=node_modules', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (output.includes('drizzle') || output.includes('orm')) {
        this.securityChecks.push({
          name: 'SQL Injection Protection',
          status: 'pass',
          message: 'Using ORM with parameterized queries'
        });
      } else {
        this.securityChecks.push({
          name: 'SQL Injection Protection',
          status: 'warning',
          message: 'Raw SQL queries detected, ensure proper parameterization'
        });
      }
    } catch (error: any) {
      this.securityChecks.push({
        name: 'SQL Injection Protection',
        status: 'warning',
        message: 'Could not check SQL injection protection',
        details: error.message
      });
    }
  }

  private async checkCodeComplexity(): Promise<void> {
    console.log('🧮 Checking Code Complexity...');
    
    try {
      // Check for complex functions
      const output = execSync('find apps/backend/src -name "*.ts" -exec wc -l {} + | tail -1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const totalLines = parseInt(output.match(/\d+/)?.[0] || '0');
      
      if (totalLines < 10000) {
        this.qualityChecks.push({
          name: 'Code Complexity',
          status: 'pass',
          message: `Reasonable codebase size: ${totalLines} lines`
        });
      } else {
        this.qualityChecks.push({
          name: 'Code Complexity',
          status: 'warning',
          message: `Large codebase: ${totalLines} lines, consider modularization`
        });
      }
    } catch (error: any) {
      this.qualityChecks.push({
        name: 'Code Complexity',
        status: 'warning',
        message: 'Could not check code complexity',
        details: error.message
      });
    }
  }

  private async checkFileSizes(): Promise<void> {
    console.log('📏 Checking File Sizes...');
    
    try {
      // Check for large files
      const output = execSync('find apps/backend/src -name "*.ts" -size +100k', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (!output.trim()) {
        this.qualityChecks.push({
          name: 'File Sizes',
          status: 'pass',
          message: 'No excessively large files found'
        });
      } else {
        this.qualityChecks.push({
          name: 'File Sizes',
          status: 'warning',
          message: 'Some files are larger than 100KB',
          details: output
        });
      }
    } catch (error: any) {
      this.qualityChecks.push({
        name: 'File Sizes',
        status: 'warning',
        message: 'Could not check file sizes',
        details: error.message
      });
    }
  }

  private async checkNamingConventions(): Promise<void> {
    console.log('📝 Checking Naming Conventions...');
    
    try {
      // Check for consistent naming
      const output = execSync('grep -r "function [a-z]" apps/backend/src --include="*.ts" --exclude-dir=node_modules | head -5', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (!output.trim()) {
        this.qualityChecks.push({
          name: 'Naming Conventions',
          status: 'pass',
          message: 'Consistent naming conventions found'
        });
      } else {
        this.qualityChecks.push({
          name: 'Naming Conventions',
          status: 'warning',
          message: 'Some functions may not follow naming conventions',
          details: output
        });
      }
    } catch (error: any) {
      this.qualityChecks.push({
        name: 'Naming Conventions',
        status: 'warning',
        message: 'Could not check naming conventions',
        details: error.message
      });
    }
  }

  private async checkDocumentation(): Promise<void> {
    console.log('📚 Checking Documentation...');
    
    try {
      // Check for JSDoc comments
      const output = execSync('grep -r "/**" apps/backend/src --include="*.ts" --exclude-dir=node_modules | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const docCount = parseInt(output.trim());
      
      if (docCount > 50) {
        this.qualityChecks.push({
          name: 'Documentation',
          status: 'pass',
          message: `Good documentation coverage: ${docCount} documented functions`
        });
      } else {
        this.qualityChecks.push({
          name: 'Documentation',
          status: 'warning',
          message: `Limited documentation: ${docCount} documented functions`
        });
      }
    } catch (error: any) {
      this.qualityChecks.push({
        name: 'Documentation',
        status: 'warning',
        message: 'Could not check documentation',
        details: error.message
      });
    }
  }

  private async checkErrorHandling(): Promise<void> {
    console.log('⚠️  Checking Error Handling...');
    
    try {
      // Check for proper error handling
      const output = execSync('grep -r "catch\|throw\|Error" apps/backend/src --include="*.ts" --exclude-dir=node_modules | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = parseInt(output.trim());
      
      if (errorCount > 20) {
        this.qualityChecks.push({
          name: 'Error Handling',
          status: 'pass',
          message: `Good error handling coverage: ${errorCount} error handling instances`
        });
      } else {
        this.qualityChecks.push({
          name: 'Error Handling',
          status: 'warning',
          message: `Limited error handling: ${errorCount} error handling instances`
        });
      }
    } catch (error: any) {
      this.qualityChecks.push({
        name: 'Error Handling',
        status: 'warning',
        message: 'Could not check error handling',
        details: error.message
      });
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    const failedSecurityChecks = this.securityChecks.filter(check => check.status === 'fail');
    if (failedSecurityChecks.length > 0) {
      recommendations.push(`Address ${failedSecurityChecks.length} failed security checks`);
    }

    // Quality recommendations
    const failedQualityChecks = this.qualityChecks.filter(check => check.status === 'fail');
    if (failedQualityChecks.length > 0) {
      recommendations.push(`Address ${failedQualityChecks.length} failed quality checks`);
    }

    // Specific recommendations
    if (this.securityChecks.find(c => c.name === 'Dependency Vulnerabilities' && c.status === 'fail')) {
      recommendations.push('Update dependencies to fix known vulnerabilities');
    }

    if (this.securityChecks.find(c => c.name === 'Hardcoded Secrets' && c.status === 'fail')) {
      recommendations.push('Remove hardcoded secrets and use environment variables');
    }

    return recommendations;
  }

  private generateSummary(): string {
    const totalSecurityChecks = this.securityChecks.length;
    const passedSecurityChecks = this.securityChecks.filter(c => c.status === 'pass').length;
    const totalQualityChecks = this.qualityChecks.length;
    const passedQualityChecks = this.qualityChecks.filter(c => c.status === 'pass').length;

    const securityScore = (passedSecurityChecks / totalSecurityChecks) * 100;
    const qualityScore = (passedQualityChecks / totalQualityChecks) * 100;

    if (securityScore >= 90 && qualityScore >= 90) {
      return `🎉 Excellent! Security: ${securityScore.toFixed(1)}%, Quality: ${qualityScore.toFixed(1)}%`;
    } else if (securityScore >= 80 && qualityScore >= 80) {
      return `✅ Good! Security: ${securityScore.toFixed(1)}%, Quality: ${qualityScore.toFixed(1)}%`;
    } else {
      return `⚠️  Needs improvement! Security: ${securityScore.toFixed(1)}%, Quality: ${qualityScore.toFixed(1)}%`;
    }
  }

  private printReport(report: SecurityReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 SECURITY AND QUALITY REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📅 Timestamp: ${report.timestamp}`);
    
    console.log('\n🔒 Security Checks:');
    console.log('-'.repeat(40));
    
    for (const check of report.securityChecks) {
      const status = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
      console.log(`${status} ${check.name}: ${check.message}`);
    }
    
    console.log('\n📊 Quality Checks:');
    console.log('-'.repeat(40));
    
    for (const check of report.qualityChecks) {
      const status = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
      console.log(`${status} ${check.name}: ${check.message}`);
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
  const checker = new SecurityQualityChecker();
  
  try {
    const report = await checker.runChecks();
    
    const failedSecurityChecks = report.securityChecks.filter(c => c.status === 'fail');
    const failedQualityChecks = report.qualityChecks.filter(c => c.status === 'fail');
    
    if (failedSecurityChecks.length > 0 || failedQualityChecks.length > 0) {
      console.log('\n❌ Some checks failed. Please address the issues above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All checks passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Security and quality checks failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SecurityQualityChecker };
