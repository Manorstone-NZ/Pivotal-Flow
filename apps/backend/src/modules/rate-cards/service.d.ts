import { Decimal } from 'decimal.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { BaseRepository } from '../../lib/repo.base.js';
import type { PaginationOptions } from '../../lib/repo.base.js';
import { type CreateRateCardSchema, type UpdateRateCardSchema, type CreateRateCardItemSchema, type UpdateRateCardItemSchema } from './schemas.js';
export interface PricingResolutionResult {
    unitPrice: Decimal;
    taxRate: Decimal;
    unit: string;
    source: 'explicit' | 'rate_card' | 'default';
    rateCardId?: string;
    rateCardItemId?: string;
    serviceCategoryId?: string;
    itemCode?: string;
}
export interface PricingResolutionError {
    lineNumber: number;
    description: string;
    reason: string;
}
export interface PricingResolutionResponse {
    success: boolean;
    results?: PricingResolutionResult[];
    errors?: PricingResolutionError[];
}
/**
 * Rate Card Service
 *
 * Handles all rate card business logic including:
 * - Rate card CRUD operations
 * - Rate card item management
 * - Pricing resolution for quotes with proper priority logic
 * - Cache management with TTL and bust
 * - Audit logging for all operations
 */
export declare class RateCardService extends BaseRepository {
    options: {
        organizationId: string;
        userId: string;
    };
    private auditLogger;
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, options: {
        organizationId: string;
        userId: string;
    }, auditLogger?: AuditLogger);
    /**
     * Get active rate card by date and organization with caching
     * Cache key: pivotal:org:{id}:ratecard:active
     * TTL: 60 seconds as per requirements
     */
    getActiveRateCard(date?: Date): Promise<any>;
    /**
     * Get rate card items for a specific rate card with caching
     * Cache key: pivotal:org:{id}:rateitem:{rateCardId}
     * TTL: 300 seconds as per requirements
     */
    getRateCardItems(rateCardId: string): Promise<any[]>;
    /**
     * Get rate card item by code with caching
     * Cache key: pivotal:org:{id}:rateitem:code:{itemCode}
     * TTL: 300 seconds as per requirements
     */
    getRateCardItemByCode(itemCode: string): Promise<any | null>;
    /**
     * Resolve pricing for quote line items with proper priority logic
     * Priority 1: Explicit unit price if user has quotes.override_price permission
     * Priority 2: Match by itemCode (SKU) then description
     * Priority 3: Apply RateItem defaults for unit and tax class when not provided
     */
    resolvePricing(lineItems: Array<{
        lineNumber: number;
        description: string;
        unitPrice?: {
            amount: number;
            currency: string;
        };
        serviceCategoryId?: string;
        rateCardId?: string;
        taxRate?: number;
        itemCode?: string;
        unit?: string;
    }>, userHasOverridePermission?: boolean, effectiveDate?: Date): Promise<PricingResolutionResponse>;
    /**
     * Find matching rate item by service category and description
     */
    private findMatchingRateItem;
    /**
     * Find matching rate item by description only
     */
    private findMatchingRateItemByDescription;
    /**
     * Create a new rate card
     */
    createRateCard(data: CreateRateCardSchema): Promise<any>;
    /**
     * Update an existing rate card
     */
    updateRateCard(rateCardId: string, data: UpdateRateCardSchema): Promise<any>;
    /**
     * Create a new rate card item
     */
    createRateCardItem(data: CreateRateCardItemSchema): Promise<any>;
    /**
     * Update an existing rate card item
     */
    updateRateCardItem(rateCardItemId: string, data: UpdateRateCardItemSchema): Promise<any>;
    /**
     * Get rate card by ID
     */
    getRateCardById(rateCardId: string): Promise<any>;
    /**
     * Get rate card by ID within transaction
     */
    getRateCardByIdWithTx(tx: any, rateCardId: string): Promise<any>;
    /**
     * Get rate card item by ID
     */
    getRateCardItemById(rateCardItemId: string): Promise<any>;
    /**
     * Get rate card item by ID within transaction
     */
    getRateCardItemByIdWithTx(tx: any, rateCardItemId: string): Promise<any>;
    /**
     * List rate cards with pagination
     */
    listRateCards(options?: PaginationOptions): Promise<{
        data: any[];
        total: number;
    }>;
    /**
     * Bust cache when rate card changes
     * Busts all related cache keys for the organization
     */
    bustRateCardCache(rateCardId: string): Promise<void>;
    /**
     * Bust all rate card caches for the organization
     * Used when organization settings change or bulk operations
     */
    bustAllRateCardCaches(): Promise<void>;
    private getFromCache;
    private setCache;
    private deleteFromCache;
}
//# sourceMappingURL=service.d.ts.map