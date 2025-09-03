#!/usr/bin/env node

/**
 * Payment System Performance Smoke Test
 * 
 * Tests payment creation, listing, and void operations
 * to ensure the payment system meets performance requirements.
 * 
 * Usage: node scripts/ci/payment-perf-smoke.js <base-url>
 */

import { readFileSync } from 'fs';

const BASE_URL = process.argv[2] || 'http://localhost:3000';

// Test data
const TEST_INVOICE_ID = '381b4f3b-b343-4922-abba-306f9fc0417d';
const TEST_PAYMENT_DATA = {
  invoiceId: TEST_INVOICE_ID,
  amount: 1000,
  currency: 'NZD',
  method: 'bank_transfer',
  reference: 'CI-TEST-001',
  paidAt: new Date().toISOString(),
  idempotencyKey: `ci-test-${Date.now()}`,
  gatewayPayload: {
    transactionId: `tx-${Date.now()}`,
    gateway: 'test-gateway'
  }
};

class PaymentSmokeTest {
  constructor() {
    this.results = {
      tests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      performance: {}
    };
  }

  async run() {
    console.log('🧪 Payment System Performance Smoke Test');
    console.log(`📍 Testing against: ${BASE_URL}`);
    console.log('');

    try {
      // Test 1: Health check
      await this.testHealthCheck();
      
      // Test 2: List payments for invoice
      await this.testListPayments();
      
      // Test 3: Create payment
      await this.testCreatePayment();
      
      // Test 4: List payments after creation
      await this.testListPaymentsAfterCreation();
      
      // Test 5: Void payment
      await this.testVoidPayment();
      
      // Test 6: Performance metrics
      await this.testPerformanceMetrics();
      
    } catch (error) {
      this.recordError('Test execution failed', error);
    }

    this.printResults();
    this.exitWithCode();
  }

  async testHealthCheck() {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/health`);
      const duration = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(`Health check returned invalid status: ${data.status}`);
      }
      
      this.recordSuccess('Health check', duration);
      console.log('✅ Health check passed');
    } catch (error) {
      this.recordError('Health check', error);
    }
  }

  async testListPayments() {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/v1/test/payments/${TEST_INVOICE_ID}`);
      const duration = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`List payments failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.invoice || !Array.isArray(data.payments)) {
        throw new Error('Invalid response format');
      }
      
      this.recordSuccess('List payments', duration);
      console.log(`✅ List payments passed (${data.payments.length} payments found)`);
    } catch (error) {
      this.recordError('List payments', error);
    }
  }

  async testCreatePayment() {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/v1/test/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(TEST_PAYMENT_DATA)
      });
      const duration = Date.now() - start;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Create payment failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      if (!data.id || !data.amount || data.status !== 'completed') {
        throw new Error('Invalid payment response format');
      }
      
      this.recordSuccess('Create payment', duration);
      console.log(`✅ Create payment passed (ID: ${data.id})`);
      
      // Store payment ID for void test
      this.createdPaymentId = data.id;
    } catch (error) {
      this.recordError('Create payment', error);
    }
  }

  async testListPaymentsAfterCreation() {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/v1/test/payments/${TEST_INVOICE_ID}`);
      const duration = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`List payments after creation failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.invoice || !Array.isArray(data.payments)) {
        throw new Error('Invalid response format');
      }
      
      // Check that invoice balance was updated
      if (parseFloat(data.invoice.balanceAmount) >= parseFloat(data.invoice.totalAmount)) {
        throw new Error('Invoice balance not updated after payment');
      }
      
      this.recordSuccess('List payments after creation', duration);
      console.log(`✅ List payments after creation passed (balance: ${data.invoice.balanceAmount})`);
    } catch (error) {
      this.recordError('List payments after creation', error);
    }
  }

  async testVoidPayment() {
    if (!this.createdPaymentId) {
      console.log('⚠️  Skipping void payment test (no payment created)');
      return;
    }

    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/v1/payments/${this.createdPaymentId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          reason: 'CI test void'
        })
      });
      const duration = Date.now() - start;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Void payment failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      if (!data.id || data.status !== 'void') {
        throw new Error('Invalid void payment response format');
      }
      
      this.recordSuccess('Void payment', duration);
      console.log(`✅ Void payment passed (ID: ${data.id})`);
    } catch (error) {
      this.recordError('Void payment', error);
    }
  }

  async testPerformanceMetrics() {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/v1/metrics`);
      const duration = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`Metrics check failed: ${response.status}`);
      }
      
      const data = await response.text();
      
      // Check for payment-related metrics
      const paymentMetrics = [
        'pivotal_payment_created_total',
        'pivotal_payment_apply_ms',
        'pivotal_invoice_paid_total'
      ];
      
      const missingMetrics = paymentMetrics.filter(metric => !data.includes(metric));
      if (missingMetrics.length > 0) {
        throw new Error(`Missing payment metrics: ${missingMetrics.join(', ')}`);
      }
      
      this.recordSuccess('Performance metrics', duration);
      console.log('✅ Performance metrics check passed');
    } catch (error) {
      this.recordError('Performance metrics', error);
    }
  }

  recordSuccess(testName, duration) {
    this.results.tests++;
    this.results.passed++;
    this.results.performance[testName] = duration;
  }

  recordError(testName, error) {
    this.results.tests++;
    this.results.failed++;
    this.results.errors.push({
      test: testName,
      error: error.message || error.toString()
    });
    console.log(`❌ ${testName} failed: ${error.message || error.toString()}`);
  }

  printResults() {
    console.log('');
    console.log('📊 Test Results:');
    console.log(`   Tests: ${this.results.tests}`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('');
      console.log('❌ Errors:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`   ${test}: ${error}`);
      });
    }
    
    console.log('');
    console.log('⏱️  Performance:');
    Object.entries(this.results.performance).forEach(([test, duration]) => {
      console.log(`   ${test}: ${duration}ms`);
    });
  }

  exitWithCode() {
    const exitCode = this.results.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Run the test
const test = new PaymentSmokeTest();
test.run().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
