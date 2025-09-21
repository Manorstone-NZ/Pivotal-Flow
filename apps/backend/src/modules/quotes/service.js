import { eq, and, desc, sql } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { quotes, quoteVersions, quoteLineItems, customers } from '../../lib/schema.js';
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
            data: quotesResult, // Changed from 'quotes' to 'data' to match frontend expectation
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
        const quote = result[0];
        if (!quote) {
            return null;
        }
        // Get line items for this quote
        const lineItems = await this.db
            .select()
            .from(quoteLineItems)
            .where(eq(quoteLineItems.quoteId, id))
            .orderBy(quoteLineItems.lineNumber);
        // Format the response to match API expectations
        return {
            id: quote.id,
            clientId: quote.customerId, // Map customerId back to clientId
            title: quote.title,
            description: quote.description,
            type: quote.type,
            status: quote.status,
            validUntil: quote.validUntil ? `${quote.validUntil}T23:59:59Z` : null,
            metadata: {
                ...(quote.metadata || {}),
                currency: quote.currency,
                discountType: quote.discountType,
                discountValue: quote.discountValue?.toString(),
                discountAmount: quote.discountAmount?.toString(),
                taxRate: quote.taxRate?.toString(),
            },
            organizationId: quote.organizationId,
            createdAt: quote.createdAt.toISOString(),
            updatedAt: quote.updatedAt.toISOString(),
            lineItems: lineItems.map(item => ({
                id: item.id,
                description: item.description,
                quantity: parseFloat(item.quantity.toString()),
                unitPrice: parseFloat(item.unitPrice.toString()),
                totalPrice: parseFloat(item.totalAmount.toString()), // Database uses totalAmount not totalPrice
                metadata: item.metadata || {}
            })),
            subtotal: parseFloat(quote.subtotal.toString()),
            taxAmount: parseFloat(quote.taxAmount.toString()),
            totalAmount: parseFloat(quote.totalAmount.toString()),
            createdBy: quote.createdBy,
            quoteNumber: quote.quoteNumber,
        };
    }
    // Removed duplicate createQuote method - using the typed version below
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
            await this.auditLogger.logEvent({
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
            await this.auditLogger.logEvent({
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
        const nextNumber = parseInt(match[1] || '0', 10) + 1;
        return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    }
    async createQuote(data) {
        const quoteId = generateId();
        const quoteNumber = await this.generateQuoteNumber();
        // Ensure customer exists, create if it doesn't
        const existingCustomer = await this.db
            .select()
            .from(customers)
            .where(eq(customers.id, data.clientId))
            .limit(1);
        if (existingCustomer.length === 0) {
            // Create a basic customer record
            await this.db.insert(customers).values({
                id: data.clientId,
                organizationId: this.context.organizationId,
                customerNumber: `CUST-${Date.now()}`,
                companyName: `Customer ${data.clientId}`,
                status: 'active',
                customerType: 'business',
                email: `${data.clientId}@example.com`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        const quoteData = {
            id: quoteId,
            organizationId: this.context.organizationId,
            tenantId: this.context.organizationId, // Use organizationId as tenantId for now
            customerId: data.clientId, // Map clientId to customerId for database
            quoteNumber,
            title: data.title,
            description: data.description || null,
            type: data.type,
            status: data.status,
            validFrom: new Date().toISOString().split('T')[0], // Required field
            validUntil: data.validUntil ? data.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
            currency: 'NZD',
            exchangeRate: '1.000000',
            subtotal: '0.00',
            taxRate: '0.1500',
            taxAmount: '0.00',
            discountType: 'percentage',
            discountValue: '0.0000',
            discountAmount: '0.00',
            totalAmount: '0.00',
            metadata: data.metadata,
            createdBy: this.context.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.db.insert(quotes).values(quoteData); // TODO: Fix schema type compatibility
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                entityType: 'quote',
                entityId: quoteId,
                action: 'create',
                newValues: quoteData,
                userId: this.context.userId,
                organizationId: this.context.organizationId
            });
        }
        // Return formatted response
        return {
            id: quoteData.id,
            clientId: quoteData.customerId, // Map back to clientId for API response
            title: quoteData.title,
            description: quoteData.description,
            type: quoteData.type,
            status: quoteData.status,
            validUntil: quoteData.validUntil ? `${quoteData.validUntil}T23:59:59Z` : null, // Convert date to datetime string
            metadata: quoteData.metadata,
            organizationId: quoteData.organizationId,
            createdAt: quoteData.createdAt.toISOString(),
            updatedAt: quoteData.updatedAt.toISOString(),
            lineItems: [],
            subtotal: parseFloat(quoteData.subtotal),
            taxAmount: parseFloat(quoteData.taxAmount),
            totalAmount: parseFloat(quoteData.totalAmount),
            createdBy: quoteData.createdBy,
            quoteNumber: quoteData.quoteNumber,
        };
    }
    async addLineItem(quoteId, data) {
        // First verify the quote exists and belongs to the organization
        const quote = await this.getQuoteById(quoteId);
        if (!quote) {
            return null;
        }
        // Get the next line number
        const maxLineNumber = await this.db
            .select({ max: sql `max(${quoteLineItems.lineNumber})` })
            .from(quoteLineItems)
            .where(eq(quoteLineItems.quoteId, quoteId));
        const lineNumber = (maxLineNumber[0]?.max || 0) + 1;
        // Calculate totals
        const subtotal = data.quantity * data.unitPrice;
        const taxAmount = subtotal * 0.15; // 15% tax rate
        const totalAmount = subtotal + taxAmount;
        // Create line item
        const lineItemId = generateId();
        const lineItemData = {
            id: lineItemId,
            quoteId,
            lineNumber,
            description: data.description,
            quantity: data.quantity.toString(),
            unitPrice: data.unitPrice.toString(),
            subtotal: subtotal.toString(),
            taxRate: '0.1500',
            taxAmount: taxAmount.toString(),
            totalAmount: totalAmount.toString(),
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.db.insert(quoteLineItems).values(lineItemData);
        // Recalculate quote totals
        await this.recalculateQuoteTotals(quoteId);
        // Return the updated quote
        return await this.getQuoteById(quoteId);
    }
    async updateLineItem(quoteId, lineItemId, data) {
        // First verify the quote exists and belongs to the organization
        const quote = await this.getQuoteById(quoteId);
        if (!quote) {
            return null;
        }
        // Get the existing line item
        const existingItem = await this.db
            .select()
            .from(quoteLineItems)
            .where(and(eq(quoteLineItems.id, lineItemId), eq(quoteLineItems.quoteId, quoteId)))
            .limit(1);
        if (existingItem.length === 0) {
            return null;
        }
        const item = existingItem[0];
        if (!item) {
            throw new Error('Line item not found');
        }
        const quantity = data.quantity ?? parseFloat(item.quantity.toString());
        const unitPrice = data.unitPrice ?? parseFloat(item.unitPrice.toString());
        // Calculate totals
        const subtotal = quantity * unitPrice;
        const taxAmount = subtotal * 0.15; // 15% tax rate
        const totalAmount = subtotal + taxAmount;
        // Update line item
        const updateData = {
            description: data.description ?? item.description,
            quantity: quantity.toString(),
            unitPrice: unitPrice.toString(),
            subtotal: subtotal.toString(),
            taxAmount: taxAmount.toString(),
            totalAmount: totalAmount.toString(),
            metadata: data.metadata ?? item.metadata,
            updatedAt: new Date()
        };
        await this.db
            .update(quoteLineItems)
            .set(updateData)
            .where(eq(quoteLineItems.id, lineItemId));
        // Recalculate quote totals
        await this.recalculateQuoteTotals(quoteId);
        // Return the updated quote
        return await this.getQuoteById(quoteId);
    }
    async deleteLineItem(quoteId, lineItemId) {
        // First verify the quote exists and belongs to the organization
        const quote = await this.getQuoteById(quoteId);
        if (!quote) {
            return null;
        }
        // Delete the line item
        await this.db
            .delete(quoteLineItems)
            .where(and(eq(quoteLineItems.id, lineItemId), eq(quoteLineItems.quoteId, quoteId)));
        // Recalculate quote totals
        await this.recalculateQuoteTotals(quoteId);
        // Return the updated quote
        return await this.getQuoteById(quoteId);
    }
    async recalculateQuoteTotals(quoteId) {
        // Get all line items for the quote
        const lineItems = await this.db
            .select()
            .from(quoteLineItems)
            .where(eq(quoteLineItems.quoteId, quoteId));
        // Calculate totals
        const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);
        const taxAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.taxAmount.toString()), 0);
        const totalAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.totalAmount.toString()), 0);
        // Update quote totals
        await this.db
            .update(quotes)
            .set({
            subtotal: subtotal.toString(),
            taxAmount: taxAmount.toString(),
            totalAmount: totalAmount.toString(),
            updatedAt: new Date()
        })
            .where(eq(quotes.id, quoteId));
    }
    async setDiscount(quoteId, discount) {
        // First verify the quote exists and belongs to the organization
        const quote = await this.getQuoteById(quoteId);
        if (!quote) {
            return null;
        }
        // Calculate discount amount
        const subtotal = parseFloat(quote.subtotal.toString());
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.value / 100);
        }
        else {
            discountAmount = discount.value;
        }
        // Update quote with discount
        await this.db
            .update(quotes)
            .set({
            discountType: discount.type,
            discountValue: discount.value.toString(),
            discountAmount: discountAmount.toString(),
            totalAmount: (subtotal + parseFloat(quote.taxAmount.toString()) - discountAmount).toString(),
            updatedAt: new Date()
        })
            .where(eq(quotes.id, quoteId));
        // Return the updated quote
        return await this.getQuoteById(quoteId);
    }
    async updateQuoteStatus(quoteId, status) {
        // First verify the quote exists and belongs to the organization
        const quote = await this.getQuoteById(quoteId);
        if (!quote) {
            return null;
        }
        // Update the quote status
        await this.db
            .update(quotes)
            .set({
            status,
            updatedAt: new Date()
        })
            .where(eq(quotes.id, quoteId));
        // Log the status change
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'quote_status_updated',
                entityType: 'quote',
                entityId: quoteId,
                metadata: {
                    newStatus: status,
                    previousStatus: quote.status
                },
                organizationId: this.context.organizationId,
                userId: this.context.userId
            });
        }
        // Return the updated quote
        return await this.getQuoteById(quoteId);
    }
}
//# sourceMappingURL=service.js.map