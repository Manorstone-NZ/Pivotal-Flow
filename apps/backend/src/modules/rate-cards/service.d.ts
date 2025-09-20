import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
export interface RateCardContext {
    organizationId: string;
    userId: string;
}
export declare class RateCardService {
    private context;
    private auditLogger?;
    private db;
    constructor(context: RateCardContext, auditLogger?: AuditLogger | undefined);
    getAllRateCards(): Promise<{
        effectiveFrom: string;
        effectiveUntil: string | null;
        createdAt: string;
        updatedAt: string;
        id: string;
        organizationId: string;
        tenantId: string | null;
        name: string;
        version: string;
        description: string | null;
        currency: string;
        isDefault: boolean;
        isActive: boolean;
        metadata: unknown;
    }[]>;
    getActiveRateCard(date?: Date): Promise<{
        id: string;
        organizationId: string;
        tenantId: string | null;
        name: string;
        version: string;
        description: string | null;
        currency: string;
        effectiveFrom: string;
        effectiveUntil: string | null;
        isDefault: boolean;
        isActive: boolean;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createRateCard(data: any): Promise<{
        effectiveFrom: any;
        effectiveUntil: any;
        createdAt: string;
        updatedAt: string;
        id: string;
        organizationId: string;
        name: any;
        version: any;
        description: any;
        currency: any;
        isDefault: any;
        isActive: boolean;
        metadata: any;
    }>;
    updateRateCard(id: string, data: any): Promise<{
        effectiveFrom: string;
        effectiveUntil: string | null;
        createdAt: string;
        updatedAt: string;
        id: string;
        organizationId: string;
        tenantId: string | null;
        name: string;
        version: string;
        description: string | null;
        currency: string;
        isDefault: boolean;
        isActive: boolean;
        metadata: unknown;
    } | null>;
    getRateCardById(id: string): Promise<{
        effectiveFrom: string;
        effectiveUntil: string | null;
        createdAt: string;
        updatedAt: string;
        id: string;
        organizationId: string;
        tenantId: string | null;
        name: string;
        version: string;
        description: string | null;
        currency: string;
        isDefault: boolean;
        isActive: boolean;
        metadata: unknown;
    } | null>;
    getRateCardItems(rateCardId: string): Promise<any[]>;
    getRateCardItemByCode(code: string): Promise<{
        id: string;
        rateCardId: string;
        serviceCategoryId: string;
        roleId: string | null;
        itemCode: string | null;
        unit: string;
        baseRate: string;
        currency: string;
        taxClass: string;
        tieringModelId: string | null;
        effectiveFrom: string;
        effectiveUntil: string | null;
        isActive: boolean;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createRateCardItem(rateCardId: string, data: any): Promise<{
        baseRate: any;
        effectiveFrom: any;
        effectiveUntil: any;
        createdAt: string;
        updatedAt: string;
        id: string;
        rateCardId: string;
        serviceCategoryId: any;
        roleId: any;
        itemCode: any;
        unit: any;
        currency: any;
        taxClass: any;
        tieringModelId: any;
        isActive: boolean;
        metadata: any;
    }>;
    updateRateCardItem(itemId: string, data: any): Promise<{
        baseRate: string;
        effectiveFrom: string;
        effectiveUntil: string | null;
        createdAt: string;
        updatedAt: string;
        id?: string;
        rateCardId?: string;
        serviceCategoryId?: string;
        roleId?: string | null;
        itemCode?: string | null;
        unit?: string;
        currency?: string;
        taxClass?: string;
        tieringModelId?: string | null;
        isActive?: boolean;
        metadata?: unknown;
    } | null>;
    getRateCardItemById(itemId: string): Promise<{
        id: string;
        rateCardId: string;
        serviceCategoryId: string;
        roleId: string | null;
        itemCode: string | null;
        unit: string;
        baseRate: string;
        currency: string;
        taxClass: string;
        tieringModelId: string | null;
        effectiveFrom: string;
        effectiveUntil: string | null;
        isActive: boolean;
        metadata: unknown;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    resolvePricing(lineItems: any[], includeTax?: boolean): Promise<{
        success: boolean;
        results: ({
            unitPrice: {
                toString: () => string;
            };
            taxRate: {
                toString: () => string;
            };
            unit: string;
            source: string;
            rateCardId: string;
            rateCardItemId: string;
            serviceCategoryId: string;
            itemCode: string | null;
        } | {
            unitPrice: {
                toString: () => string;
            };
            taxRate: {
                toString: () => string;
            };
            unit: string;
            source: string;
            rateCardId: null;
            rateCardItemId: null;
            serviceCategoryId: null;
            itemCode: any;
        })[];
        errors?: never;
    } | {
        success: boolean;
        errors: {
            lineNumber: number;
            description: string;
            reason: string;
        }[];
        results?: never;
    }>;
}
//# sourceMappingURL=service.d.ts.map