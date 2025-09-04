/**
 * Reference data types
 * TypeScript interfaces for reference data DTOs
 */

// Base reference data item
export interface ReferenceDataItem {
  id: string;
  code: string;
  name: string;
  displayOrder?: number;
}

// Currency reference data
export interface CurrencyReference extends ReferenceDataItem {
  symbol?: string;
  isActive: boolean;
}

// Tax class reference data
export interface TaxClassReference extends ReferenceDataItem {
  rate: number;
  isActive: boolean;
}

// Role reference data
export interface RoleReference extends ReferenceDataItem {
  description?: string;
  isActive: boolean;
}

// Permission summary reference data
export interface PermissionSummaryReference extends ReferenceDataItem {
  category: string;
  description?: string;
}

// Service category reference data
export interface ServiceCategoryReference extends ReferenceDataItem {
  description?: string;
  isActive: boolean;
}

// Rate card reference data
export interface RateCardReference extends ReferenceDataItem {
  version: string;
  isDefault: boolean;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

// Reference data response wrapper
export interface ReferenceDataResponse<T extends ReferenceDataItem> {
  data: T[];
  total: number;
  cached: boolean;
  cacheKey: string;
}

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix: string;
  bustOnChange: boolean;
}

// Reference data endpoint configuration
export interface ReferenceEndpointConfig {
  endpoint: string;
  cacheConfig: CacheConfig;
  requiresAuth: boolean;
  permissions?: string[];
}
