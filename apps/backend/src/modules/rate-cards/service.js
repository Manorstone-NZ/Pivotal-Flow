// Simple mock service for rate cards
export class RateCardService {
    db;
    context;
    constructor(db, context) {
        this.db = db;
        this.context = context;
    }
    async getAllRateCards() {
        // Mock implementation
        return [];
    }
    async createRateCard(data) {
        // Mock implementation
        return {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    async createRateCardItem(data) {
        // Mock implementation
        return {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
}
//# sourceMappingURL=service.js.map