import type { FastifyInstance } from 'fastify';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { testDb, testUtils } from '../../../__tests__/setup.js';
import { build } from '../../../app.js';
import { quotes, invoices } from '../../../lib/schema.js';

describe('Portal Routes', () => {
  let app: FastifyInstance;
  let testOrgId: string;
  let testCustomerId: string;
  let externalUserId: string;
  let internalUserId: string;
  let authToken: string;
  let internalAuthToken: string;

  beforeEach(async () => {
    app = await build({ logger: false });
    await app.ready();

    // Create test organization
    testOrgId = await testUtils.createTestOrganization({ name: 'Portal Routes Test Org' });
    
    // Create test customer
    testCustomerId = await testUtils.createTestCustomer(testOrgId, {
      companyName: 'Test Customer Company',
      customerNumber: 'CUST-001'
    });
    
    // Create external customer user
    externalUserId = await testUtils.createTestUser({
      email: 'customer@testcustomer.com',
      userType: 'external_customer',
      customerId: testCustomerId,
      organizationId: testOrgId
    });

    // Create internal user
    internalUserId = await testUtils.createTestUser({
      email: 'internal@company.com',
      userType: 'internal',
      organizationId: testOrgId
    });

    // Mock JWT tokens (in real implementation, these would be proper JWTs)
    authToken = 'valid-external-token';
    internalAuthToken = 'valid-internal-token';

    // Mock authentication middleware to bypass actual JWT validation
    app.addHook('preHandler', async (request) => {
      if (request.headers.authorization === `Bearer ${authToken}`) {
        (request as any).user = {
          userId: externalUserId,
          organizationId: testOrgId,
          customerId: testCustomerId,
          userType: 'external_customer',
          email: 'customer@testcustomer.com',
          firstName: 'Test',
          lastName: 'Customer'
        };
      } else if (request.headers.authorization === `Bearer ${internalAuthToken}`) {
        (request as any).user = {
          userId: internalUserId,
          organizationId: testOrgId,
          userType: 'internal',
          email: 'internal@company.com',
          firstName: 'Internal',
          lastName: 'User'
        };
      }
    });
  });

  afterEach(async () => {
    await app.close();
    await testUtils.cleanupTestData();
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes'
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    });

    it('should reject internal users from portal endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes',
        headers: {
          authorization: `Bearer ${internalAuthToken}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: 'Forbidden',
        message: 'Portal access is only available to external customer users'
      });
    });

    it('should accept external customer users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('data');
      expect(response.json()).toHaveProperty('pagination');
    });
  });

  describe('Rate Limiting', () => {
    it('should set rate limit headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
      expect(response.headers).toHaveProperty('x-ratelimit-window');
    });

    it('should enforce rate limits', async () => {
      // Make many requests quickly to trigger rate limit
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: 'GET',
          url: '/v1/portal/health',
          headers: {
            authorization: `Bearer ${authToken}`
          }
        })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed since 10 < 200 RPM limit
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });

      // Check rate limit headers are decreasing
      const remaining1 = parseInt(responses[0]?.headers['x-ratelimit-remaining'] as string);
      const remaining2 = parseInt(responses[9]?.headers['x-ratelimit-remaining'] as string);
      expect(remaining2).toBeLessThan(remaining1);
    });
  });

  describe('Quote Endpoints', () => {
    beforeEach(async () => {
      // Insert test quotes
      await testDb.insert(quotes).values([
        {
          id: 'quote-1',
          organizationId: testOrgId,
          customerId: testCustomerId,
          quoteNumber: 'Q-001',
          title: 'Test Quote 1',
          status: 'sent',
          type: 'project',
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          currency: 'NZD',
          subtotal: '1000.00',
          taxAmount: '150.00',
          discountAmount: '0.00',
          totalAmount: '1150.00',
          createdBy: externalUserId
        },
        {
          id: 'quote-2',
          organizationId: testOrgId,
          customerId: testCustomerId,
          quoteNumber: 'Q-002',
          title: 'Test Quote 2',
          status: 'draft',
          type: 'project',
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          currency: 'NZD',
          subtotal: '2000.00',
          taxAmount: '300.00',
          discountAmount: '0.00',
          totalAmount: '2300.00',
          createdBy: externalUserId
        }
      ]);
    });

    it('should list customer quotes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('quoteNumber');
      expect(data.data[0]).toHaveProperty('title');
      expect(data.data[0]).toHaveProperty('status');
      expect(data.data[0]).not.toHaveProperty('createdBy'); // Internal field should not be exposed
    });

    it('should filter quotes by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes?status=sent',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe('sent');
    });

    it('should get quote detail', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes/quote-1',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.id).toBe('quote-1');
      expect(data.title).toBe('Test Quote 1');
      expect(data).toHaveProperty('lineItems');
      expect(Array.isArray(data.lineItems)).toBe(true);
    });

    it('should return 404 for non-existent quote', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes/non-existent',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        error: 'Not Found',
        message: 'Quote not found'
      });
    });

    it('should handle pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes?page=1&limit=1',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.data).toHaveLength(1);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(1);
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.hasNext).toBe(true);
    });
  });

  describe('Invoice Endpoints', () => {
    beforeEach(async () => {
      // Insert test invoices
      await testDb.insert(invoices).values([
        {
          id: 'invoice-1',
          organizationId: testOrgId,
          customerId: testCustomerId,
          invoiceNumber: 'INV-001',
          title: 'Test Invoice 1',
          status: 'sent',
          currency: 'NZD',
          subtotal: '1000.00',
          taxAmount: '150.00',
          discountAmount: '0.00',
          totalAmount: '1150.00',
          paidAmount: '0.00',
          balanceAmount: '1150.00'
        }
      ]);
    });

    it('should list customer invoices', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/invoices',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe('invoice-1');
      expect(data.data[0].title).toBe('Test Invoice 1');
    });

    it('should get invoice detail', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/invoices/invoice-1',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.id).toBe('invoice-1');
      expect(data.title).toBe('Test Invoice 1');
      expect(data).toHaveProperty('lineItems');
    });
  });

  describe('Time Entry Endpoints', () => {
    it('should list time entries (empty for now)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/time',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('should return portal health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/health',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data.status).toBe('healthy');
      expect(data.user.userId).toBe(externalUserId);
      expect(data.user.customerId).toBe(testCustomerId);
      expect(data.user.organizationId).toBe(testOrgId);
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('Performance', () => {
    it('should respond within 250ms for quote list', async () => {
      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'GET',
        url: '/v1/portal/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      const duration = Date.now() - startTime;
      
      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(250);
      expect(response.headers).toHaveProperty('x-response-time');
    });
  });
});
