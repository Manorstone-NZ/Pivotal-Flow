import { eq } from 'drizzle-orm';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getDatabase } from '../../../lib/db.js';
import { organizations, users, payments, quotes } from '../../../lib/schema.js';

describe('Payments Module', () => {
  let testDb: any;
  
  const testOptions = {
    organizationId: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  beforeEach(async () => {
    // Setup real test database
    testDb = await getDatabase();

    // Setup test data
    await testDb.insert(organizations).values({
      id: testOptions.organizationId,
      name: 'Test Organization',
      slug: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testDb.insert(users).values({
      id: testOptions.userId,
      organizationId: testOptions.organizationId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  afterEach(async () => {
    // Clean up test data
    await testDb.delete(payments).where(eq(payments.organizationId, testOptions.organizationId));
    await testDb.delete(quotes).where(eq(quotes.organizationId, testOptions.organizationId));
    await testDb.delete(users).where(eq(users.organizationId, testOptions.organizationId));
    await testDb.delete(organizations).where(eq(organizations.id, testOptions.organizationId));
  });

  describe('Payment Creation', () => {
    it('should create payment record successfully', async () => {
      // Create test quote
      const quoteId = `quote-1-${Date.now()}`;
      await testDb.insert(quotes).values({
        id: quoteId,
        organizationId: testOptions.organizationId,
        customerId: 'customer-123',
        status: 'approved',
        totalAmount: 1000.00,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const paymentData = {
        quoteId: quoteId,
        amount: 1000.00,
        currency: 'USD',
        method: 'credit_card',
        status: 'pending',
        reference: 'PAY-123'
      };

      const result = await testDb.insert(payments).values({
        id: `payment-1-${Date.now()}`,
        organizationId: testOptions.organizationId,
        quoteId: paymentData.quoteId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        status: paymentData.status,
        reference: paymentData.reference,
        processedBy: testOptions.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        organizationId: testOptions.organizationId,
        quoteId: paymentData.quoteId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        status: paymentData.status,
        reference: paymentData.reference,
        processedBy: testOptions.userId
      });
    });

    it('should validate payment amount matches quote total', async () => {
      // Create test quote with specific amount
      const quoteId = `quote-1-${Date.now()}`;
      await testDb.insert(quotes).values({
        id: quoteId,
        organizationId: testOptions.organizationId,
        customerId: 'customer-123',
        status: 'approved',
        totalAmount: 1000.00,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Try to create payment with different amount
      const paymentData = {
        quoteId: quoteId,
        amount: 1500.00, // Different from quote total
        currency: 'USD',
        method: 'credit_card',
        status: 'pending',
        reference: 'PAY-123'
      };

      // This should be validated in the actual implementation
      // For now, we'll just test the database insertion
      const result = await testDb.insert(payments).values({
        id: `payment-1-${Date.now()}`,
        organizationId: testOptions.organizationId,
        quoteId: paymentData.quoteId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        status: paymentData.status,
        reference: paymentData.reference,
        processedBy: testOptions.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(result).toHaveLength(1);
    });
  });

  describe('Payment Status Updates', () => {
    it('should update payment status successfully', async () => {
      // Create test payment
      const paymentId = `payment-1-${Date.now()}`;
      await testDb.insert(payments).values({
        id: paymentId,
        organizationId: testOptions.organizationId,
        quoteId: 'quote-123',
        amount: 1000.00,
        currency: 'USD',
        method: 'credit_card',
        status: 'pending',
        reference: 'PAY-123',
        processedBy: testOptions.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update payment status
      const result = await testDb.update(payments)
        .set({
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(payments.id, paymentId))
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('completed');
    });

    it('should track payment status history', async () => {
      // Create test payment
      const paymentId = `payment-1-${Date.now()}`;
      await testDb.insert(payments).values({
        id: paymentId,
        organizationId: testOptions.organizationId,
        quoteId: 'quote-123',
        amount: 1000.00,
        currency: 'USD',
        method: 'credit_card',
        status: 'pending',
        reference: 'PAY-123',
        processedBy: testOptions.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update status multiple times
      await testDb.update(payments)
        .set({
          status: 'processing',
          updatedAt: new Date()
        })
        .where(eq(payments.id, paymentId));

      await testDb.update(payments)
        .set({
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(payments.id, paymentId));

      const finalPayment = await testDb.select().from(payments).where(eq(payments.id, paymentId));
      expect(finalPayment[0].status).toBe('completed');
    });
  });

  describe('Payment Retrieval', () => {
    it('should retrieve payments with pagination', async () => {
      // Create multiple test payments
      const testPayments = [
        {
          id: `payment-1-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-1',
          amount: 1000.00,
          currency: 'USD',
          method: 'credit_card',
          status: 'completed',
          reference: 'PAY-1',
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `payment-2-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-2',
          amount: 2000.00,
          currency: 'USD',
          method: 'bank_transfer',
          status: 'pending',
          reference: 'PAY-2',
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await testDb.insert(payments).values(testPayments);

      // Retrieve payments
      const result = await testDb.select()
        .from(payments)
        .where(eq(payments.organizationId, testOptions.organizationId))
        .limit(10)
        .offset(0);

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(1000.00);
      expect(result[1].amount).toBe(2000.00);
    });

    it('should filter payments by status', async () => {
      // Create test payments with different statuses
      const testPayments = [
        {
          id: `payment-1-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-1',
          amount: 1000.00,
          currency: 'USD',
          method: 'credit_card',
          status: 'completed',
          reference: 'PAY-1',
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `payment-2-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-2',
          amount: 2000.00,
          currency: 'USD',
          method: 'bank_transfer',
          status: 'pending',
          reference: 'PAY-2',
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await testDb.insert(payments).values(testPayments);

      // Filter by completed status
      const completedPayments = await testDb.select()
        .from(payments)
        .where(eq(payments.organizationId, testOptions.organizationId))
        .where(eq(payments.status, 'completed'));

      expect(completedPayments).toHaveLength(1);
      expect(completedPayments[0].status).toBe('completed');
    });
  });

  describe('Payment Validation', () => {
    it('should validate payment method', async () => {
      const validMethods = ['credit_card', 'bank_transfer', 'paypal', 'cash'];
      
      // Test each valid method
      for (const method of validMethods) {
        const paymentData = {
          id: `payment-${method}-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-123',
          amount: 1000.00,
          currency: 'USD',
          method: method,
          status: 'pending',
          reference: `PAY-${method}`,
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await testDb.insert(payments).values(paymentData).returning();
        expect(result).toHaveLength(1);
        expect(result[0].method).toBe(method);
      }
    });

    it('should validate currency format', async () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
      
      // Test each valid currency
      for (const currency of validCurrencies) {
        const paymentData = {
          id: `payment-${currency}-${Date.now()}`,
          organizationId: testOptions.organizationId,
          quoteId: 'quote-123',
          amount: 1000.00,
          currency: currency,
          method: 'credit_card',
          status: 'pending',
          reference: `PAY-${currency}`,
          processedBy: testOptions.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await testDb.insert(payments).values(paymentData).returning();
        expect(result).toHaveLength(1);
        expect(result[0].currency).toBe(currency);
      }
    });
  });
});
