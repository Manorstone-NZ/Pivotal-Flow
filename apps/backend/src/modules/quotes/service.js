// Simple mock service for quotes
export class QuoteService {
    db;
    context;
    constructor(db, context) {
        this.db = db;
        this.context = context;
    }
    async getAllQuotes() {
        // Return empty array for now - will be implemented with real data later
        return [];
    }
    async createQuote(data) {
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
//# sourceMappingURL=service.js.map