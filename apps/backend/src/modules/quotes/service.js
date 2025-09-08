import { eq, and, desc, sql } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { quotes, quoteVersions, quoteLineItems } from '../../lib/schema.js';
export class QuoteService {
    context;
    auditLogger;
    db = getDatabase();
    constructor(context, auditLogger) {
        this.context = context;
        this.auditLogger = auditLogger;
    }
    async listQuotes(pagination, filters) {
        const page = pagination?.page || 1;
        const pageSize = pagination?.size || 25;
        const offset = (page - 1) * pageSize;
        // Build where conditions
        const whereConditions = [eq(quotes.organizationId, this.context.organizationId)];
        if (filters?.status) {
            whereConditions.push(eq(quotes.status, filters.status));
        }
        if (filters?.customerId) {
            whereConditions.push(eq(quotes.customerId, filters.customerId));
        }
        // Get total count
        const totalResult = await this.db
            .select({ count: sql `count(*)` })
            .from(quotes)
            .where(and(...whereConditions));
        const total = totalResult[0]?.count || 0;
        // Get quotes with pagination
        const quotesResult = await this.db
            .select()
            .from(quotes)
            .where(and(...whereConditions))
            .orderBy(desc(quotes.createdAt))
            .limit(pageSize)
            .offset(offset);
        return {
            quotes: quotesResult,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: page * pageSize < total,
                hasPrev: page > 1
            }
        };
    }
    async getQuoteById(id) {
        const result = await this.db
            .select()
            .from(quotes)
            .where(and(eq(quotes.id, id), eq(quotes.organizationId, this.context.organizationId)))
            .limit(1);
        return result[0] || null;
    }
    async createQuote(data) {
        const quoteId = generateId();
        const quoteNumber = await this.generateQuoteNumber();
        const quoteData = {
            id: quoteId,
            organizationId: this.context.organizationId,
            quoteNumber,
            customerId: data.customerId || data.clientId,
            projectId: data.projectId || null,
            title: data.title,
            description: data.description || null,
            status: 'draft',
            type: data.type || 'project',
            validFrom: new Date(data.validFrom || new Date()),
            validUntil: new Date(data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
            currency: data.currency || 'NZD',
            exchangeRate: data.exchangeRate || '1.000000',
            subtotal: data.subtotal || '0.00',
            taxRate: data.taxRate || '0.1500',
            taxAmount: data.taxAmount || '0.00',
            discountType: data.discountType || 'percentage',
            discountValue: data.discountValue || '0.0000',
            discountAmount: data.discountAmount || '0.00',
            totalAmount: data.totalAmount || '0.00',
            termsConditions: data.termsConditions || null,
            notes: data.notes || null,
            internalNotes: data.internalNotes || null,
            createdBy: this.context.userId,
            approvedBy: null,
            approvedAt: null,
            sentAt: null,
            acceptedAt: null,
            rejectedAt: null,
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.db.insert(quotes).values(quoteData);
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'quote',
                entityId: quoteId,
                action: 'create',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: { quoteNumber, title: data.title }
            });
        }
        return quoteData;
    }
    async updateQuote(id, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await this.db
            .update(quotes)
            .set(updateData)
            .where(and(eq(quotes.id, id), eq(quotes.organizationId, this.context.organizationId)));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'quote',
                entityId: id,
                action: 'update',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: { updatedFields: Object.keys(data) }
            });
        }
        return await this.getQuoteById(id);
    }
    async transitionStatus(id, data) {
        const updateData = {
            status: data.status,
            updatedAt: new Date()
        };
        // Set specific timestamps based on status
        if (data.status === 'approved') {
            updateData.approvedBy = this.context.userId;
            updateData.approvedAt = new Date();
        }
        else if (data.status === 'sent') {
            updateData.sentAt = new Date();
        }
        else if (data.status === 'accepted') {
            updateData.acceptedAt = new Date();
        }
        else if (data.status === 'rejected') {
            updateData.rejectedAt = new Date();
        }
        await this.db
            .update(quotes)
            .set(updateData)
            .where(and(eq(quotes.id, id), eq(quotes.organizationId, this.context.organizationId)));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.log({
                entityType: 'quote',
                entityId: id,
                action: 'status_transition',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                metadata: {
                    fromStatus: 'unknown', // Would need to get current status first
                    toStatus: data.status,
                    reason: data.reason
                }
            });
        }
        return await this.getQuoteById(id);
    }
    async getQuoteVersions(quoteId) {
        return await this.db
            .select()
            .from(quoteVersions)
            .where(and(eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.organizationId, this.context.organizationId)))
            .orderBy(desc(quoteVersions.versionNumber));
    }
    async getQuoteVersion(quoteId, versionId) {
        const result = await this.db
            .select()
            .from(quoteVersions)
            .where(and(eq(quoteVersions.id, versionId), eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.organizationId, this.context.organizationId)))
            .limit(1);
        return result[0] || null;
    }
    async generateQuoteNumber() {
        const year = new Date().getFullYear();
        const prefix = `Q${year}`;
        // Get the highest quote number for this year
        const result = await this.db
            .select({ quoteNumber: quotes.quoteNumber })
            .from(quotes)
            .where(and(eq(quotes.organizationId, this.context.organizationId), sql `${quotes.quoteNumber} LIKE ${prefix + '%'}`))
            .orderBy(desc(quotes.quoteNumber))
            .limit(1);
        if (result.length === 0) {
            return `${prefix}-001`;
        }
        const lastNumber = result[0]?.quoteNumber;
        if (!lastNumber) {
            return `${prefix}-001`;
        }
        const match = lastNumber.match(new RegExp(`${prefix}-(\\d+)`));
        if (!match) {
            return `${prefix}-001`;
        }
        const nextNumber = parseInt(match[1], 10) + 1;
        return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    }
}
//# sourceMappingURL=service.js.map