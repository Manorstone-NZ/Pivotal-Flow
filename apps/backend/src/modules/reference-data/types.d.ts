/**
 * Reference data types
 * TypeScript interfaces for reference data DTOs
 */
export interface ReferenceDataItem {
    id: string;
    code: string;
    name: string;
    displayOrder?: number;
}
export interface CurrencyReference extends ReferenceDataItem {
    symbol?: string;
    isActive: boolean;
}
export interface TaxClassReference extends ReferenceDataItem {
    rate: number;
    isActive: boolean;
}
export interface RoleReference extends ReferenceDataItem {
    description?: string;
    isActive: boolean;
}
export interface PermissionSummaryReference extends ReferenceDataItem {
    category: string;
    description?: string;
}
export interface ServiceCategoryReference extends ReferenceDataItem {
    description?: string;
    isActive: boolean;
}
export interface RateCardReference extends ReferenceDataItem {
    version: string;
    isDefault: boolean;
    isActive: boolean;
    effectiveFrom?: string;
    effectiveUntil?: string;
}
export interface ReferenceDataResponse<T extends ReferenceDataItem> {
    data: T[];
    total: number;
    cached: boolean;
    cacheKey: string;
}
export interface CacheConfig {
    ttl: number;
    keyPrefix: string;
    bustOnChange: boolean;
}
export interface ReferenceEndpointConfig {
    endpoint: string;
    cacheConfig: CacheConfig;
    requiresAuth: boolean;
    permissions?: string[];
}
//# sourceMappingURL=types.d.ts.map