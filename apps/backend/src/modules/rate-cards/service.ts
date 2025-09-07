// Simple mock service for rate cards
export class RateCardService {
  constructor(private db: any, private context: any) {}

  async getAllRateCards() {
    // Mock implementation
    return [];
  }

  async getActiveRateCard(date?: Date) {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      name: 'Default Rate Card',
      currency: 'NZD',
      effectiveFrom: new Date().toISOString(),
      effectiveUntil: null,
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getRateCardById(id: string) {
    // Mock implementation
    return {
      id,
      name: 'Sample Rate Card',
      currency: 'NZD',
      effectiveFrom: new Date().toISOString(),
      effectiveUntil: null,
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async listRateCards(options?: any) {
    // Mock implementation
    return {
      data: [],
      pagination: {
        page: options?.page || 1,
        limit: options?.size || 25,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  async updateRateCard(id: string, data: any) {
    // Mock implementation
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async getRateCardItems(rateCardId: string) {
    // Mock implementation
    return [];
  }

  async getRateCardItemByCode(code: string) {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      rateCardId: crypto.randomUUID(),
      serviceCategoryId: crypto.randomUUID(),
      itemCode: code,
      unit: 'hour',
      baseRate: '100.00',
      currency: 'NZD',
      taxClass: 'standard',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateRateCardItem(id: string, data: any) {
    // Mock implementation
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async resolvePricing(lineItems: any[], includeTax?: boolean) {
    // Mock implementation
    return {
      success: true,
      results: lineItems.map(item => ({
        unitPrice: { toString: () => '100.00' },
        taxRate: { toString: () => '0.15' },
        unit: 'hour',
        source: 'rate_card',
        rateCardId: crypto.randomUUID(),
        rateCardItemId: crypto.randomUUID(),
        serviceCategoryId: crypto.randomUUID(),
        itemCode: item.code || 'DEFAULT'
      }))
    };
  }

  async createRateCard(data: any) {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async createRateCardItem(data: any) {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
