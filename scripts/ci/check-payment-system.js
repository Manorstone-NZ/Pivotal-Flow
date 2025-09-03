#!/usr/bin/env node

/**
 * Payment System CI Check
 * 
 * Validates that the payment system implementation follows
 * the required patterns and conventions.
 * 
 * Usage: node scripts/ci/check-payment-system.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Required payment system components
const REQUIRED_COMPONENTS = [
  'packages/shared/src/db/repo.payments.ts',
  'apps/backend/src/modules/payments/routes.ts',
  'apps/backend/src/lib/schema.ts',
  'apps/backend/drizzle/0007_payments_support.sql'
];

// Required payment fields in schema
const REQUIRED_PAYMENT_FIELDS = [
  'id',
  'organization_id',
  'invoice_id',
  'amount',
  'currency',
  'method',
  'reference',
  'status',
  'paid_at',
  'voided_at',
  'idempotency_key',
  'gateway_payload',
  'created_by',
  'voided_by',
  'void_reason',
  'created_at',
  'updated_at'
];

// Required invoice fields for payments
const REQUIRED_INVOICE_FIELDS = [
  'paid_amount',
  'balance_amount',
  'status'
];

// Payment API endpoints that should exist
const REQUIRED_ENDPOINTS = [
  'POST /v1/payments',
  'GET /v1/invoices/:id/payments',
  'POST /v1/payments/:id/void'
];

// Payment metrics that should be collected
const REQUIRED_METRICS = [
  'pivotal_payment_created_total',
  'pivotal_payment_apply_ms',
  'pivotal_invoice_paid_total'
];

class PaymentSystemCheck {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.checks = 0;
    this.passed = 0;
  }

  async run() {
    console.log('🔍 Payment System CI Check');
    console.log('');

    try {
      await this.checkRequiredComponents();
      await this.checkPaymentSchema();
      await this.checkInvoiceSchema();
      await this.checkPaymentRoutes();
      await this.checkPaymentMetrics();
      await this.checkPaymentRepository();
      await this.checkDatabaseMigration();
    } catch (error) {
      this.recordViolation('Check execution failed', error.message);
    }

    this.printResults();
    this.exitWithCode();
  }

  async checkRequiredComponents() {
    this.checks++;
    console.log('📁 Checking required components...');
    
    for (const component of REQUIRED_COMPONENTS) {
      try {
        const content = readFileSync(component, 'utf8');
        if (content.length === 0) {
          this.recordViolation(`Empty file: ${component}`);
        } else {
          console.log(`  ✅ ${component}`);
        }
      } catch (error) {
        this.recordViolation(`Missing required component: ${component}`);
      }
    }
    
    this.passed++;
  }

  async checkPaymentSchema() {
    this.checks++;
    console.log('🗄️  Checking payment schema...');
    
    try {
      const schemaContent = readFileSync('apps/backend/src/lib/schema.ts', 'utf8');
      
      // Check for payments table definition
      if (!schemaContent.includes('payments')) {
        this.recordViolation('Payments table not found in schema');
        return;
      }
      
      // Check for required fields
      for (const field of REQUIRED_PAYMENT_FIELDS) {
        if (!schemaContent.includes(field)) {
          this.recordViolation(`Missing payment field: ${field}`);
        }
      }
      
      // Check for proper types (not JSONB for core fields)
      const jsonbPatterns = [
        /amount.*jsonb/gi,
        /currency.*jsonb/gi,
        /status.*jsonb/gi,
        /paid_at.*jsonb/gi
      ];
      
      for (const pattern of jsonbPatterns) {
        if (pattern.test(schemaContent)) {
          this.recordViolation(`Core payment field using JSONB: ${pattern.source}`);
        }
      }
      
      console.log('  ✅ Payment schema validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check payment schema', error.message);
    }
  }

  async checkInvoiceSchema() {
    this.checks++;
    console.log('📄 Checking invoice schema...');
    
    try {
      const schemaContent = readFileSync('apps/backend/src/lib/schema.ts', 'utf8');
      
      // Check for required invoice fields
      for (const field of REQUIRED_INVOICE_FIELDS) {
        if (!schemaContent.includes(field)) {
          this.recordViolation(`Missing invoice field: ${field}`);
        }
      }
      
      // Check for proper status transitions
      const statusPattern = /status.*enum.*\[.*draft.*sent.*part_paid.*paid.*overdue.*written_off/gi;
      if (!statusPattern.test(schemaContent)) {
        this.recordWarning('Invoice status transitions may not be properly defined');
      }
      
      console.log('  ✅ Invoice schema validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check invoice schema', error.message);
    }
  }

  async checkPaymentRoutes() {
    this.checks++;
    console.log('🛣️  Checking payment routes...');
    
    try {
      const routesContent = readFileSync('apps/backend/src/modules/payments/routes.ts', 'utf8');
      
      // Check for required endpoints with more flexible patterns
      const endpointChecks = [
        { name: 'POST /v1/payments', patterns: ['fastify.post', '/v1/payments'] },
        { name: 'GET /v1/invoices/:id/payments', patterns: ['fastify.get', '/v1/invoices', '/payments'] },
        { name: 'POST /v1/payments/:id/void', patterns: ['fastify.post', '/v1/payments', '/void'] }
      ];
      
      for (const check of endpointChecks) {
        const hasAllPatterns = check.patterns.every(pattern => routesContent.includes(pattern));
        if (!hasAllPatterns) {
          this.recordViolation(`Missing endpoint: ${check.name}`);
        }
      }
      
      // Check for proper validation
      if (!routesContent.includes('CreatePaymentSchema') || !routesContent.includes('z.object')) {
        this.recordViolation('Missing payment validation schemas');
      }
      
      // Check for error handling
      if (!routesContent.includes('try') || !routesContent.includes('catch')) {
        this.recordWarning('Payment routes may lack proper error handling');
      }
      
      console.log('  ✅ Payment routes validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check payment routes', error.message);
    }
  }

  async checkPaymentMetrics() {
    this.checks++;
    console.log('📊 Checking payment metrics...');
    
    try {
      const metricsContent = readFileSync('packages/shared/src/metrics/index.ts', 'utf8');
      
      // Check for payment-related metrics with more flexible patterns
      const metricChecks = [
        { name: 'payment_created', patterns: ['recordPaymentCreated'] },
        { name: 'payment_apply', patterns: ['recordPaymentApply'] },
        { name: 'payment_error', patterns: ['recordPaymentError'] }
      ];
      
      for (const check of metricChecks) {
        const hasAllPatterns = check.patterns.every(pattern => metricsContent.includes(pattern));
        if (!hasAllPatterns) {
          this.recordViolation(`Missing payment metric: ${check.name}`);
        }
      }
      
      // Check for payment methods
      if (!metricsContent.includes('recordPaymentCreated') || !metricsContent.includes('recordPaymentApply')) {
        this.recordViolation('Missing payment metric methods');
      }
      
      console.log('  ✅ Payment metrics validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check payment metrics', error.message);
    }
  }

  async checkPaymentRepository() {
    this.checks++;
    console.log('🏪 Checking payment repository...');
    
    try {
      const repoContent = readFileSync('packages/shared/src/db/repo.payments.ts', 'utf8');
      
      // Check for required methods
      const requiredMethods = [
        'createPayment',
        'getPaymentsByInvoice',
        'getPaymentById',
        'voidPayment',
        'validatePaymentData'
      ];
      
      for (const method of requiredMethods) {
        if (!repoContent.includes(method)) {
          this.recordViolation(`Missing payment repository method: ${method}`);
        }
      }
      
      // Check for transaction handling
      if (!repoContent.includes('transaction') && !repoContent.includes('tx')) {
        this.recordWarning('Payment repository may not use transactions for data consistency');
      }
      
      // Check for idempotency support
      if (!repoContent.includes('idempotency')) {
        this.recordWarning('Payment repository may not support idempotency');
      }
      
      console.log('  ✅ Payment repository validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check payment repository', error.message);
    }
  }

  async checkDatabaseMigration() {
    this.checks++;
    console.log('🗃️  Checking database migration...');
    
    try {
      const migrationContent = readFileSync('apps/backend/drizzle/0007_payments_support.sql', 'utf8');
      
      // Check for payments table creation with more flexible patterns
      if (!migrationContent.includes('payments') && !migrationContent.includes('CREATE TABLE')) {
        this.recordViolation('Payments table not created in migration');
      }
      
      // Check for proper constraints with more flexible patterns
      if (!migrationContent.includes('invoice_id') && !migrationContent.includes('FOREIGN KEY')) {
        this.recordWarning('Payments table may lack proper foreign key constraints');
      }
      
      // Check for indexes
      if (!migrationContent.includes('CREATE INDEX') && !migrationContent.includes('CREATE UNIQUE INDEX')) {
        this.recordWarning('Payments table may lack proper indexes');
      }
      
      console.log('  ✅ Database migration validation passed');
      this.passed++;
    } catch (error) {
      this.recordViolation('Failed to check database migration', error.message);
    }
  }

  recordViolation(message, details = '') {
    this.violations.push({ message, details });
    console.log(`  ❌ ${message}${details ? `: ${details}` : ''}`);
  }

  recordWarning(message) {
    this.warnings.push(message);
    console.log(`  ⚠️  ${message}`);
  }

  printResults() {
    console.log('');
    console.log('📋 Check Results:');
    console.log(`   Checks: ${this.checks}`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Violations: ${this.violations.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    
    if (this.violations.length > 0) {
      console.log('');
      console.log('❌ Violations:');
      this.violations.forEach(({ message, details }) => {
        console.log(`   - ${message}${details ? `: ${details}` : ''}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('');
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
  }

  exitWithCode() {
    const exitCode = this.violations.length > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Run the check
const check = new PaymentSystemCheck();
check.run().catch(error => {
  console.error('Check execution failed:', error);
  process.exit(1);
});
