import { generateId } from '@pivotal-flow/shared';
import { eq, desc, and } from 'drizzle-orm';
import { quoteVersions, quoteLineItemVersions, quotes, quoteLineItems } from './schema.js';
import { withTx } from './withTx.js';
export class QuoteVersioningService {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Create a new version of a quote
     */
    async createVersion(data) {
        return withTx(this.db, async (tx) => {
            // Get the next version number
            const latestVersion = await tx
                .select({ versionNumber: quoteVersions.versionNumber })
                .from(quoteVersions)
                .where(eq(quoteVersions.quoteId, data.quoteId))
                .orderBy(desc(quoteVersions.versionNumber))
                .limit(1);
            const versionNumber = latestVersion.length > 0 && latestVersion[0] ? latestVersion[0].versionNumber + 1 : 1;
            const versionId = generateId();
            // Create quote version
            await tx.insert(quoteVersions).values({
                quoteId: data.quoteId,
                versionNumber,
                organizationId: data.organizationId,
                customerId: data.customerId,
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                status: data.status,
                type: data.type,
                validFrom: data.validFrom,
                validUntil: data.validUntil,
                currency: data.currency,
                exchangeRate: data.exchangeRate,
                subtotal: data.subtotal,
                taxRate: data.taxRate,
                taxAmount: data.taxAmount,
                discountType: data.discountType,
                discountValue: data.discountValue,
                discountAmount: data.discountAmount,
                totalAmount: data.totalAmount,
                termsConditions: data.termsConditions,
                notes: data.notes,
                internalNotes: data.internalNotes,
                createdBy: data.createdBy,
                approvedBy: data.approvedBy,
                approvedAt: data.approvedAt,
                sentAt: data.sentAt,
                acceptedAt: data.acceptedAt,
                expiresAt: data.expiresAt,
                metadata: data.metadata,
                createdAt: new Date()
            });
            // Create line item versions
            for (const item of data.lineItems) {
                await tx.insert(quoteLineItemVersions).values({
                    id: generateId(),
                    quoteVersionId: versionId,
                    lineNumber: item.lineNumber,
                    type: item.type,
                    sku: item.sku,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    unitCost: item.unitCost,
                    unit: item.unit,
                    taxInclusive: item.taxInclusive,
                    taxRate: item.taxRate,
                    taxAmount: item.taxAmount,
                    discountType: item.discountType,
                    discountValue: item.discountValue,
                    discountAmount: item.discountAmount,
                    subtotal: item.subtotal,
                    totalAmount: item.totalAmount,
                    serviceCategoryId: item.serviceCategoryId,
                    rateCardId: item.rateCardId,
                    metadata: item.metadata,
                    createdAt: new Date()
                });
            }
            // Update the quote to point to the new version
            // Note: currentVersionId is managed at application level to avoid circular references
            // We'll store this information in the metadata or handle it differently
            await tx
                .update(quotes)
                .set({
                metadata: { ...data.metadata, currentVersionId: versionId },
                updatedAt: new Date()
            })
                .where(eq(quotes.id, data.quoteId));
            return versionId;
        });
    }
    /**
     * Get all versions of a quote
     */
    async getQuoteVersions(quoteId, organizationId) {
        const versions = await this.db
            .select({
            id: quoteVersions.id,
            versionNumber: quoteVersions.versionNumber,
            title: quoteVersions.title,
            status: quoteVersions.status,
            totalAmount: quoteVersions.totalAmount,
            createdAt: quoteVersions.createdAt,
            createdBy: quoteVersions.createdBy
        })
            .from(quoteVersions)
            .where(and(eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.organizationId, organizationId)))
            .orderBy(desc(quoteVersions.versionNumber));
        return versions;
    }
    /**
     * Get a specific version of a quote with line items
     */
    async getQuoteVersion(quoteId, versionId, organizationId) {
        const version = await this.db
            .select()
            .from(quoteVersions)
            .where(and(eq(quoteVersions.id, versionId), eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.organizationId, organizationId)))
            .limit(1);
        if (version.length === 0) {
            return null;
        }
        const lineItems = await this.db
            .select()
            .from(quoteLineItemVersions)
            .where(eq(quoteLineItemVersions.quoteVersionId, versionId))
            .orderBy(quoteLineItemVersions.lineNumber);
        return {
            ...version[0],
            lineItems
        };
    }
    /**
     * Check if a quote has been materially changed
     */
    async hasMaterialChanges(quoteId, newData) {
        const currentQuote = await this.db
            .select()
            .from(quotes)
            .where(eq(quotes.id, quoteId))
            .limit(1);
        if (currentQuote.length === 0) {
            return false;
        }
        const current = currentQuote[0];
        // Type guard to check if newData is an object
        if (typeof newData !== 'object' || newData === null) {
            return false;
        }
        const data = newData;
        // Define material fields that trigger versioning
        const materialFields = [
            'title', 'description', 'type', 'validFrom', 'validUntil', 'currency',
            'exchangeRate', 'taxRate', 'discountType', 'discountValue', 'termsConditions',
            'notes', 'internalNotes'
        ];
        // Check if any material fields have changed
        for (const field of materialFields) {
            if (current && current[field] !== data[field]) {
                return true;
            }
        }
        // Check line items for changes
        if (data['lineItems']) {
            const currentLineItems = await this.db
                .select()
                .from(quoteLineItems)
                .where(eq(quoteLineItems.quoteId, quoteId))
                .orderBy(quoteLineItems.lineNumber);
            if (currentLineItems.length !== data['lineItems'].length) {
                return true;
            }
            for (let i = 0; i < currentLineItems.length; i++) {
                const currentItem = currentLineItems[i];
                const newItem = data['lineItems'][i];
                if (!currentItem || !newItem)
                    continue;
                const lineItemFields = [
                    'description', 'quantity', 'unitPrice', 'unitCost', 'unit',
                    'taxInclusive', 'taxRate', 'discountType', 'discountValue'
                ];
                for (const field of lineItemFields) {
                    if (currentItem[field] !== (newItem)[field]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
//# sourceMappingURL=quote-versioning.js.map