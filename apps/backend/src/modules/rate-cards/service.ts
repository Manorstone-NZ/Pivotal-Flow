// Simple mock service for rate cards
export class RateCardService {
  constructor(private db: any, private context: any) {}

  async getAllRateCards() {
    // Mock implementation
    return [];
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
