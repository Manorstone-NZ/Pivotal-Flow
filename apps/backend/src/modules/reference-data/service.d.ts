/**
 * Reference data service
 * Service for retrieving reference data with caching
 */
import type { AuditLogger } from '../audit/logger.js';
import type { PermissionService } from '../permissions/service.js';
import type { CurrencyReference, TaxClassReference, RoleReference, PermissionSummaryReference, ServiceCategoryReference, RateCardReference, ReferenceDataResponse } from './types.js';
/**
 * Reference data service for retrieving cached reference data
 */
export declare class ReferenceDataService {
    private organizationId;
    private userId;
    private permissionService;
    private auditLogger;
    private db;
    private cache;
    constructor(organizationId: string, userId: string, permissionService: PermissionService, auditLogger: AuditLogger);
    /**
     * Get currencies reference data
     */
    getCurrencies(): Promise<ReferenceDataResponse<CurrencyReference>>;
    /**
     * Get tax classes reference data
     */
    getTaxClasses(): Promise<ReferenceDataResponse<TaxClassReference>>;
    /**
     * Get roles reference data
     */
    getRoles(): Promise<ReferenceDataResponse<RoleReference>>;
    /**
     * Get permissions reference data
     */
    getPermissions(): Promise<ReferenceDataResponse<PermissionSummaryReference>>;
    /**
     * Get service categories reference data
     */
    getServiceCategories(): Promise<ReferenceDataResponse<ServiceCategoryReference>>;
    /**
     * Get rate cards reference data
     */
    getRateCards(): Promise<ReferenceDataResponse<RateCardReference>>;
    /**
     * Bust cache for a specific reference data type
     */
    bustCache(referenceType: string): Promise<void>;
    /**
     * Get data from cache
     */
    private getFromCache;
    /**
     * Set data in cache
     */
    private setCache;
    /**
     * Record metrics
     */
    private recordMetric;
}
//# sourceMappingURL=service.d.ts.map