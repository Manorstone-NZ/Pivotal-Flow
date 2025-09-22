import { eq, and, desc, asc, sql, like, or } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { f2RateCards, f2Services } from '../../lib/schema.js';
export class F2RateCardService {
    context;
    auditLogger;
    db = getDatabase();
    constructor(context, auditLogger) {
        this.context = context;
        this.auditLogger = auditLogger;
    }
    async getAllRateCards(query = {}) {
        const { page = 1, limit = 20, search, isActive } = query;
        const offset = (page - 1) * limit;
        // Build where conditions
        const whereConditions = [
            eq(f2RateCards.organizationId, this.context.organizationId),
            eq(f2RateCards.tenantId, this.context.tenantId)
        ];
        if (isActive !== undefined) {
            whereConditions.push(eq(f2RateCards.isActive, isActive));
        }
        if (search) {
            whereConditions.push(or(like(f2RateCards.name, `%${search}%`), like(f2RateCards.description, `%${search}%`)));
        }
        // Get rate cards with services
        const rateCards = await this.db
            .select()
            .from(f2RateCards)
            .where(and(...whereConditions))
            .orderBy(desc(f2RateCards.createdAt))
            .limit(limit)
            .offset(offset);
        // Get total count
        const countResult = await this.db
            .select({ count: sql `count(*)` })
            .from(f2RateCards)
            .where(and(...whereConditions));
        const count = countResult[0]?.count || 0;
        // Get services for each rate card
        const rateCardsWithServices = await Promise.all(rateCards.map(async (rateCard) => {
            const services = await this.db
                .select()
                .from(f2Services)
                .where(and(eq(f2Services.rateCardId, rateCard.id), eq(f2Services.isActive, true)))
                .orderBy(asc(f2Services.sortOrder), asc(f2Services.name));
            return this.formatRateCardResponse(rateCard, services);
        }));
        return {
            rateCards: rateCardsWithServices,
            total: count,
            page,
            limit
        };
    }
    async getRateCard(id) {
        const rateCard = await this.db
            .select()
            .from(f2RateCards)
            .where(and(eq(f2RateCards.id, id), eq(f2RateCards.organizationId, this.context.organizationId), eq(f2RateCards.tenantId, this.context.tenantId)))
            .limit(1);
        if (!rateCard.length) {
            return null;
        }
        const services = await this.db
            .select()
            .from(f2Services)
            .where(and(eq(f2Services.rateCardId, id), eq(f2Services.isActive, true)))
            .orderBy(asc(f2Services.sortOrder), asc(f2Services.name));
        return this.formatRateCardResponse(rateCard[0], services);
    }
    async createRateCard(data) {
        const id = generateId();
        const now = new Date();
        const rateCardData = {
            id,
            organizationId: this.context.organizationId,
            tenantId: this.context.tenantId,
            name: data.name,
            description: data.description || null,
            currency: data.currency,
            isActive: data.isActive,
            createdAt: now,
            updatedAt: now
        };
        await this.db.insert(f2RateCards).values(rateCardData);
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'rate_card_created',
                entityType: 'rate_card',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: { name: data.name, currency: data.currency }
            });
        }
        const result = await this.getRateCard(id);
        if (!result) {
            throw new Error('Failed to create rate card');
        }
        return result;
    }
    async updateRateCard(id, data) {
        const existing = await this.getRateCard(id);
        if (!existing) {
            return null;
        }
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await this.db
            .update(f2RateCards)
            .set(updateData)
            .where(and(eq(f2RateCards.id, id), eq(f2RateCards.organizationId, this.context.organizationId), eq(f2RateCards.tenantId, this.context.tenantId)));
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'rate_card_updated',
                entityType: 'rate_card',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: { updatedFields: Object.keys(data) }
            });
        }
        return this.getRateCard(id);
    }
    async deleteRateCard(id) {
        const existing = await this.getRateCard(id);
        if (!existing) {
            return false;
        }
        // Delete services first (cascade should handle this, but being explicit)
        await this.db
            .delete(f2Services)
            .where(eq(f2Services.rateCardId, id));
        // Delete rate card
        await this.db
            .delete(f2RateCards)
            .where(and(eq(f2RateCards.id, id), eq(f2RateCards.organizationId, this.context.organizationId), eq(f2RateCards.tenantId, this.context.tenantId)));
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'rate_card_deleted',
                entityType: 'rate_card',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                oldValues: { name: existing.name }
            });
        }
        return true;
    }
    // Service management methods
    async createService(rateCardId, data) {
        const id = generateId();
        const now = new Date();
        // Verify rate card exists and belongs to tenant
        const rateCard = await this.getRateCard(rateCardId);
        if (!rateCard) {
            throw new Error('Rate card not found');
        }
        const serviceData = {
            id,
            rateCardId,
            name: data.name,
            description: data.description || null,
            unitOfMeasure: data.unitOfMeasure,
            buyPrice: data.buyPrice.toString(),
            sellPrice: data.sellPrice.toString(),
            taxClass: data.taxClass,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
            createdAt: now,
            updatedAt: now
        };
        await this.db.insert(f2Services).values(serviceData);
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'service_created',
                entityType: 'service',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: {
                    rateCardId,
                    name: data.name,
                    unitOfMeasure: data.unitOfMeasure,
                    buyPrice: data.buyPrice,
                    sellPrice: data.sellPrice
                }
            });
        }
        return this.formatServiceResponse(serviceData);
    }
    async updateService(rateCardId, serviceId, data) {
        const existing = await this.getService(rateCardId, serviceId);
        if (!existing) {
            return null;
        }
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        // Convert prices to strings if provided
        if (data.buyPrice !== undefined) {
            updateData.buyPrice = data.buyPrice.toString();
        }
        if (data.sellPrice !== undefined) {
            updateData.sellPrice = data.sellPrice.toString();
        }
        await this.db
            .update(f2Services)
            .set(updateData)
            .where(and(eq(f2Services.id, serviceId), eq(f2Services.rateCardId, rateCardId)));
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'service_updated',
                entityType: 'service',
                entityId: serviceId,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: {
                    rateCardId,
                    updatedFields: Object.keys(data)
                }
            });
        }
        return this.getService(rateCardId, serviceId);
    }
    async deleteService(rateCardId, serviceId) {
        const existing = await this.getService(rateCardId, serviceId);
        if (!existing) {
            return false;
        }
        await this.db
            .delete(f2Services)
            .where(and(eq(f2Services.id, serviceId), eq(f2Services.rateCardId, rateCardId)));
        // Audit log
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'service_deleted',
                entityType: 'service',
                entityId: serviceId,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                oldValues: {
                    rateCardId,
                    name: existing.name
                }
            });
        }
        return true;
    }
    async getService(rateCardId, serviceId) {
        const service = await this.db
            .select()
            .from(f2Services)
            .where(and(eq(f2Services.id, serviceId), eq(f2Services.rateCardId, rateCardId)))
            .limit(1);
        if (!service.length) {
            return null;
        }
        return this.formatServiceResponse(service[0]);
    }
    // Helper methods
    formatRateCardResponse(rateCard, services) {
        return {
            id: rateCard.id,
            organizationId: rateCard.organizationId,
            name: rateCard.name,
            description: rateCard.description,
            currency: rateCard.currency,
            isActive: rateCard.isActive,
            services: services.map(service => this.formatServiceResponse(service)),
            createdAt: rateCard.createdAt.toISOString(),
            updatedAt: rateCard.updatedAt.toISOString()
        };
    }
    formatServiceResponse(service) {
        return {
            id: service.id,
            rateCardId: service.rateCardId,
            name: service.name,
            description: service.description,
            unitOfMeasure: service.unitOfMeasure,
            buyPrice: parseFloat(service.buyPrice),
            sellPrice: parseFloat(service.sellPrice),
            taxClass: service.taxClass,
            isActive: service.isActive,
            sortOrder: service.sortOrder,
            createdAt: service.createdAt.toISOString(),
            updatedAt: service.updatedAt.toISOString()
        };
    }
}
//# sourceMappingURL=f2Service.js.map