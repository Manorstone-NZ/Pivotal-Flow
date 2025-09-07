// Simple mock service for quotes
export class QuoteService {
  constructor(private db: any, private context: any) {}

  async getAllQuotes() {
    // Return empty array for now - will be implemented with real data later
    return [];
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
