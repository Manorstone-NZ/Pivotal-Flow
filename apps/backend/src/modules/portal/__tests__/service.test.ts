import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { eq, and } from 'drizzle-orm';
import { PortalService } from '../service.js';
import { quotes, invoices } from '../../../lib/schema.js';
import type { PortalUserContext } from '../types.js';
import { testDb, createTestUser, createTestCustomer, createTestOrganization, cleanup } from '../../../__tests__/setup.js';

describe('PortalService', () => {
  let testOrgId: string;
  let testCustomerId: string;
  let testUserId: string;
  let portalUserContext: PortalUserContext;
  let mockFastify: any;

  beforeEach(async () => {
    // Create test organization
    testOrgId = await createTestOrganization('Portal Test Org');
    
    // Create test customer
    testCustomerId = await createTestCustomer(testOrgId, {
      companyName: 'Test Customer Company',
      customerNumber: 'CUST-001'
    });
    
    // Create external customer user
    testUserId = await createTestUser(testOrgId, {
      email: 'customer@testcustomer.com',
      userType: 'external_customer',
      customerId: testCustomerId
    });

    // Setup portal user context
    portalUserContext = {
      userId: testUserId,
      organizationId: testOrgId,
      customerId: testCustomerId,
      userType: 'external_customer',
      email: 'customer@testcustomer.com',
      firstName: 'Test',
      lastName: 'Customer'
    };

    // Mock Fastify instance
    mockFastify = {
      log: {
        error: vi.fn(),
        info: vi.fn()
      }
    };
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('Portal Access Validation', () => {
    it('should validate external customer access', async () => {
      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      // This should not throw as user is properly set up
      await expect(async () => {
        // Use a private method via reflection to test validation
        await (service as any).validatePortalAccess();
      }).not.toThrow();
    });

    it('should reject internal users', async () => {
      const internalUserContext = {
        ...portalUserContext,
        userType: 'internal' as const
      };
      
      const service = new PortalService(testDb, internalUserContext, mockFastify);
      
      await expect(async () => {
        await (service as any).validatePortalAccess();
      }).rejects.toThrow('Portal access is only available to external customer users');
    });

    it('should reject cross-customer access attempts', async () => {
      // Create another customer
      const otherCustomerId = await createTestCustomer(testOrgId, {
        companyName: 'Other Customer',
        customerNumber: 'CUST-002'
      });

      const maliciousContext = {
        ...portalUserContext,
        customerId: otherCustomerId // Different customer ID
      };
      
      const service = new PortalService(testDb, maliciousContext, mockFastify);
      
      await expect(async () => {
        await (service as any).validatePortalAccess();
      }).rejects.toThrow('User not found or not authorized for portal access');
    });
  });

  describe('Quote Access', () => {
    it('should return empty quotes list for customer with no quotes', async () => {
      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      const result = await service.getQuotes({});
      
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.page).toBe(1);
    });

    it('should enforce customer isolation for quotes', async () => {
      // Create quotes for different customers
      const otherCustomerId = await createTestCustomer(testOrgId, {
        companyName: 'Other Customer',
        customerNumber: 'CUST-002'
      });

      // Insert quotes directly to bypass service validation
      await testDb.insert(quotes).values([
        {
          id: 'quote-own',
          organizationId: testOrgId,
          customerId: testCustomerId,
          quoteNumber: 'Q-001',
          title: 'Own Quote',
          status: 'sent',
          type: 'project',
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          currency: 'NZD',
          subtotal: '1000.00',
          taxAmount: '150.00',
          discountAmount: '0.00',
          totalAmount: '1150.00',
          createdBy: testUserId
        },
        {
          id: 'quote-other',
          organizationId: testOrgId,
          customerId: otherCustomerId,
          quoteNumber: 'Q-002',
          title: 'Other Customer Quote',
          status: 'sent',
          type: 'project',
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          currency: 'NZD',
          subtotal: '2000.00',
          taxAmount: '300.00',
          discountAmount: '0.00',
          totalAmount: '2300.00',
          createdBy: testUserId
        }
      ]);

      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      const result = await service.getQuotes({});
      
      // Should only see own quote
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('quote-own');
      expect(result.data[0].title).toBe('Own Quote');
    });

    it('should prevent access to cross-customer quote details', async () => {
      const otherCustomerId = await createTestCustomer(testOrgId, {
        companyName: 'Other Customer',
        customerNumber: 'CUST-002'
      });

      // Insert quote for other customer
      await testDb.insert(quotes).values({
        id: 'quote-other',
        organizationId: testOrgId,
        customerId: otherCustomerId,
        quoteNumber: 'Q-002',
        title: 'Other Customer Quote',
        status: 'sent',
        type: 'project',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        currency: 'NZD',
        subtotal: '2000.00',
        taxAmount: '300.00',
        discountAmount: '0.00',
        totalAmount: '2300.00',
        createdBy: testUserId
      });

      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      await expect(async () => {
        await service.getQuoteDetail('quote-other');
      }).rejects.toThrow('Quote not found');
    });
  });

  describe('Invoice Access', () => {
    it('should return empty invoices list for customer with no invoices', async () => {
      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      const result = await service.getInvoices({});
      
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.page).toBe(1);
    });

    it('should enforce customer isolation for invoices', async () => {
      const otherCustomerId = await createTestCustomer(testOrgId, {
        companyName: 'Other Customer',
        customerNumber: 'CUST-002'
      });

      // Insert invoices for different customers
      await testDb.insert(invoices).values([
        {
          id: 'invoice-own',
          organizationId: testOrgId,
          customerId: testCustomerId,
          invoiceNumber: 'INV-001',
          title: 'Own Invoice',
          status: 'sent',
          currency: 'NZD',
          subtotal: '1000.00',
          taxAmount: '150.00',
          discountAmount: '0.00',
          totalAmount: '1150.00',
          paidAmount: '0.00',
          balanceAmount: '1150.00'
        },
        {
          id: 'invoice-other',
          organizationId: testOrgId,
          customerId: otherCustomerId,
          invoiceNumber: 'INV-002',
          title: 'Other Customer Invoice',
          status: 'sent',
          currency: 'NZD',
          subtotal: '2000.00',
          taxAmount: '300.00',
          discountAmount: '0.00',
          totalAmount: '2300.00',
          paidAmount: '0.00',
          balanceAmount: '2300.00'
        }
      ]);

      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      const result = await service.getInvoices({});
      
      // Should only see own invoice
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('invoice-own');
      expect(result.data[0].title).toBe('Own Invoice');
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      // Create multiple quotes for testing pagination
      const quoteData = Array.from({ length: 30 }, (_, i) => ({
        id: `quote-${i}`,
        organizationId: testOrgId,
        customerId: testCustomerId,
        quoteNumber: `Q-${String(i).padStart(3, '0')}`,
        title: `Quote ${i}`,
        status: 'sent',
        type: 'project',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        currency: 'NZD',
        subtotal: '1000.00',
        taxAmount: '150.00',
        discountAmount: '0.00',
        totalAmount: '1150.00',
        createdBy: testUserId
      }));

      await testDb.insert(quotes).values(quoteData);

      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      // Test first page
      const page1 = await service.getQuotes({ page: 1, limit: 10 });
      expect(page1.data).toHaveLength(10);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.total).toBe(30);
      expect(page1.pagination.totalPages).toBe(3);
      expect(page1.pagination.hasNext).toBe(true);
      expect(page1.pagination.hasPrev).toBe(false);

      // Test second page
      const page2 = await service.getQuotes({ page: 2, limit: 10 });
      expect(page2.data).toHaveLength(10);
      expect(page2.pagination.page).toBe(2);
      expect(page2.pagination.hasNext).toBe(true);
      expect(page2.pagination.hasPrev).toBe(true);

      // Test last page
      const page3 = await service.getQuotes({ page: 3, limit: 10 });
      expect(page3.data).toHaveLength(10);
      expect(page3.pagination.page).toBe(3);
      expect(page3.pagination.hasNext).toBe(false);
      expect(page3.pagination.hasPrev).toBe(true);
    });
  });

  describe('Time Entries', () => {
    it('should return empty time entries (not implemented yet)', async () => {
      const service = new PortalService(testDb, portalUserContext, mockFastify);
      
      const result = await service.getTimeEntries({});
      
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
