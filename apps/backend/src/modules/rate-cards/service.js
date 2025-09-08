import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { rateCards, rateCardItems, serviceCategories } from '../../lib/schema.js';
export class RateCardService {
    context;
    auditLogger;
    db = getDatabase();
    constructor(context, auditLogger) {
        this.context = context;
        this.auditLogger = auditLogger;
    }
    async getAllRateCards() {
        return await this.db
            .select()
            .from(rateCards)
            .where(eq(rateCards.organizationId, this.context.organizationId))
            .orderBy(desc(rateCards.createdAt));
    }
    async getActiveRateCard(date) {
        const effectiveDate = date || new Date();
        const result = await this.db
            .select()
            .from(rateCards)
            .where(and(eq(rateCards.organizationId, this.context.organizationId), eq(rateCards.isActive, true), lte(rateCards.effectiveFrom, effectiveDate), sql `(${rateCards.effectiveUntil} IS NULL OR ${rateCards.effectiveUntil} >= ${effectiveDate})`))
            .orderBy(desc(rateCards.isDefault), desc(rateCards.effectiveFrom))
            .limit(1);
        return result[0] || null;
    }
    async createRateCard(data) {
        const rateCardId = generateId();
        const rateCardData = {
            id: rateCardId,
            organizationId: this.context.organizationId,
            name: data.name,
            version: data.version || '1.0',
            description: data.description || null,
            currency: data.currency || 'NZD',
            effectiveFrom: new Date(data.effectiveFrom || new Date()),
            effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
            isDefault: data.isDefault || false,
            isActive: data.isActive !== false, // Default to true
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.db.insert(rateCards).values(rateCardData);
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'rate_card',
                entityId: rateCardId,
                action: 'create',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: { name: data.name, currency: data.currency }
            });
        }
        return rateCardData;
    }
    async updateRateCard(id, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await this.db
            .update(rateCards)
            .set(updateData)
            .where(and(eq(rateCards.id, id), eq(rateCards.organizationId, this.context.organizationId)));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'rate_card',
                entityId: id,
                action: 'update',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: { updatedFields: Object.keys(data) }
            });
        }
        return await this.getRateCardById(id);
    }
    async getRateCardById(id) {
        const result = await this.db
            .select()
            .from(rateCards)
            .where(and(eq(rateCards.id, id), eq(rateCards.organizationId, this.context.organizationId)))
            .limit(1);
        return result[0] || null;
    }
    async getRateCardItems(rateCardId) {
        return await this.db
            .select()
            .from(rateCardItems)
            .where(and(eq(rateCardItems.rateCardId, rateCardId), eq(rateCardItems.organizationId, this.context.organizationId)))
            .orderBy(rateCardItems.itemCode);
    }
    async getRateCardItemByCode(code) {
        const result = await this.db
            .select()
            .from(rateCardItems)
            .where(and(eq(rateCardItems.itemCode, code), eq(rateCardItems.organizationId, this.context.organizationId), eq(rateCardItems.isActive, true)))
            .limit(1);
        return result[0] || null;
    }
    async createRateCardItem(rateCardId, data) {
        const itemId = generateId();
        const itemData = {
            id: itemId,
            rateCardId,
            organizationId: this.context.organizationId,
            serviceCategoryId: data.serviceCategoryId,
            roleId: data.roleId || null,
            itemCode: data.itemCode,
            unit: data.unit || 'hour',
            baseRate: data.baseRate.toString(),
            currency: data.currency || 'NZD',
            taxClass: data.taxClass || 'standard',
            effectiveFrom: new Date(data.effectiveFrom || new Date()),
            effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
            isActive: data.isActive !== false, // Default to true
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.db.insert(rateCardItems).values(itemData);
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'rate_card_item',
                entityId: itemId,
                action: 'create',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: {
                    rateCardId,
                    itemCode: data.itemCode,
                    baseRate: data.baseRate
                }
            });
        }
        return itemData;
    }
    async updateRateCardItem(itemId, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await this.db
            .update(rateCardItems)
            .set(updateData)
            .where(and(eq(rateCardItems.id, itemId), eq(rateCardItems.organizationId, this.context.organizationId)));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'rate_card_item',
                entityId: itemId,
                action: 'update',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: { updatedFields: Object.keys(data) }
            });
        }
        return await this.getRateCardItemById(itemId);
    }
    async getRateCardItemById(itemId) {
        const result = await this.db
            .select()
            .from(rateCardItems)
            .where(and(eq(rateCardItems.id, itemId), eq(rateCardItems.organizationId, this.context.organizationId)))
            .limit(1);
        return result[0] || null;
    }
    async resolvePricing(lineItems, includeTax) {
        try {
            const results = [];
            for (const item of lineItems) {
                // Try to find matching rate card item
                let rateCardItem = null;
                if (item.itemCode) {
                    rateCardItem = await this.getRateCardItemByCode(item.itemCode);
                }
                if (!rateCardItem && item.description) {
                    // Try to find by description (fuzzy matching)
                    const descriptionMatch = await this.db
                        .select()
                        .from(rateCardItems)
                        .where(and(eq(rateCardItems.organizationId, this.context.organizationId), eq(rateCardItems.isActive, true), sql `LOWER(${rateCardItems.itemCode}) LIKE LOWER(${'%' + item.description + '%'})`))
                        .limit(1);
                    rateCardItem = descriptionMatch[0] || null;
                }
                if (rateCardItem) {
                    const unitPrice = parseFloat(rateCardItem.baseRate);
                    const taxRate = includeTax ? 0.15 : 0; // Default tax rate
                    const taxAmount = unitPrice * taxRate;
                    results.push({
                        unitPrice: { toString: () => unitPrice.toFixed(2) },
                        taxRate: { toString: () => taxRate.toFixed(2) },
                        unit: rateCardItem.unit,
                        source: 'rate_card',
                        rateCardId: rateCardItem.rateCardId,
                        rateCardItemId: rateCardItem.id,
                        serviceCategoryId: rateCardItem.serviceCategoryId,
                        itemCode: rateCardItem.itemCode
                    });
                }
                else {
                    // No matching rate found
                    results.push({
                        unitPrice: { toString: () => '0.00' },
                        taxRate: { toString: () => '0.00' },
                        unit: 'hour',
                        source: 'not_found',
                        rateCardId: null,
                        rateCardItemId: null,
                        serviceCategoryId: null,
                        itemCode: item.itemCode || item.description || 'unknown'
                    });
                }
            }
            return {
                success: true,
                results
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [{
                        lineNumber: 1,
                        description: 'Pricing resolution failed',
                        reason: error instanceof Error ? error.message : 'Unknown error'
                    }]
            };
        }
    }
}
//# sourceMappingURL=service.js.map