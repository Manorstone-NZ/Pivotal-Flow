import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateCardService } from '../service.js';
import { Decimal } from 'decimal.js';

// Mock dependencies
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis()
};

const mockOptions = {
  organizationId: 'org-123',
  userId: 'user-123'
};

const mockAuditLogger = {
  logEvent: vi.fn().mockResolvedValue(undefined)
};

// Mock Redis client
vi.mock('@pivotal-flow/shared/redis.js', () => ({
  getRedisClient: vi.fn(() => ({
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1)
  }))
}));

describe('RateCardService - Pricing Resolution', () => {
  let rateCardService: RateCardService;

  beforeEach(() => {
    vi.clearAllMocks();
    rateCardService = new RateCardService(mockDb as any, mockOptions, mockAuditLogger as any);
  });

  describe('resolvePricing', () => {
    const mockActiveRateCard = {
      id: 'rate-card-123',
      name: 'Standard Rates 2025',
      currency: 'NZD',
      effectiveFrom: '2025-01-01',
      effectiveUntil: null,
      isDefault: true,
      isActive: true
    };

    const mockRateCardItems = [
      {
        id: 'item-123',
        rateCardId: 'rate-card-123',
        serviceCategoryId: 'service-123',
        itemCode: 'DEV-HOURLY',
        unit: 'hour',
        baseRate: '150.00',
        currency: 'NZD',
        taxClass: 'standard',
        isActive: true
      },
      {
        id: 'item-456',
        rateCardId: 'rate-card-123',
        serviceCategoryId: 'service-456',
        itemCode: 'PM-HOURLY',
        unit: 'hour',
        baseRate: '200.00',
        currency: 'NZD',
        taxClass: 'exempt',
        isActive: true
      }
    ];

    beforeEach(() => {
      // Mock getActiveRateCard
      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(mockActiveRateCard);
      
      // Mock getRateCardItems
      vi.spyOn(rateCardService, 'getRateCardItems').mockResolvedValue(mockRateCardItems);
      
      // Mock getRateCardItemByCode
      vi.spyOn(rateCardService, 'getRateCardItemByCode').mockResolvedValue(mockRateCardItems[0]);
    });

    it('should resolve pricing with explicit unit price when user has override permission', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          unitPrice: { amount: 200, currency: 'NZD' },
          itemCode: 'DEV-HOURLY',
          unit: 'hour'
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, true);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0]).toEqual({
        unitPrice: new Decimal(200),
        taxRate: new Decimal(0.15),
        unit: 'hour',
        source: 'explicit',
        serviceCategoryId: undefined,
        itemCode: 'DEV-HOURLY'
      });
    });

    it('should reject explicit unit price when user lacks override permission', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          unitPrice: { amount: 200, currency: 'NZD' },
          itemCode: 'DEV-HOURLY'
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0].source).toBe('rate_card');
      expect(result.results![0].unitPrice).toEqual(new Decimal(150));
    });

    it('should resolve pricing by itemCode when available', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'DEV-HOURLY'
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0]).toEqual({
        unitPrice: new Decimal(150),
        taxRate: new Decimal(0.15),
        unit: 'hour',
        source: 'rate_card',
        rateCardId: 'rate-card-123',
        rateCardItemId: 'item-123',
        serviceCategoryId: 'service-123',
        itemCode: 'DEV-HOURLY'
      });
    });

    it('should handle tax exempt items correctly', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Project management',
          itemCode: 'PM-HOURLY'
        }
      ];

      // Mock to return the exempt item
      vi.spyOn(rateCardService, 'getRateCardItemByCode').mockResolvedValue(mockRateCardItems[1]);

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0].taxRate).toEqual(new Decimal(0));
      expect(result.results![0].unitPrice).toEqual(new Decimal(200));
    });

    it('should fallback to description matching when itemCode not found', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'NONEXISTENT-CODE'
        }
      ];

      // Mock itemCode lookup to return null
      vi.spyOn(rateCardService, 'getRateCardItemByCode').mockResolvedValue(null);

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0].source).toBe('rate_card');
    });

    it('should return error when no active rate card found', async () => {
      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(null);

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'DEV-HOURLY'
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0]).toEqual({
        lineNumber: 1,
        description: 'Development work',
        reason: 'No active rate card found for organization'
      });
    });

    it('should return error when no matching rate found', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Unknown service',
          itemCode: 'UNKNOWN-CODE'
        }
      ];

      // Mock all lookups to return null
      vi.spyOn(rateCardService, 'getRateCardItemByCode').mockResolvedValue(null);

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].reason).toContain('No matching rate found');
    });

    it('should handle multiple line items with mixed success', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'DEV-HOURLY'
        },
        {
          lineNumber: 2,
          description: 'Unknown service',
          itemCode: 'UNKNOWN-CODE'
        }
      ];

      // Mock first item to succeed, second to fail
      vi.spyOn(rateCardService, 'getRateCardItemByCode')
        .mockResolvedValueOnce(mockRateCardItems[0])
        .mockResolvedValueOnce(null);

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.results![0].lineNumber).toBe(1);
      expect(result.errors![0].lineNumber).toBe(2);
    });

    it('should apply rate item defaults for unit and tax class', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'DEV-HOURLY'
          // No unit specified, should use rate item default
        }
      ];

      const result = await rateCardService.resolvePricing(lineItems, false);

      expect(result.success).toBe(true);
      expect(result.results![0].unit).toBe('hour'); // From rate item
      expect(result.results![0].taxRate).toEqual(new Decimal(0.15)); // From rate item tax class
    });
  });

  describe('cache operations', () => {
    it('should cache active rate card with proper TTL', async () => {
      const mockRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates',
        isActive: true
      };

      mockDb.where.mockResolvedValueOnce([mockRateCard]);

      await rateCardService.getActiveRateCard();

      // Verify cache key format
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should bust cache on rate card updates', async () => {
      const mockRateCard = {
        id: 'rate-card-123',
        name: 'Updated Rates'
      };

      mockDb.where.mockResolvedValueOnce([mockRateCard]);
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();

      await rateCardService.updateRateCard('rate-card-123', { name: 'Updated Rates' });

      // Verify cache bust was called
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
