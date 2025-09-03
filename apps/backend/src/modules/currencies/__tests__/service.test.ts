import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CurrencyService } from '../service.js';
import { getDatabase } from '../../../lib/db.js';
import { organizations, currencies } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';

describe('CurrencyService', () => {
  let currencyService: CurrencyService;
  let testDb: any;
  
  const testOptions = {
    organizationId: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  beforeEach(async () => {
    // Setup real test database
    testDb = await getDatabase();
    currencyService = new CurrencyService(testDb, testOptions);

    // Setup test data
    await testDb.insert(organizations).values({
      id: testOptions.organizationId,
      name: 'Test Organization',
      slug: `test-org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  afterEach(async () => {
    // Clean up test data
    await testDb.delete(currencies).where(eq(currencies.organizationId, testOptions.organizationId));
    await testDb.delete(organizations).where(eq(organizations.id, testOptions.organizationId));
  });

  describe('getCurrencies', () => {
    it('should return currencies with pagination', async () => {
      // Create test currencies
      const testCurrencies = [
        {
          id: `currency-1-${Date.now()}`,
          organizationId: testOptions.organizationId,
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isDefault: true,
          isActive: true,
          exchangeRate: 1.0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `currency-2-${Date.now()}`,
          organizationId: testOptions.organizationId,
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          isDefault: false,
          isActive: true,
          exchangeRate: 0.85,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await testDb.insert(currencies).values(testCurrencies);

      const result = await currencyService.getCurrencies({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.currencies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter currencies by search term', async () => {
      // Create test currencies
      await testDb.insert(currencies).values({
        id: `currency-1-${Date.now()}`,
        organizationId: testOptions.organizationId,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await currencyService.getCurrencies({ page: 1, limit: 10, search: 'USD' });

      expect(result).toBeDefined();
      expect(result.currencies).toHaveLength(1);
      expect(result.currencies[0].code).toBe('USD');
    });

    it('should return only active currencies', async () => {
      // Create test currencies with one inactive
      const testCurrencies = [
        {
          id: `currency-1-${Date.now()}`,
          organizationId: testOptions.organizationId,
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isDefault: true,
          isActive: true,
          exchangeRate: 1.0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `currency-2-${Date.now()}`,
          organizationId: testOptions.organizationId,
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          isDefault: false,
          isActive: false,
          exchangeRate: 0.85,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await testDb.insert(currencies).values(testCurrencies);

      const result = await currencyService.getCurrencies({ page: 1, limit: 10, activeOnly: true });

      expect(result).toBeDefined();
      expect(result.currencies).toHaveLength(1);
      expect(result.currencies[0].code).toBe('USD');
    });
  });

  describe('getCurrency', () => {
    it('should return currency by ID', async () => {
      // Create test currency
      const currencyId = `currency-1-${Date.now()}`;
      await testDb.insert(currencies).values({
        id: currencyId,
        organizationId: testOptions.organizationId,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await currencyService.getCurrency(currencyId);

      expect(result).toBeDefined();
      expect(result.id).toBe(currencyId);
      expect(result.code).toBe('USD');
      expect(result.name).toBe('US Dollar');
      expect(result.symbol).toBe('$');
      expect(result.isDefault).toBe(true);
      expect(result.isActive).toBe(true);
      expect(result.exchangeRate).toBe(1.0);
    });

    it('should return null for non-existent currency', async () => {
      const result = await currencyService.getCurrency('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createCurrency', () => {
    it('should create currency successfully', async () => {
      const currencyData = {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        exchangeRate: 0.75
      };

      const result = await currencyService.createCurrency(currencyData);

      expect(result).toBeDefined();
      expect(result.code).toBe(currencyData.code);
      expect(result.name).toBe(currencyData.name);
      expect(result.symbol).toBe(currencyData.symbol);
      expect(result.exchangeRate).toBe(currencyData.exchangeRate);
      expect(result.organizationId).toBe(testOptions.organizationId);
      expect(result.isActive).toBe(true);
      expect(result.isDefault).toBe(false);

      // Verify it was saved to database
      const saved = await testDb.select().from(currencies).where(eq(currencies.code, currencyData.code));
      expect(saved).toHaveLength(1);
      expect(saved[0].code).toBe(currencyData.code);
    });

    it('should throw error for duplicate currency code', async () => {
      // Create first currency
      await testDb.insert(currencies).values({
        id: `currency-1-${Date.now()}`,
        organizationId: testOptions.organizationId,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Try to create duplicate
      const currencyData = {
        code: 'USD', // Duplicate code
        name: 'US Dollar',
        symbol: '$',
        exchangeRate: 1.0
      };

      await expect(currencyService.createCurrency(currencyData))
        .rejects
        .toThrow('Currency with this code already exists');
    });

    it('should throw error for invalid currency code', async () => {
      const currencyData = {
        code: 'INVALID', // Invalid code (should be 3 letters)
        name: 'Invalid Currency',
        symbol: '?',
        exchangeRate: 1.0
      };

      await expect(currencyService.createCurrency(currencyData))
        .rejects
        .toThrow();
    });
  });

  describe('updateCurrency', () => {
    it('should update currency successfully', async () => {
      // Create test currency
      const currencyId = `currency-1-${Date.now()}`;
      await testDb.insert(currencies).values({
        id: currencyId,
        organizationId: testOptions.organizationId,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const updateData = {
        name: 'Updated US Dollar',
        symbol: 'US$',
        exchangeRate: 1.1
      };

      const result = await currencyService.updateCurrency(currencyId, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.symbol).toBe(updateData.symbol);
      expect(result.exchangeRate).toBe(updateData.exchangeRate);

      // Verify it was updated in database
      const updated = await testDb.select().from(currencies).where(eq(currencies.id, currencyId));
      expect(updated[0].name).toBe(updateData.name);
    });

    it('should throw error for non-existent currency', async () => {
      const updateData = {
        name: 'Updated'
      };

      await expect(currencyService.updateCurrency('non-existent-id', updateData))
        .rejects
        .toThrow('Currency not found');
    });
  });

  describe('setDefaultCurrency', () => {
    it('should set currency as default successfully', async () => {
      // Create test currencies
      const currency1Id = `currency-1-${Date.now()}`;
      const currency2Id = `currency-2-${Date.now()}`;

      await testDb.insert(currencies).values([
        {
          id: currency1Id,
          organizationId: testOptions.organizationId,
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isDefault: true,
          isActive: true,
          exchangeRate: 1.0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: currency2Id,
          organizationId: testOptions.organizationId,
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          isDefault: false,
          isActive: true,
          exchangeRate: 0.85,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      const result = await currencyService.setDefaultCurrency(currency2Id);

      expect(result).toBeDefined();
      expect(result.id).toBe(currency2Id);
      expect(result.isDefault).toBe(true);

      // Verify previous default is no longer default
      const previousDefault = await testDb.select().from(currencies).where(eq(currencies.id, currency1Id));
      expect(previousDefault[0].isDefault).toBe(false);

      // Verify new default is set
      const newDefault = await testDb.select().from(currencies).where(eq(currencies.id, currency2Id));
      expect(newDefault[0].isDefault).toBe(true);
    });

    it('should throw error for non-existent currency', async () => {
      await expect(currencyService.setDefaultCurrency('non-existent-id'))
        .rejects
        .toThrow('Currency not found');
    });
  });

  describe('getDefaultCurrency', () => {
    it('should return default currency', async () => {
      // Create test currency as default
      const currencyId = `currency-1-${Date.now()}`;
      await testDb.insert(currencies).values({
        id: currencyId,
        organizationId: testOptions.organizationId,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isDefault: true,
        isActive: true,
        exchangeRate: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await currencyService.getDefaultCurrency();

      expect(result).toBeDefined();
      expect(result.id).toBe(currencyId);
      expect(result.code).toBe('USD');
      expect(result.isDefault).toBe(true);
    });

    it('should return null when no default currency exists', async () => {
      const result = await currencyService.getDefaultCurrency();
      expect(result).toBeNull();
    });
  });
});
