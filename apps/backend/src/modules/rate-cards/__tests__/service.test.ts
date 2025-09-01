import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateCardService } from '../service.js';
import { rateCards, rateCardItems } from '../../../lib/schema.js';


// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  query: vi.fn(),
} as any;

const mockOptions = {
  organizationId: 'org-123',
  userId: 'user-123'
};

describe('RateCardService', () => {
  let rateCardService: RateCardService;

  beforeEach(() => {
    vi.clearAllMocks();
    rateCardService = new RateCardService(mockDb, mockOptions);
  });

  describe('getActiveRateCard', () => {
    it('should return active rate card for organization and date', async () => {
      const mockRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates 2025',
        currency: 'NZD',
        effectiveFrom: '2025-01-01',
        effectiveUntil: null,
        isDefault: true,
        isActive: true
      };

      mockDb.where.mockResolvedValueOnce([mockRateCard]);

      const result = await rateCardService.getActiveRateCard(new Date('2025-06-15'));

      expect(result).toEqual(mockRateCard);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(rateCards);
    });

    it('should return null when no active rate card found', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      const result = await rateCardService.getActiveRateCard(new Date('2025-06-15'));

      expect(result).toBeNull();
    });

    it('should prioritize default rate cards', async () => {
      const mockRateCards = [
        {
          id: 'rate-card-123',
          name: 'Standard Rates 2025',
          isDefault: false,
          effectiveFrom: '2025-01-01'
        },
        {
          id: 'rate-card-456',
          name: 'Default Rates',
          isDefault: true,
          effectiveFrom: '2025-01-01'
        }
      ];

      mockDb.where.mockResolvedValueOnce(mockRateCards);

      const result = await rateCardService.getActiveRateCard(new Date('2025-06-15'));

      expect(result).toEqual(mockRateCards[1]); // Should return the default one
    });
  });

  describe('resolvePricing', () => {
    it('should resolve pricing for line items with rate card', async () => {
      const mockActiveRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates 2025',
        currency: 'NZD'
      };

      const mockRateCardItems = [
        {
          id: 'item-123',
          serviceCategoryId: 'cat-123',
          baseRate: '150.00',
          isActive: true
        }
      ];

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Web Development',
          serviceCategoryId: 'cat-123',
          taxRate: 0.15
        }
      ];

      // Mock getActiveRateCard
      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(mockActiveRateCard);
      
      // Mock getRateCardItems
      vi.spyOn(rateCardService, 'getRateCardItems').mockResolvedValue(mockRateCardItems);

      const result = await rateCardService.resolvePricing(lineItems, false, new Date('2025-06-15'));

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results?.[0]?.source).toBe('rate_card');
      expect(result.results?.[0]?.unitPrice.toString()).toBe('150');
      expect(result.results?.[0]?.taxRate.toString()).toBe('0.15');
    });

    it('should allow explicit unit price override when user has permission', async () => {
      const mockActiveRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates 2025',
        currency: 'NZD'
      };

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Web Development',
          unitPrice: { amount: 200, currency: 'NZD' },
          taxRate: 0.15
        }
      ];

      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(mockActiveRateCard);

      const result = await rateCardService.resolvePricing(lineItems, true, new Date('2025-06-15'));

      expect(result.success).toBe(true);
      expect(result.results?.[0]?.source).toBe('explicit');
      expect(result.results?.[0]?.unitPrice.toString()).toBe('200');
    });

    it('should return error when no active rate card found', async () => {
      const lineItems = [
        {
          lineNumber: 1,
          description: 'Web Development',
          serviceCategoryId: 'cat-123'
        }
      ];

      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(null);

      const result = await rateCardService.resolvePricing(lineItems, false, new Date('2025-06-15'));

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.reason).toBe('No active rate card found for organization');
    });

    it('should return error for unmatched service categories', async () => {
      const mockActiveRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates 2025',
        currency: 'NZD'
      };

      const mockRateCardItems: any[] = []; // No matching items

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Web Development',
          serviceCategoryId: 'cat-123',
          taxRate: 0.15
        }
      ];

      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(mockActiveRateCard);
      vi.spyOn(rateCardService, 'getRateCardItems').mockResolvedValue(mockRateCardItems);

      const result = await rateCardService.resolvePricing(lineItems, false, new Date('2025-06-15'));

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.reason).toBe('No matching rate found for service category');
    });

    it('should fall back to description matching when no service category', async () => {
      const mockActiveRateCard = {
        id: 'rate-card-123',
        name: 'Standard Rates 2025',
        currency: 'NZD'
      };

      const mockRateCardItems = [
        {
          id: 'item-123',
          serviceCategoryId: 'cat-123',
          baseRate: '150.00',
          isActive: true
        }
      ];

      const lineItems = [
        {
          lineNumber: 1,
          description: 'Web Development',
          // No serviceCategoryId
          taxRate: 0.15
        }
      ];

      vi.spyOn(rateCardService, 'getActiveRateCard').mockResolvedValue(mockActiveRateCard);
      vi.spyOn(rateCardService, 'getRateCardItems').mockResolvedValue(mockRateCardItems);

      const result = await rateCardService.resolvePricing(lineItems, false, new Date('2025-06-15'));

      expect(result.success).toBe(true);
      expect(result.results?.[0]?.source).toBe('rate_card');
    });
  });

  describe('createRateCard', () => {
    it('should create a new rate card with validation', async () => {
      const rateCardData = {
        name: 'Premium Rates 2025',
        description: 'Premium service rates for 2025',
        currency: 'NZD',
        effectiveFrom: '2025-01-01',
        isDefault: false,
        isActive: true,
        metadata: {}
      };

      const mockCreatedRateCard = {
        id: 'rate-card-456',
        ...rateCardData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock withTx
      vi.spyOn(rateCardService as any, 'getRateCardByIdWithTx').mockResolvedValue(mockCreatedRateCard);

      const result = await rateCardService.createRateCard(rateCardData);

      expect(result).toEqual(mockCreatedRateCard);
      expect(mockDb.insert).toHaveBeenCalledWith(rateCards);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        currency: 'NZD',
        effectiveFrom: '2025-01-01',
        metadata: {},
        isActive: true,
        isDefault: false
      };

      await expect(rateCardService.createRateCard(invalidData)).rejects.toThrow('Rate card validation failed');
    });
  });

  describe('updateRateCard', () => {
    it('should update existing rate card', async () => {
      const existingRateCard = {
        id: 'rate-card-123',
        name: 'Old Name',
        currency: 'NZD',
        effectiveFrom: '2025-01-01'
      };

      const updateData = {
        name: 'New Name',
        description: 'Updated description'
      };

      const mockUpdatedRateCard = {
        ...existingRateCard,
        ...updateData,
        updatedAt: new Date()
      };

      vi.spyOn(rateCardService, 'getRateCardById').mockResolvedValue(existingRateCard);
      vi.spyOn(rateCardService as any, 'getRateCardByIdWithTx').mockResolvedValue(mockUpdatedRateCard);

      const result = await rateCardService.updateRateCard('rate-card-123', updateData);

      expect(result).toEqual(mockUpdatedRateCard);
      expect(mockDb.update).toHaveBeenCalledWith(rateCards);
    });

    it('should throw error when rate card not found', async () => {
      vi.spyOn(rateCardService, 'getRateCardById').mockResolvedValue(null);

      await expect(rateCardService.updateRateCard('nonexistent', { name: 'New Name' }))
        .rejects.toThrow('Rate card not found');
    });
  });

  describe('createRateCardItem', () => {
    it('should create a new rate card item', async () => {
      const itemData = {
        rateCardId: 'rate-card-123',
        serviceCategoryId: 'cat-123',
        baseRate: 150.00,
        currency: 'NZD',
        effectiveFrom: '2025-01-01',
        isActive: true,
        metadata: {}
      };

      const mockCreatedItem = {
        id: 'item-456',
        ...itemData,
        baseRate: '150.00',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.spyOn(rateCardService as any, 'getRateCardItemByIdWithTx').mockResolvedValue(mockCreatedItem);

      const result = await rateCardService.createRateCardItem(itemData);

      expect(result).toEqual(mockCreatedItem);
      expect(mockDb.insert).toHaveBeenCalledWith(rateCardItems);
    });
  });

  describe('listRateCards', () => {
    it('should return paginated list of rate cards', async () => {
      const mockRateCards = [
        { id: 'rate-card-1', name: 'Rates 2025' },
        { id: 'rate-card-2', name: 'Rates 2024' }
      ];

      const mockCountResult = [{ count: '2' }];

      mockDb.where.mockResolvedValueOnce(mockRateCards);
      mockDb.where.mockResolvedValueOnce(mockCountResult);

      const result = await rateCardService.listRateCards({ page: 1, pageSize: 20 });

      expect(result.data).toEqual(mockRateCards);
      expect(result.total).toBe(2);
    });

    it('should handle search filtering', async () => {
      const mockRateCards = [
        { id: 'rate-card-1', name: 'Premium Rates 2025' }
      ];

      const mockCountResult = [{ count: '1' }];

      mockDb.where.mockResolvedValueOnce(mockRateCards);
      mockDb.where.mockResolvedValueOnce(mockCountResult);

      const result = await rateCardService.listRateCards({ page: 1, pageSize: 20, search: 'Premium' });

      expect(result.data).toEqual(mockRateCards);
      expect(result.total).toBe(1);
    });
  });
});
