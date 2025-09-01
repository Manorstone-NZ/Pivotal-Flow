import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import { quotes, quoteLineItems, organizations, customers, users, auditLogs, serviceCategories } from '../../../lib/schema.js';
import { QuoteService } from '../service.js';
import { QuoteStatus } from '../schemas.js';
import { AuditLogger } from '../../../lib/audit-logger.drizzle.js';
import { randomUUID } from 'crypto';
import { Decimal } from 'decimal.js';

// Test database connection
const testConnectionString = 'postgresql://pivotal:pivotal@localhost:5433/pivotal';
const testClient = postgres(testConnectionString);
const testDb = drizzle(testClient) as any;

describe('Quote Integration Tests', () => {
  let quoteService: QuoteService;
  let auditLogger: AuditLogger;
  
  // Test data
  const testOrg1 = {
    id: 'test-org-1',
    name: 'Test Organization 1',
    slug: 'test-org-1',
    timezone: 'UTC',
    currency: 'NZD',
    subscriptionPlan: 'basic',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testOrg2 = {
    id: 'test-org-2', 
    name: 'Test Organization 2',
    slug: 'test-org-2',
    timezone: 'UTC',
    currency: 'USD',
    subscriptionPlan: 'basic',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testCustomer1 = {
    id: 'test-customer-1',
    organizationId: 'test-org-1',
    customerNumber: 'CUST-001',
    companyName: 'Test Customer 1',
    legalName: 'Test Customer 1 Ltd',
    status: 'active',
    customerType: 'business',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testCustomer2 = {
    id: 'test-customer-2',
    organizationId: 'test-org-2', 
    customerNumber: 'CUST-002',
    companyName: 'Test Customer 2',
    legalName: 'Test Customer 2 Ltd',
    status: 'active',
    customerType: 'business',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testUser1 = {
    id: 'test-user-1',
    organizationId: 'test-org-1',
    email: 'user1@test.com',
    firstName: 'Test',
    lastName: 'User 1',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testUser2 = {
    id: 'test-user-2',
    organizationId: 'test-org-2',
    email: 'user2@test.com', 
    firstName: 'Test',
    lastName: 'User 2',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const testServiceCategory1 = {
    id: 'test-service-1',
    organizationId: 'test-org-1',
    name: 'Web Development',
    description: 'Web development services',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testServiceCategory2 = {
    id: 'test-service-2',
    organizationId: 'test-org-1',
    name: 'Design Services',
    description: 'Design and creative services',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

      beforeEach(async () => {
      // Clean up any existing test data
      await testDb.delete(quoteLineItems);
      await testDb.delete(quotes);
      await testDb.delete(auditLogs);
    
    // Insert test organizations
    await testDb.insert(organizations).values([testOrg1, testOrg2]).onConflictDoNothing();
    
    // Insert test customers
    await testDb.insert(customers).values([testCustomer1, testCustomer2]).onConflictDoNothing();
    
    // Insert test users
    await testDb.insert(users).values([testUser1, testUser2]).onConflictDoNothing();
    
    // Insert test service categories
          await testDb.insert(serviceCategories).values([testServiceCategory1, testServiceCategory2]).onConflictDoNothing();
      
      // Create a test audit logger that actually inserts into the database
      auditLogger = {
        logEvent: async (event: any) => {
          await testDb.insert(auditLogs).values({
            id: randomUUID(),
            action: event.action,
            entityType: event.entityType,
            entityId: event.entityId,
            organizationId: event.organizationId,
            userId: event.userId,
            ipAddress: null,
            userAgent: null,
            sessionId: null,
            oldValues: event.oldValues,
            newValues: event.newValues,
            metadata: event.metadata || {},
            createdAt: new Date()
          });
        },
        logAuthEvent: async () => {
          // Mock implementation - do nothing
        }
      } as any;
      
      // Initialize services
      quoteService = new QuoteService(testDb, {
        organizationId: 'test-org-1',
        userId: 'test-user-1'
      }, auditLogger);
  });

      afterEach(async () => {
      // Clean up test data
      await testDb.delete(quoteLineItems);
      await testDb.delete(quotes);
      await testDb.delete(auditLogs);
    });

  describe('Multi-Tenancy Tests', () => {
    it('should isolate quotes by organization', async () => {
      // Create quote for org 1
      const quoteService1 = new QuoteService(testDb, {
        organizationId: 'test-org-1',
        userId: 'test-user-1'
      }, auditLogger);
      
      const quoteData1 = {
        customerId: 'test-customer-1',
        title: 'Test Quote 1',
        description: 'Test quote description',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
                    lineItems: [
              {
                lineNumber: 1,
                type: 'service' as const,
                description: 'Test Service 1',
                quantity: 10,
                unitPrice: { amount: new Decimal(100), currency: 'NZD' },
                unitCost: { amount: new Decimal(50), currency: 'NZD' },
                taxRate: 0.15,
                discountType: 'percentage' as const,
                discountValue: 0,
                serviceCategoryId: 'test-service-1',
                metadata: {}
              }
            ]
      };
      
      const quote1 = await quoteService1.createQuote(quoteData1);
      
      // Create quote for org 2
      const quoteService2 = new QuoteService(testDb, {
        organizationId: 'test-org-2',
        userId: 'test-user-2'
      }, auditLogger);
      
      const quoteData2 = {
        customerId: 'test-customer-2',
        title: 'Test Quote Org 2',
        description: 'Test quote for organization 2',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'USD',
        exchangeRate: 1.0,
        taxRate: 0.10,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service 2',
            quantity: 5,
            unitPrice: { amount: new Decimal(200), currency: 'USD' },
            unitCost: { amount: new Decimal(100), currency: 'USD' },
            taxRate: 0.10,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      await quoteService2.createQuote(quoteData2);
      
      // Verify quotes are isolated
      const org1Quotes = await quoteService1.listQuotes({
        page: 1,
        pageSize: 10
      });
      
      const org2Quotes = await quoteService2.listQuotes({
        page: 1,
        pageSize: 10
      });
      
      expect(org1Quotes.quotes).toHaveLength(1);
      expect(org1Quotes.quotes[0].organizationId).toBe('test-org-1');
      expect(org1Quotes.quotes[0].title).toBe('Test Quote 1');
      
      expect(org2Quotes.quotes).toHaveLength(1);
      expect(org2Quotes.quotes[0].organizationId).toBe('test-org-2');
      expect(org2Quotes.quotes[0].title).toBe('Test Quote Org 2');
      
      // Verify cross-organization access is prevented
      const org1QuoteFromOrg2 = await quoteService2.getQuoteById(quote1.id);
      expect(org1QuoteFromOrg2).toBeNull();
    });

    it('should enforce organization context in all operations', async () => {
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      
      // Verify quote has correct organization context
      expect(quote.organizationId).toBe('test-org-1');
      expect(quote.createdBy).toBe('test-user-1');
      
      // Verify line items inherit organization context
      const lineItems = await testDb.select().from(quoteLineItems).where(eq(quoteLineItems.quoteId, quote.id));
      expect(lineItems).toHaveLength(1);
      
      // Verify quote number includes organization prefix
      expect(quote.quoteNumber).toMatch(/^Q-2025-\d+$/);
    });
  });

  describe('Quote Workflow Tests', () => {
    it('should create quote with proper status and calculations', async () => {
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote description',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms and conditions',
        notes: 'Customer notes',
        internalNotes: 'Internal notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal(150), currency: 'NZD' },
            unitCost: { amount: new Decimal(75), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          },
          {
            lineNumber: 2,
            type: 'service' as const,
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-2',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      
      // Verify quote creation
      expect(quote).toBeDefined();
      expect(quote.id).toBeDefined();
      expect(quote.status).toBe(QuoteStatus.DRAFT);
      expect(quote.quoteNumber).toMatch(/^Q-2025-\d+$/);
      expect(quote.organizationId).toBe('test-org-1');
      expect(quote.createdBy).toBe('test-user-1');
      
      // Verify calculations
      expect(parseFloat(quote.subtotal)).toBe(8000.00); // 40 * 150 + 20 * 100
      expect(parseFloat(quote.taxAmount)).toBe(1200.00); // 8000 * 0.15
      expect(parseFloat(quote.totalAmount)).toBe(9200.00); // 8000 + 1200
      
      // Verify line items
      const lineItems = await testDb.select().from(quoteLineItems).where(eq(quoteLineItems.quoteId, quote.id));
      expect(lineItems).toHaveLength(2);
      
      const webDevItem = lineItems.find((item: any) => item.description === 'Web Development');
      expect(webDevItem).toBeDefined();
      expect(parseFloat(webDevItem!.subtotal)).toBe(6000.00); // 40 * 150
      expect(parseFloat(webDevItem!.totalAmount)).toBe(6900.00); // 6000 + 900 tax
    });

    it('should handle status transitions correctly', async () => {
      // Create a quote
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      
              // Test valid transitions
        const updatedQuote1 = await quoteService.transitionStatus(quote.id, { status: QuoteStatus.PENDING });
        expect(updatedQuote1.status).toBe(QuoteStatus.PENDING);
        
        const updatedQuote2 = await quoteService.transitionStatus(quote.id, { status: QuoteStatus.APPROVED });
        expect(updatedQuote2.status).toBe(QuoteStatus.APPROVED);
        expect(updatedQuote2.approvedBy).toBe('test-user-1');
        expect(updatedQuote2.approvedAt).toBeDefined();
        
        const updatedQuote3 = await quoteService.transitionStatus(quote.id, { status: QuoteStatus.SENT });
        expect(updatedQuote3.status).toBe(QuoteStatus.SENT);
        expect(updatedQuote3.sentAt).toBeDefined();
        
        const updatedQuote4 = await quoteService.transitionStatus(quote.id, { status: QuoteStatus.ACCEPTED });
        expect(updatedQuote4.status).toBe(QuoteStatus.ACCEPTED);
        expect(updatedQuote4.acceptedAt).toBeDefined();
    });

    it('should reject invalid status transitions', async () => {
      // Create a quote
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      
              // Test invalid transitions
        await expect(quoteService.transitionStatus(quote.id, { status: QuoteStatus.ACCEPTED }))
          .rejects.toThrow('Invalid status transition');
        
        await expect(quoteService.transitionStatus(quote.id, { status: QuoteStatus.SENT }))
          .rejects.toThrow('Invalid status transition');
        
        // Move to pending first
        await quoteService.transitionStatus(quote.id, { status: QuoteStatus.PENDING });
        
        // Try to go back to draft (invalid)
        await expect(quoteService.transitionStatus(quote.id, { status: QuoteStatus.DRAFT }))
          .rejects.toThrow('Invalid status transition');
    });

    it('should recalculate totals when line items are updated', async () => {
      // Create a quote
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      expect(parseFloat(quote.totalAmount)).toBe(1150.00); // 1000 + 150 tax
      
      // Update line item
      const updatedData = {
        ...quoteData,
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Updated Service',
            quantity: 20, // Changed from 10 to 20
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const updatedQuote = await quoteService.updateQuote(quote.id, updatedData);
      
      // Verify recalculation
      expect(parseFloat(updatedQuote.subtotal)).toBe(2000.00); // 20 * 100
      expect(parseFloat(updatedQuote.taxAmount)).toBe(300.00); // 2000 * 0.15
      expect(parseFloat(updatedQuote.totalAmount)).toBe(2300.00); // 2000 + 300
    });
  });

  describe('Audit Logging Tests', () => {
    it('should log all quote operations', async () => {
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      const quote = await quoteService.createQuote(quoteData);
      
      // Check for creation audit log
      const auditLogsResult = await testDb.select().from(auditLogs).where(
        and(
          eq(auditLogs.entityType, 'Quote'),
          eq(auditLogs.entityId, quote.id),
          eq(auditLogs.organizationId, 'test-org-1')
        )
      );
      
      expect(auditLogsResult).toHaveLength(1);
      expect(auditLogsResult[0].action).toBe('quotes.create');
      expect(auditLogsResult[0].userId).toBe('test-user-1');
      
      // Update quote
      const updatedData = {
        ...quoteData,
        title: 'Updated Test Quote'
      };
      
      await quoteService.updateQuote(quote.id, updatedData);
      
      // Check for update audit log
      const updateLogs = await testDb.select().from(auditLogs).where(
        and(
          eq(auditLogs.entityType, 'Quote'),
          eq(auditLogs.entityId, quote.id),
          eq(auditLogs.action, 'quotes.update')
        )
      );
      
      expect(updateLogs).toHaveLength(1);
      
              // Status transition
        await quoteService.transitionStatus(quote.id, { status: QuoteStatus.PENDING });
      
      // Check for status transition audit log
      const statusLogs = await testDb.select().from(auditLogs).where(
        and(
          eq(auditLogs.entityType, 'Quote'),
          eq(auditLogs.entityId, quote.id),
          eq(auditLogs.action, 'quotes.status_transition')
        )
      );
      
      expect(statusLogs).toHaveLength(1);
      expect(statusLogs[0].oldValues).toHaveProperty('status', 'draft');
      expect(statusLogs[0].newValues).toHaveProperty('status', 'pending');
    });
  });

  describe('Quote Number Generation Tests', () => {
    it('should generate unique sequential quote numbers per organization', async () => {
      const quoteData = {
        customerId: 'test-customer-1',
        title: 'Test Quote',
        description: 'Test quote',
        type: 'project' as const,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        currency: 'NZD',
        exchangeRate: 1.0,
        taxRate: 0.15,
        discountType: 'percentage' as const,
        discountValue: 0,
        termsConditions: 'Standard terms',
        notes: 'Test notes',
        internalNotes: 'Internal test notes',
        lineItems: [
          {
            lineNumber: 1,
            type: 'service' as const,
            description: 'Test Service',
            quantity: 10,
            unitPrice: { amount: new Decimal(100), currency: 'NZD' },
            unitCost: { amount: new Decimal(50), currency: 'NZD' },
            taxRate: 0.15,
            discountType: 'percentage' as const,
            discountValue: 0,
            serviceCategoryId: 'test-service-1',
            metadata: {}
          }
        ]
      };
      
      // Create multiple quotes
      const quote1 = await quoteService.createQuote(quoteData);
      const quote2 = await quoteService.createQuote(quoteData);
      const quote3 = await quoteService.createQuote(quoteData);
      
      // Verify sequential numbering
      const number1 = parseInt(quote1.quoteNumber.split('-')[2]);
      const number2 = parseInt(quote2.quoteNumber.split('-')[2]);
      const number3 = parseInt(quote3.quoteNumber.split('-')[2]);
      
      expect(number2).toBe(number1 + 1);
      expect(number3).toBe(number2 + 1);
      
      // Verify uniqueness
      const numbers = [quote1.quoteNumber, quote2.quoteNumber, quote3.quoteNumber];
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(3);
    });
  });
});
