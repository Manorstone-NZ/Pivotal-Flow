import { describe, it, expect, beforeEach } from 'vitest';
import { app, testUtils } from './setup.js';

describe('API Functionality Tests', () => {
  
  describe('Health & Infrastructure', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toMatchObject({
        status: 'ok',
        message: 'Server is healthy',
        version: expect.any(String)
      });
    });
    
    it('should return API information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/'
      });
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        message: 'Pivotal Flow API',
        version: expect.any(String),
        status: 'running',
        endpoints: expect.any(Object)
      });
    });
    
    it('should return metrics endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      });
      
      expect(response.statusCode).toBe(200);
      expect(response.payload).toContain('http_requests_total');
    });
  });
  
  describe('Authentication', () => {
    it('should allow access to public routes without authentication', async () => {
      const publicRoutes = ['/health', '/', '/metrics', '/docs'];
      
      for (const route of publicRoutes) {
        const response = await app.inject({
          method: 'GET',
          url: route
        });
        
        expect(response.statusCode).not.toBe(401);
      }
    });
    
    it('should require authentication for protected routes', async () => {
      const protectedRoutes = ['/v1/quotes', '/v1/users', '/v1/auth/me'];
      
      for (const route of protectedRoutes) {
        const response = await app.inject({
          method: 'GET',
          url: route
        });
        
        expect(response.statusCode).toBe(401);
      }
    });
    
    it('should accept valid JWT tokens', async () => {
      // First authenticate to get a valid token
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'admin@test.example.com',
          password: 'AdminPassword123!'
        }
      });
      
      expect(loginResponse.statusCode).toBe(200);
      const authData = JSON.parse(loginResponse.payload);
      const token = authData.accessToken;
      
      // Test the token with a protected endpoint
      const response = await app.inject({
        method: 'GET',
        url: '/v1/users',
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      
      expect(response.statusCode).toBe(200);
    });
    
    it('should reject invalid JWT tokens', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('User Management', () => {
    it('should create users', async () => {
      // First authenticate to get a token
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'admin@test.example.com',
          password: 'AdminPassword123!'
        }
      });
      
      const authData = JSON.parse(loginResponse.payload);
      const token = authData.accessToken;
      
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User'
      };
      
      const response = await app.inject({
        method: 'POST',
        url: '/v1/users',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: userData
      });
      
      expect(response.statusCode).toBe(201);
      const createdUser = JSON.parse(response.payload);
      expect(createdUser).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName
      });
    });
    
    it('should list users', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id, user.organizationId);
      
      const response = await app.inject({
        method: 'GET',
        url: '/v1/users',
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      
      expect(response.statusCode).toBe(200);
      const users = JSON.parse(response.payload);
      expect(Array.isArray(users)).toBe(true);
    });
    
    it('should get user by ID', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id, user.organizationId);
      
      const response = await app.inject({
        method: 'GET',
        url: `/v1/users/${user.id}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      
      expect(response.statusCode).toBe(200);
      const retrievedUser = JSON.parse(response.payload);
      expect(retrievedUser.id).toBe(user.id);
    });
  });
  
  describe('Quote Management', () => {
    let testUser: any;
    let testCustomer: any;
    let authToken: string;
    
    beforeEach(async () => {
      const org = await testUtils.createTestOrganization();
      testUser = await testUtils.createTestUser({ organizationId: org.id });
      testCustomer = await testUtils.createTestCustomer(org.id);
      authToken = testUtils.generateTestToken(testUser.id, org.id);
    });
    
    it('should create quotes', async () => {
      const quoteData = {
        customerId: testCustomer.id,
        title: 'Test Quote',
        description: 'Test quote description',
        type: 'project',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'NZD',
        lineItems: [
          {
            lineNumber: 1,
            description: 'Test service',
            quantity: 10,
            unitPrice: { amount: 100, currency: 'NZD' },
            type: 'service'
          }
        ]
      };
      
      const response = await app.inject({
        method: 'POST',
        url: '/v1/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: quoteData
      });
      
      expect(response.statusCode).toBe(201);
      const createdQuote = JSON.parse(response.payload);
      expect(createdQuote).toMatchObject({
        title: quoteData.title,
        customerId: quoteData.customerId,
        status: 'draft'
      });
    });
    
    it('should list quotes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });
      
      expect(response.statusCode).toBe(200);
      const quotes = JSON.parse(response.payload);
      expect(Array.isArray(quotes)).toBe(true);
    });
    
    it('should get quote by ID', async () => {
      // First create a quote
      const quoteData = {
        customerId: testCustomer.id,
        title: 'Test Quote',
        description: 'Test quote description',
        type: 'project',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'NZD',
        lineItems: [
          {
            lineNumber: 1,
            description: 'Test service',
            quantity: 10,
            unitPrice: { amount: 100, currency: 'NZD' },
            type: 'service'
          }
        ]
      };
      
      const createResponse = await app.inject({
        method: 'POST',
        url: '/v1/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: quoteData
      });
      
      const createdQuote = JSON.parse(createResponse.payload);
      
      // Then get the quote by ID
      const response = await app.inject({
        method: 'GET',
        url: `/v1/quotes/${createdQuote.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });
      
      expect(response.statusCode).toBe(200);
      const retrievedQuote = JSON.parse(response.payload);
      expect(retrievedQuote.id).toBe(createdQuote.id);
    });
    
    it('should update quotes', async () => {
      // First create a quote
      const quoteData = {
        customerId: testCustomer.id,
        title: 'Test Quote',
        description: 'Test quote description',
        type: 'project',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'NZD',
        lineItems: [
          {
            lineNumber: 1,
            description: 'Test service',
            quantity: 10,
            unitPrice: { amount: 100, currency: 'NZD' },
            type: 'service'
          }
        ]
      };
      
      const createResponse = await app.inject({
        method: 'POST',
        url: '/v1/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: quoteData
      });
      
      const createdQuote = JSON.parse(createResponse.payload);
      
      // Then update the quote
      const updateData = {
        title: 'Updated Test Quote',
        description: 'Updated description'
      };
      
      const response = await app.inject({
        method: 'PATCH',
        url: `/v1/quotes/${createdQuote.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: updateData
      });
      
      expect(response.statusCode).toBe(200);
      const updatedQuote = JSON.parse(response.payload);
      expect(updatedQuote.title).toBe(updateData.title);
    });
    
    it('should transition quote status', async () => {
      // First create a quote
      const quoteData = {
        customerId: testCustomer.id,
        title: 'Test Quote',
        description: 'Test quote description',
        type: 'project',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'NZD',
        lineItems: [
          {
            lineNumber: 1,
            description: 'Test service',
            quantity: 10,
            unitPrice: { amount: 100, currency: 'NZD' },
            type: 'service'
          }
        ]
      };
      
      const createResponse = await app.inject({
        method: 'POST',
        url: '/v1/quotes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: quoteData
      });
      
      const createdQuote = JSON.parse(createResponse.payload);
      
      // Then transition status
      const statusData = {
        status: 'pending'
      };
      
      const response = await app.inject({
        method: 'POST',
        url: `/v1/quotes/${createdQuote.id}/status`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: statusData
      });
      
      expect(response.statusCode).toBe(200);
      const updatedQuote = JSON.parse(response.payload);
      expect(updatedQuote.status).toBe(statusData.status);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        displayName: ''
      };
      
      const response = await app.inject({
        method: 'POST',
        url: '/v1/users',
        payload: invalidData
      });
      
      expect(response.statusCode).toBe(400);
      const error = JSON.parse(response.payload);
      expect(error.error).toBe('Bad Request');
    });
    
    it('should handle not found errors', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id, user.organizationId);
      
      const response = await app.inject({
        method: 'GET',
        url: '/v1/quotes/non-existent-id',
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      
      expect(response.statusCode).toBe(404);
    });
    
    it('should handle unauthorized access', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/users',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoints', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Make multiple requests to trigger rate limiting
      const responses = await Promise.all(
        Array(15).fill(0).map(() => 
          app.inject({
            method: 'POST',
            url: '/v1/auth/login',
            payload: loginData
          })
        )
      );
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.statusCode === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
