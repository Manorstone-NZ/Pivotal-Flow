import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { testDb, testUtils } from '../../../__tests__/setup.js';
import { RateCardService } from '../service.js';

describe('RateCardService Integration Tests', () => {
  let rateCardService: RateCardService;
  let auditLogger: any; // Using any type since AuditLogger is not available
  let testOrg: any;
  let testUser: any;
  let testServiceCategory: any;
  let testRateCard: any;

  beforeEach(async () => {
    // Create test data
    testOrg = await testUtils.createTestOrganization();
    testUser = await testUtils.createTestUser({ organizationId: testOrg.id });
    testServiceCategory = {
      id: crypto.randomUUID(),
      organizationId: testOrg.id,
      name: 'Web Development',
      description: 'Web development services',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert service category
          await testDb.execute(`
        INSERT INTO service_categories (id, organization_id, name, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [testServiceCategory.id, testServiceCategory.organizationId, testServiceCategory.name, testServiceCategory.description, testServiceCategory.isActive, testServiceCategory.createdAt.toISOString(), testServiceCategory.updatedAt.toISOString()]);

    // Create rate card
    testRateCard = {
      id: crypto.randomUUID(),
      organizationId: testOrg.id,
      name: 'Standard Rates 2025',
      description: 'Standard rates for 2025',
      currency: 'NZD',
      effectiveFrom: new Date('2025-01-01'),
      effectiveUntil: null,
      isDefault: true,
      isActive: true,
      createdBy: testUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await testDb.execute(`
      INSERT INTO rate_cards (id, organization_id, name, description, currency, effective_from, effective_until, is_default, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [testRateCard.id, testRateCard.organizationId, testRateCard.name, testRateCard.description, testRateCard.currency, testRateCard.effectiveFrom.toISOString().split('T')[0], testRateCard.effectiveUntil?.toISOString().split('T')[0] || null, testRateCard.isDefault, testRateCard.isActive, testRateCard.createdAt.toISOString(), testRateCard.updatedAt.toISOString()]);

    // Create audit logger
    auditLogger = {} as any; // Mock audit logger since it's not available

    // Create rate card service with real database
    rateCardService = new RateCardService(testDb, {
      organizationId: testOrg.id,
      userId: testUser.id
    }, auditLogger);
  });

  afterEach(async () => {
    // Clean up test data
    await testDb.execute(`DELETE FROM rate_card_items WHERE rate_card_id = $1`, [testRateCard.id]);
    await testDb.execute(`DELETE FROM rate_cards WHERE id = $1`, [testRateCard.id]);
    await testDb.execute(`DELETE FROM service_categories WHERE id = $1`, [testServiceCategory.id]);
    await testDb.execute(`DELETE FROM users WHERE id = $1`, [testUser.id]);
    await testDb.execute(`DELETE FROM organizations WHERE id = $1`, [testOrg.id]);
  });

  describe('resolvePricing', () => {
    it('should resolve pricing with explicit unit price when user has override permission', async () => {
      // Create rate card item
      const rateCardItem = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await testDb.execute(`
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [rateCardItem.id, rateCardItem.rateCardId, rateCardItem.serviceCategoryId, rateCardItem.itemCode, rateCardItem.unit, rateCardItem.baseRate, rateCardItem.currency, rateCardItem.taxClass, new Date('2025-01-01').toISOString().split('T')[0], rateCardItem.isActive, rateCardItem.createdAt.toISOString(), rateCardItem.updatedAt.toISOString()]);

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          unitPrice: { amount: 200, currency: 'NZD' },
          itemCode: 'DEV-HOURLY',
          unit: 'hour',
          quantity: 10,
          serviceCategoryId: testServiceCategory.id
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, true);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(Number(result.results?.[0]?.unitPrice)).toBe(200);
      expect(result.results?.[0]?.itemCode).toBe('DEV-HOURLY');
    });

    it('should resolve pricing using rate card when no explicit price provided', async () => {
      // Create rate card item
      const rateCardItem = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await testDb.execute(`
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [rateCardItem.id, rateCardItem.rateCardId, rateCardItem.serviceCategoryId, rateCardItem.itemCode, rateCardItem.unit, rateCardItem.baseRate, rateCardItem.currency, rateCardItem.taxClass, new Date('2025-01-01').toISOString().split('T')[0], rateCardItem.isActive, rateCardItem.createdAt.toISOString(), rateCardItem.updatedAt.toISOString()]);

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          unitPrice: { amount: 200, currency: 'NZD' },
          itemCode: 'DEV-HOURLY',
          unit: 'hour',
          quantity: 10,
          serviceCategoryId: testServiceCategory.id
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(Number(result.results?.[0]?.unitPrice)).toBe(150);
      expect(result.results?.[0]?.itemCode).toBe('DEV-HOURLY');
    });

    it('should handle missing rate card items gracefully', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Unknown service',
          itemCode: 'UNKNOWN-CODE',
          unit: 'hour',
          quantity: 10,
          serviceCategoryId: testServiceCategory.id
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        lineNumber: 1,
        description: 'Unknown service',
        reason: 'No matching rate found for item code or description'
      });
    });
  });

  describe('getActiveRateCard', () => {
    it('should return the default active rate card', async () => {
      const result = await rateCardService.getActiveRateCard();

      expect(result).toBeDefined();
      expect(result?.id).toBe(testRateCard.id);
      expect(result?.name).toBe('Standard Rates 2025');
      expect(result?.isDefault).toBe(true);
    });

    it('should return null when no active rate card exists', async () => {
      // Deactivate the rate card
      await testDb.execute(`
        UPDATE rate_cards SET is_active = false WHERE id = $1
      `, [testRateCard.id]);

      const result = await rateCardService.getActiveRateCard();

      expect(result).toBeNull();
    });
  });

  describe('getRateCardItems', () => {
    it('should return all active rate card items', async () => {
      // Create multiple rate card items
      const item1 = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const item2 = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'PM-HOURLY',
        unit: 'hour',
        baseRate: '200.00',
        currency: 'NZD',
        taxClass: 'exempt',
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await testDb.execute(`
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, is_active, created_at, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12),
          ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      `, [item1.id, item1.rateCardId, item1.serviceCategoryId, item1.itemCode, item1.unit, item1.baseRate, item1.currency, item1.taxClass, item1.effectiveFrom.toISOString().split('T')[0], item1.isActive, item1.createdAt.toISOString(), item1.updatedAt.toISOString(), item2.id, item2.rateCardId, item2.serviceCategoryId, item2.itemCode, item2.unit, item2.baseRate, item2.currency, item2.taxClass, item2.effectiveFrom.toISOString().split('T')[0], item2.isActive, item2.createdAt.toISOString(), item2.updatedAt.toISOString()]);

      const result = await rateCardService.getRateCardItems(testRateCard.id);

      expect(result).toHaveLength(2);
      expect(result[0].itemCode).toBe('DEV-HOURLY');
      expect(result[1].itemCode).toBe('PM-HOURLY');
    });

    it('should filter out inactive items', async () => {
      // Create active and inactive items
      const activeItem = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const inactiveItem = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'OLD-CODE',
        unit: 'hour',
        baseRate: '100.00',
        currency: 'NZD',
        taxClass: 'standard',
        effectiveFrom: new Date('2025-01-01'),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await testDb.execute(`
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, is_active, created_at, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12),
          ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      `, [activeItem.id, activeItem.rateCardId, activeItem.serviceCategoryId, activeItem.itemCode, activeItem.unit, activeItem.baseRate, activeItem.currency, activeItem.taxClass, activeItem.effectiveFrom.toISOString().split('T')[0], activeItem.isActive, activeItem.createdAt.toISOString(), activeItem.updatedAt.toISOString(), inactiveItem.id, inactiveItem.rateCardId, inactiveItem.serviceCategoryId, inactiveItem.itemCode, inactiveItem.unit, inactiveItem.baseRate, inactiveItem.currency, inactiveItem.taxClass, inactiveItem.effectiveFrom.toISOString().split('T')[0], inactiveItem.isActive, inactiveItem.createdAt.toISOString(), inactiveItem.updatedAt.toISOString()]);

      const result = await rateCardService.getRateCardItems(testRateCard.id);

      expect(result).toHaveLength(1);
      expect(result[0].itemCode).toBe('DEV-HOURLY');
    });
  });

  describe('getRateCardItemByCode', () => {
    it('should return rate card item by code', async () => {
      const rateCardItem = {
        id: crypto.randomUUID(),
        rateCardId: testRateCard.id,
        serviceCategoryId: testServiceCategory.id,
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await testDb.execute(`
        INSERT INTO rate_card_items (id, rate_card_id, service_category_id, item_code, unit, base_rate, currency, tax_class, effective_from, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [rateCardItem.id, rateCardItem.rateCardId, rateCardItem.serviceCategoryId, rateCardItem.itemCode, rateCardItem.unit, rateCardItem.baseRate, rateCardItem.currency, rateCardItem.taxClass, rateCardItem.effectiveFrom.toISOString().split('T')[0], rateCardItem.isActive, rateCardItem.createdAt.toISOString(), rateCardItem.updatedAt.toISOString()]);

      const result = await rateCardService.getRateCardItemByCode('DEV-HOURLY');

      expect(result).toBeDefined();
      expect(result?.itemCode).toBe('DEV-HOURLY');
      expect(result?.baseRate).toBe('150.0000');
    });

    it('should return null for non-existent code', async () => {
      const result = await rateCardService.getRateCardItemByCode('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });
});
