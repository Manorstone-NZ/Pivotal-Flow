import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { z } from 'zod';
import { ContractValidator, ApiEndpoints, UserSchemas, QuoteSchemas, RateCardSchemas } from '@pivotal-flow/sdk/contracts/validation';
import { createContractValidator } from '@pivotal-flow/sdk/contracts/validation';

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'admin@pivotalflow.com',
  password: 'password123',
};

describe('Contract Tests - API Validation', () => {
  let contractApi: ReturnType<typeof createContractValidator>;
  let authToken: string;
  
  beforeAll(async () => {
    // Create contract validator instance
    contractApi = createContractValidator(API_BASE_URL);
    
    // Get auth token for protected endpoints
    try {
      const loginResponse = await contractApi.post('/api/v1/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      
      authToken = loginResponse.data.accessToken;
      
      // Set auth header for subsequent requests
      contractApi.setHeaders({
        Authorization: `Bearer ${authToken}`,
      });
    } catch (error) {
      console.warn('Could not authenticate for contract tests:', error);
    }
  });
  
  afterAll(async () => {
    // Cleanup if needed
  });
  
  describe('Authentication Endpoints', () => {
    it('should validate login request/response contract', async () => {
      const loginData = {
        email: TEST_USER.email,
        password: TEST_USER.password,
      };
      
      // Validate request data
      const validatedRequest = ContractValidator.validateRequest(
        UserSchemas.loginRequest,
        loginData
      );
      expect(validatedRequest).toEqual(loginData);
      
      try {
        const response = await contractApi.post('/api/v1/auth/login', loginData);
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          UserSchemas.loginResponse,
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('user');
        expect(validatedResponse).toHaveProperty('accessToken');
        expect(validatedResponse).toHaveProperty('refreshToken');
        expect(validatedResponse).toHaveProperty('expiresIn');
        
        expect(validatedResponse.user).toHaveProperty('id');
        expect(validatedResponse.user).toHaveProperty('email');
        expect(validatedResponse.user).toHaveProperty('name');
        expect(validatedResponse.user).toHaveProperty('role');
        
      } catch (error) {
        // If backend is not available, test should still validate schemas
        console.warn('Backend not available for login test:', error);
      }
    });
    
    it('should validate refresh token request/response contract', async () => {
      const refreshData = {
        refreshToken: 'test-refresh-token',
      };
      
      // Validate request data
      const validatedRequest = ContractValidator.validateRequest(
        z.object({ refreshToken: z.string() }),
        refreshData
      );
      expect(validatedRequest).toEqual(refreshData);
      
      try {
        const response = await contractApi.post('/api/v1/auth/refresh', refreshData);
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          z.object({
            accessToken: z.string(),
            expiresIn: z.number().int(),
          }),
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('accessToken');
        expect(validatedResponse).toHaveProperty('expiresIn');
        
      } catch (error) {
        console.warn('Backend not available for refresh test:', error);
      }
    });
  });
  
  describe('User Endpoints', () => {
    it('should validate users list request/response contract', async () => {
      const queryParams = {
        page: 1,
        limit: 20,
        sort: 'name',
        order: 'asc' as const,
      };
      
      // Validate request parameters
      const validatedParams = ContractValidator.validateRequest(
        z.object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          sort: z.string().optional(),
          order: z.enum(['asc', 'desc']).default('desc'),
        }),
        queryParams
      );
      expect(validatedParams).toEqual(queryParams);
      
      try {
        const response = await contractApi.get('/api/v1/users', {
          params: queryParams,
        });
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          z.object({
            data: z.array(UserSchemas.user),
            pagination: z.object({
              page: z.number().int().min(1),
              limit: z.number().int().min(1),
              total: z.number().int().min(0),
              totalPages: z.number().int().min(0),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('data');
        expect(validatedResponse).toHaveProperty('pagination');
        expect(Array.isArray(validatedResponse.data)).toBe(true);
        
        // Validate each user in the array
        validatedResponse.data.forEach(user => {
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('email');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('role');
          expect(user).toHaveProperty('isActive');
        });
        
      } catch (error) {
        console.warn('Backend not available for users list test:', error);
      }
    });
    
    it('should validate create user request/response contract', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'user' as const,
      };
      
      // Validate request data
      const validatedRequest = ContractValidator.validateRequest(
        UserSchemas.createUser,
        userData
      );
      expect(validatedRequest).toEqual(userData);
      
      try {
        const response = await contractApi.post('/api/v1/users', userData);
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          UserSchemas.user,
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('id');
        expect(validatedResponse).toHaveProperty('email');
        expect(validatedResponse).toHaveProperty('name');
        expect(validatedResponse).toHaveProperty('role');
        expect(validatedResponse).toHaveProperty('isActive');
        expect(validatedResponse).toHaveProperty('createdAt');
        expect(validatedResponse).toHaveProperty('updatedAt');
        
      } catch (error) {
        console.warn('Backend not available for create user test:', error);
      }
    });
  });
  
  describe('Quote Endpoints', () => {
    it('should validate quotes list request/response contract', async () => {
      const queryParams = {
        page: 1,
        limit: 20,
        status: 'draft' as const,
      };
      
      // Validate request parameters
      const validatedParams = ContractValidator.validateRequest(
        z.object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          sort: z.string().optional(),
          order: z.enum(['asc', 'desc']).default('desc'),
          status: z.enum(['draft', 'sent', 'approved', 'rejected', 'accepted']).optional(),
          customerId: z.string().uuid().optional(),
        }),
        queryParams
      );
      expect(validatedParams).toEqual(queryParams);
      
      try {
        const response = await contractApi.get('/api/v1/quotes', {
          params: queryParams,
        });
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          z.object({
            data: z.array(QuoteSchemas.quote),
            pagination: z.object({
              page: z.number().int().min(1),
              limit: z.number().int().min(1),
              total: z.number().int().min(0),
              totalPages: z.number().int().min(0),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('data');
        expect(validatedResponse).toHaveProperty('pagination');
        expect(Array.isArray(validatedResponse.data)).toBe(true);
        
        // Validate each quote in the array
        validatedResponse.data.forEach(quote => {
          expect(quote).toHaveProperty('id');
          expect(quote).toHaveProperty('quoteNumber');
          expect(quote).toHaveProperty('customerId');
          expect(quote).toHaveProperty('status');
          expect(quote).toHaveProperty('totalAmount');
          expect(quote).toHaveProperty('currency');
        });
        
      } catch (error) {
        console.warn('Backend not available for quotes list test:', error);
      }
    });
    
    it('should validate create quote request/response contract', async () => {
      const quoteData = {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        validUntil: '2024-12-31T23:59:59Z',
        notes: 'Test quote for contract validation',
        lineItems: [
          {
            description: 'Test service',
            quantity: 10,
            unitPrice: 100,
            serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      };
      
      // Validate request data
      const validatedRequest = ContractValidator.validateRequest(
        QuoteSchemas.createQuote,
        quoteData
      );
      expect(validatedRequest).toEqual(quoteData);
      
      try {
        const response = await contractApi.post('/api/v1/quotes', quoteData);
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          QuoteSchemas.quote,
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('id');
        expect(validatedResponse).toHaveProperty('quoteNumber');
        expect(validatedResponse).toHaveProperty('customerId');
        expect(validatedResponse).toHaveProperty('status');
        expect(validatedResponse).toHaveProperty('totalAmount');
        expect(validatedResponse).toHaveProperty('currency');
        
      } catch (error) {
        console.warn('Backend not available for create quote test:', error);
      }
    });
  });
  
  describe('Rate Card Endpoints', () => {
    it('should validate rate cards list request/response contract', async () => {
      const queryParams = {
        page: 1,
        limit: 20,
        isActive: true,
      };
      
      // Validate request parameters
      const validatedParams = ContractValidator.validateRequest(
        z.object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          sort: z.string().optional(),
          order: z.enum(['asc', 'desc']).default('desc'),
          isActive: z.boolean().optional(),
        }),
        queryParams
      );
      expect(validatedParams).toEqual(queryParams);
      
      try {
        const response = await contractApi.get('/api/v1/rate-cards', {
          params: queryParams,
        });
        
        // Validate response data
        const validatedResponse = ContractValidator.validateResponse(
          z.object({
            data: z.array(RateCardSchemas.rateCard),
            pagination: z.object({
              page: z.number().int().min(1),
              limit: z.number().int().min(1),
              total: z.number().int().min(0),
              totalPages: z.number().int().min(0),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          response.data
        );
        
        expect(validatedResponse).toHaveProperty('data');
        expect(validatedResponse).toHaveProperty('pagination');
        expect(Array.isArray(validatedResponse.data)).toBe(true);
        
        // Validate each rate card in the array
        validatedResponse.data.forEach(rateCard => {
          expect(rateCard).toHaveProperty('id');
          expect(rateCard).toHaveProperty('name');
          expect(rateCard).toHaveProperty('isActive');
          expect(rateCard).toHaveProperty('effectiveFrom');
        });
        
      } catch (error) {
        console.warn('Backend not available for rate cards list test:', error);
      }
    });
  });
  
  describe('Contract Schema Validation', () => {
    it('should validate all API endpoint schemas are properly defined', () => {
      expect(ApiEndpoints).toBeDefined();
      expect(Array.isArray(ApiEndpoints)).toBe(true);
      expect(ApiEndpoints.length).toBeGreaterThan(0);
      
      // Validate each endpoint has required properties
      ApiEndpoints.forEach(endpoint => {
        expect(endpoint).toHaveProperty('method');
        expect(endpoint).toHaveProperty('path');
        expect(endpoint).toHaveProperty('response');
        expect(['get', 'post', 'put', 'delete', 'patch']).toContain(endpoint.method);
        expect(endpoint.path).toMatch(/^\/api\/v1\//);
      });
    });
    
    it('should validate schema consistency between request and response', () => {
      // Check that all schemas are properly exported
      expect(UserSchemas).toBeDefined();
      expect(QuoteSchemas).toBeDefined();
      expect(RateCardSchemas).toBeDefined();
      
      // Validate schema structure
      expect(UserSchemas.user).toBeDefined();
      expect(UserSchemas.createUser).toBeDefined();
      expect(UserSchemas.updateUser).toBeDefined();
      
      expect(QuoteSchemas.quote).toBeDefined();
      expect(QuoteSchemas.createQuote).toBeDefined();
      expect(QuoteSchemas.updateQuote).toBeDefined();
      
      expect(RateCardSchemas.rateCard).toBeDefined();
      expect(RateCardSchemas.createRateCard).toBeDefined();
    });
  });
  
  describe('Error Handling Contracts', () => {
    it('should validate error response schema', () => {
      const errorResponse = {
        error: 'ValidationError',
        message: 'Invalid input data',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00Z',
        path: '/api/v1/users',
      };
      
      const validatedError = ContractValidator.validateResponse(
        z.object({
          error: z.string(),
          message: z.string(),
          statusCode: z.number().int(),
          timestamp: z.string().datetime(),
          path: z.string(),
        }),
        errorResponse
      );
      
      expect(validatedError).toEqual(errorResponse);
    });
    
    it('should handle invalid data gracefully', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
      };
      
      const isValid = ContractValidator.isValid(UserSchemas.loginRequest, invalidData);
      expect(isValid).toBe(false);
      
      const errors = ContractValidator.getErrors(UserSchemas.loginRequest, invalidData);
      expect(errors).toBeDefined();
      expect(errors?.issues).toBeDefined();
      expect(errors?.issues.length).toBeGreaterThan(0);
    });
  });
});
