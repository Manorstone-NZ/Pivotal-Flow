// Simple mock service for quotes
export class QuoteService {
  constructor(private db: any, private context: any) {}

  async getAllQuotes() {
    // Return empty array for now - will be implemented with real data later
    return [];
  }

  async listQuotes(pagination?: any, filters?: any) {
    // Mock implementation for listing quotes
    return {
      data: [],
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.size || 25,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  async getQuoteById(id: string) {
    // Mock implementation
    return {
      id,
      customerId: '123e4567-e89b-12d3-a456-426614174000',
      projectName: 'Sample Project',
      description: 'Sample description',
      status: 'draft',
      totalAmount: 1000,
      currency: 'NZD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async transitionStatus(id: string, data: any) {
    // Mock implementation for status transition
    return {
      id,
      ...data,
      status: data.status,
      updatedAt: new Date().toISOString()
    };
  }

  async updateQuote(id: string, data: any) {
    // Mock implementation for updating quotes
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async getQuoteVersions(id: string) {
    // Mock implementation
    return [];
  }

  async getQuoteVersion(id: string, versionId: string) {
    // Mock implementation
    return {
      id: versionId,
      quoteId: id,
      version: 1,
      createdAt: new Date().toISOString()
    };
  }

  async createQuote(data: any) {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
