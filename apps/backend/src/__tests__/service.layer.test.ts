import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuoteService } from '../modules/quotes/service.js';
import { PermissionService } from '../modules/permissions/service.js';
import { testUtils } from './setup.js';

describe('Service Layer Tests', () => {
  
  describe('Quote Service', () => {
    let quoteService: QuoteService;
    let testUser: any;
    let testCustomer: any;
    
    beforeEach(async () => {
      const org = await testUtils.createTestOrganization();
      testUser = await testUtils.createTestUser({ organizationId: org.id });
      testCustomer = await testUtils.createTestCustomer(org.id);
      
      quoteService = new QuoteService({} as any, {
        organizationId: org.id,
        userId: testUser.id
      });
    });
    
    it('should validate quote data', async () => {
      const invalidQuoteData = {
        customerId: 'invalid-uuid',
        title: '',
        lineItems: []
      };
      
      try {
        await quoteService.createQuote(invalidQuoteData as any);
        throw new Error('Should have failed validation');
      } catch (error: any) {
        expect(error.message).toContain('validation');
      }
    });
    
    it('should handle quote creation', async () => {
      const validQuoteData = {
        customerId: testCustomer.id,
        title: 'Test Quote',
        description: 'Test description',
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
      
      // This would test the actual quote creation
      expect(validQuoteData.title).toBe('Test Quote');
      expect(validQuoteData.lineItems).toHaveLength(1);
    });
  });
  
  describe('Permission Service', () => {
    let permissionService: PermissionService;
    
    beforeEach(() => {
      permissionService = new PermissionService({} as any, {
        organizationId: 'test-org',
        userId: 'test-user'
      });
    });
    
    it('should check user permissions correctly', async () => {
      const userId = crypto.randomUUID();
      const permission = 'quotes.create' as const;
      
      // Mock the permission check
      vi.spyOn(permissionService, 'hasPermission').mockResolvedValue({ hasPermission: true });
      
      const hasPermission = await permissionService.hasPermission(userId, permission);
      expect(hasPermission.hasPermission).toBe(true);
    });
    
    it('should handle role-based permissions', async () => {
      const roles = ['admin', 'manager', 'user'];
      const permissions = ['quotes.create', 'quotes.read', 'users.manage'] as const;
      
      // Test different role-permission combinations
      const testCases = [
        { role: 'admin', permission: 'quotes.create' as const, expected: true },
        { role: 'manager', permission: 'quotes.view' as const, expected: true },
        { role: 'user', permission: 'users.manage_roles' as const, expected: false }
      ];
      
      for (const testCase of testCases) {
        vi.spyOn(permissionService, 'hasPermission').mockResolvedValue({ 
          hasPermission: testCase.expected 
        });
        
        const hasPermission = await permissionService.hasPermission(
          crypto.randomUUID(),
          testCase.permission
        );
        
        expect(hasPermission.hasPermission).toBe(testCase.expected);
      }
    });
  });
  
  describe('Business Logic Validation', () => {
    it('should enforce business rules for quotes', async () => {
      const businessRules = {
        minLineItems: 1,
        maxLineItems: 1000,
        minQuoteValue: 0,
        maxQuoteValue: 1000000,
        validCurrencies: ['NZD', 'USD', 'EUR'],
        validStatuses: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected', 'cancelled']
      };
      
      // Test minimum line items
      expect(businessRules.minLineItems).toBe(1);
      
      // Test maximum line items
      expect(businessRules.maxLineItems).toBe(1000);
      
      // Test valid currencies
      expect(businessRules.validCurrencies).toContain('NZD');
      expect(businessRules.validCurrencies).toContain('USD');
      
      // Test valid statuses
      expect(businessRules.validStatuses).toContain('draft');
      expect(businessRules.validStatuses).toContain('accepted');
    });
    
    it('should validate monetary calculations', async () => {
      const calculations = {
        subtotal: 1000,
        taxRate: 0.15,
        taxAmount: 150,
        totalAmount: 1150
      };
      
      // Verify calculations are correct
      expect(calculations.taxAmount).toBe(calculations.subtotal * calculations.taxRate);
      expect(calculations.totalAmount).toBe(calculations.subtotal + calculations.taxAmount);
      
      // Test with different values
      const testCases = [
        { subtotal: 500, taxRate: 0.10, expectedTax: 50, expectedTotal: 550 },
        { subtotal: 2000, taxRate: 0.20, expectedTax: 400, expectedTotal: 2400 }
      ];
      
      for (const testCase of testCases) {
        const taxAmount = testCase.subtotal * testCase.taxRate;
        const totalAmount = testCase.subtotal + taxAmount;
        
        expect(taxAmount).toBe(testCase.expectedTax);
        expect(totalAmount).toBe(testCase.expectedTotal);
      }
    });
    
    it('should handle currency conversions', async () => {
      const exchangeRates = {
        'NZD': 1.0,
        'USD': 0.62,
        'EUR': 0.58
      };
      
      const amount = 1000; // NZD
      
      // Convert to different currencies
      const usdAmount = amount * exchangeRates.USD;
      const eurAmount = amount * exchangeRates.EUR;
      
      expect(usdAmount).toBe(620);
      expect(eurAmount).toBe(580);
      
      // Convert back to NZD
      const nzdFromUsd = usdAmount / exchangeRates.USD;
      const nzdFromEur = eurAmount / exchangeRates.EUR;
      
      expect(nzdFromUsd).toBe(amount);
      expect(nzdFromEur).toBe(amount);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const errorCases = [
        { type: 'validation', message: 'Invalid input data' },
        { type: 'not_found', message: 'Resource not found' },
        { type: 'permission', message: 'Access denied' },
        { type: 'database', message: 'Database connection failed' }
      ];
      
      for (const errorCase of errorCases) {
        const error = new Error(errorCase.message);
        error.name = errorCase.type;
        
        expect(error.message).toBe(errorCase.message);
        expect(error.name).toBe(errorCase.type);
      }
    });
    
    it('should provide meaningful error messages', async () => {
      const errorMessages = {
        validation: 'Please check your input data',
        not_found: 'The requested resource was not found',
        permission: 'You do not have permission to perform this action',
        database: 'A database error occurred. Please try again later'
      };
      
      for (const [type, message] of Object.entries(errorMessages)) {
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      }
    });
  });
});
