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
        id: string;
        organizationId: string;
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
    }[]>;
    getActiveRateCard(date?: Date): Promise<{
        id: string;
        organizationId: string;
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
        id: string;
        organizationId: string;
        name: any;
        version: any;
        description: any;
        currency: any;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        isDefault: any;
        isActive: boolean;
        metadata: any;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRateCard(id: string, data: any): Promise<{
        id: string;
        organizationId: string;
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
    getRateCardById(id: string): Promise<{
        id: string;
        organizationId: string;
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
        id: string;
        rateCardId: string;
        organizationId: string;
        serviceCategoryId: any;
        roleId: any;
        itemCode: any;
        unit: any;
        baseRate: any;
        currency: any;
        taxClass: any;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        isActive: boolean;
        metadata: any;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRateCardItem(itemId: string, data: any): Promise<{
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