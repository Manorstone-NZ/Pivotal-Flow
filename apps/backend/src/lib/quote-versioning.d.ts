import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
export interface QuoteVersionData {
    quoteId: string;
    organizationId: string;
    customerId: string;
    projectId?: string;
    title: string;
    description?: string;
    status: string;
    type: string;
    validFrom: Date;
    validUntil: Date;
    currency: string;
    exchangeRate: string;
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    discountType: string;
    discountValue: string;
    discountAmount: string;
    totalAmount: string;
    termsConditions?: string;
    notes?: string;
    internalNotes?: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    sentAt?: Date;
    acceptedAt?: Date;
    expiresAt?: Date;
    metadata: Record<string, unknown>;
    lineItems: Array<{
        lineNumber: number;
        type: string;
        sku?: string;
        description: string;
        quantity: string;
        unitPrice: string;
        unitCost?: string;
        unit: string;
        taxInclusive: boolean;
        taxRate: string;
        taxAmount: string;
        discountType: string;
        discountValue: string;
        discountAmount: string;
        subtotal: string;
        totalAmount: string;
        serviceCategoryId?: string;
        rateCardId?: string;
        metadata: Record<string, unknown>;
    }>;
}
export declare class QuoteVersioningService {
    private db;
    constructor(db: PostgresJsDatabase<typeof import('./schema.js')>);
    /**
     * Create a new version of a quote
     */
    createVersion(data: QuoteVersionData): Promise<string>;
    /**
     * Get all versions of a quote
     */
    getQuoteVersions(quoteId: string, organizationId: string): Promise<any[]>;
    /**
     * Get a specific version of a quote with line items
     */
    getQuoteVersion(quoteId: string, versionId: string, organizationId: string): Promise<any | null>;
    /**
     * Check if a quote has been materially changed
     */
    hasMaterialChanges(quoteId: string, newData: unknown): Promise<boolean>;
}
//# sourceMappingURL=quote-versioning.d.ts.map