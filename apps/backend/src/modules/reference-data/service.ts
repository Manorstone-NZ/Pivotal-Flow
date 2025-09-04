/**
 * Reference data service
 * Service for retrieving reference data with caching
 */

import { eq, and, asc, desc } from 'drizzle-orm';
import { getDatabase } from '../../lib/db.js';
import { getCache } from '../../lib/cache.js';
import { 
  currencies, 
  taxClasses, 
  roles, 
  permissions, 
  serviceCategories, 
  rateCards 
} from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../audit/logger.js';
import { 
  REFERENCE_ENDPOINTS, 
  REFERENCE_METRICS, 
  REFERENCE_ERRORS 
} from './constants.js';
import type { 
  ReferenceDataItem,
  CurrencyReference,
  TaxClassReference,
  RoleReference,
  PermissionSummaryReference,
  ServiceCategoryReference,
  RateCardReference,
  ReferenceDataResponse,
  ReferenceEndpointConfig
} from './types.js';

/**
 * Reference data service for retrieving cached reference data
 */
export class ReferenceDataService {
  private db = getDatabase();
  private cache = getCache();

  constructor(
    private organizationId: string,
    private userId: string,
    private permissionService: PermissionService,
    private auditLogger: AuditLogger
  ) {}

  /**
   * Get currencies reference data
   */
  async getCurrencies(): Promise<ReferenceDataResponse<CurrencyReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.currencies;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Try to get from cache
    const cached = await this.getFromCache<CurrencyReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'currencies');
      return cached;
    }

    // Fetch from database
    const currenciesData = await this.db
      .select({
        id: currencies.code,
        code: currencies.code,
        name: currencies.name,
        symbol: currencies.symbol,
        isActive: currencies.isActive,
      })
      .from(currencies)
      .where(eq(currencies.isActive, true))
      .orderBy(asc(currencies.name));

    const result: ReferenceDataResponse<CurrencyReference> = {
      data: currenciesData,
      total: currenciesData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'currencies');

    return result;
  }

  /**
   * Get tax classes reference data
   */
  async getTaxClasses(): Promise<ReferenceDataResponse<TaxClassReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.taxClasses;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Try to get from cache
    const cached = await this.getFromCache<TaxClassReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'tax_classes');
      return cached;
    }

    // Fetch from database
    const taxClassesData = await this.db
      .select({
        id: taxClasses.id,
        code: taxClasses.code,
        name: taxClasses.name,
        rate: taxClasses.rate,
        isActive: taxClasses.isActive,
        displayOrder: taxClasses.displayOrder,
      })
      .from(taxClasses)
      .where(eq(taxClasses.isActive, true))
      .orderBy(asc(taxClasses.displayOrder), asc(taxClasses.name));

    const result: ReferenceDataResponse<TaxClassReference> = {
      data: taxClassesData,
      total: taxClassesData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'tax_classes');

    return result;
  }

  /**
   * Get roles reference data
   */
  async getRoles(): Promise<ReferenceDataResponse<RoleReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.roles;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Check permissions
    if (endpointConfig.permissions) {
      for (const permission of endpointConfig.permissions) {
        const hasPermission = await this.permissionService.hasPermission(this.userId, permission);
        if (!hasPermission.hasPermission) {
          throw new Error(REFERENCE_ERRORS.PERMISSION_DENIED);
        }
      }
    }

    // Try to get from cache
    const cached = await this.getFromCache<RoleReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'roles');
      return cached;
    }

    // Fetch from database
    const rolesData = await this.db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        description: roles.description,
        isActive: roles.isActive,
        displayOrder: roles.displayOrder,
      })
      .from(roles)
      .where(
        and(
          eq(roles.organizationId, this.organizationId),
          eq(roles.isActive, true)
        )
      )
      .orderBy(asc(roles.displayOrder), asc(roles.name));

    const result: ReferenceDataResponse<RoleReference> = {
      data: rolesData,
      total: rolesData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'roles');

    return result;
  }

  /**
   * Get permissions reference data
   */
  async getPermissions(): Promise<ReferenceDataResponse<PermissionSummaryReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.permissions;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Check permissions
    if (endpointConfig.permissions) {
      for (const permission of endpointConfig.permissions) {
        const hasPermission = await this.permissionService.hasPermission(this.userId, permission);
        if (!hasPermission.hasPermission) {
          throw new Error(REFERENCE_ERRORS.PERMISSION_DENIED);
        }
      }
    }

    // Try to get from cache
    const cached = await this.getFromCache<PermissionSummaryReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'permissions');
      return cached;
    }

    // Fetch from database
    const permissionsData = await this.db
      .select({
        id: permissions.id,
        code: permissions.name,
        name: permissions.name,
        category: permissions.category,
        description: permissions.description,
        displayOrder: permissions.displayOrder,
      })
      .from(permissions)
      .orderBy(asc(permissions.category), asc(permissions.displayOrder), asc(permissions.name));

    const result: ReferenceDataResponse<PermissionSummaryReference> = {
      data: permissionsData,
      total: permissionsData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'permissions');

    return result;
  }

  /**
   * Get service categories reference data
   */
  async getServiceCategories(): Promise<ReferenceDataResponse<ServiceCategoryReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.serviceCategories;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Try to get from cache
    const cached = await this.getFromCache<ServiceCategoryReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'service_categories');
      return cached;
    }

    // Fetch from database
    const serviceCategoriesData = await this.db
      .select({
        id: serviceCategories.id,
        code: serviceCategories.code,
        name: serviceCategories.name,
        description: serviceCategories.description,
        isActive: serviceCategories.isActive,
        displayOrder: serviceCategories.displayOrder,
      })
      .from(serviceCategories)
      .where(
        and(
          eq(serviceCategories.organizationId, this.organizationId),
          eq(serviceCategories.isActive, true)
        )
      )
      .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.name));

    const result: ReferenceDataResponse<ServiceCategoryReference> = {
      data: serviceCategoriesData,
      total: serviceCategoriesData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'service_categories');

    return result;
  }

  /**
   * Get rate cards reference data
   */
  async getRateCards(): Promise<ReferenceDataResponse<RateCardReference>> {
    const endpointConfig = REFERENCE_ENDPOINTS.rateCards;
    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;

    // Check permissions
    if (endpointConfig.permissions) {
      for (const permission of endpointConfig.permissions) {
        const hasPermission = await this.permissionService.hasPermission(this.userId, permission);
        if (!hasPermission.hasPermission) {
          throw new Error(REFERENCE_ERRORS.PERMISSION_DENIED);
        }
      }
    }

    // Try to get from cache
    const cached = await this.getFromCache<RateCardReference>(cacheKey);
    if (cached) {
      this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'rate_cards');
      return cached;
    }

    // Fetch from database
    const rateCardsData = await this.db
      .select({
        id: rateCards.id,
        code: rateCards.name,
        name: rateCards.name,
        version: rateCards.version,
        isDefault: rateCards.isDefault,
        isActive: rateCards.isActive,
        effectiveFrom: rateCards.effectiveFrom,
        effectiveUntil: rateCards.effectiveUntil,
        displayOrder: rateCards.displayOrder,
      })
      .from(rateCards)
      .where(
        and(
          eq(rateCards.organizationId, this.organizationId),
          eq(rateCards.isActive, true)
        )
      )
      .orderBy(desc(rateCards.isDefault), desc(rateCards.effectiveFrom), asc(rateCards.name));

    const result: ReferenceDataResponse<RateCardReference> = {
      data: rateCardsData,
      total: rateCardsData.length,
      cached: false,
      cacheKey,
    };

    // Store in cache
    await this.setCache(cacheKey, result, endpointConfig.cacheConfig.ttl);
    this.recordMetric(REFERENCE_METRICS.CACHE_MISS, 'rate_cards');

    return result;
  }

  /**
   * Bust cache for a specific reference data type
   */
  async bustCache(referenceType: string): Promise<void> {
    const endpointConfig = REFERENCE_ENDPOINTS[referenceType];
    if (!endpointConfig) {
      throw new Error(REFERENCE_ERRORS.INVALID_ENDPOINT);
    }

    const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;
    await this.cache.del(cacheKey);
    this.recordMetric(REFERENCE_METRICS.CACHE_BUST, referenceType);

    // Log audit event
    await this.auditLogger.logEvent({
      organizationId: this.organizationId,
      userId: this.userId,
      action: 'reference_cache_busted',
      resource: 'reference_data',
      details: {
        referenceType,
        cacheKey,
      },
    });
  }

  /**
   * Get data from cache
   */
  private async getFromCache<T>(cacheKey: string): Promise<ReferenceDataResponse<T> | null> {
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as ReferenceDataResponse<T>;
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private async setCache<T>(cacheKey: string, data: ReferenceDataResponse<T>, ttl: number): Promise<void> {
    try {
      await this.cache.setex(cacheKey, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Record metrics
   */
  private recordMetric(metricName: string, referenceType: string): void {
    // In a real implementation, this would use Prometheus metrics
    console.log(`Metric: ${metricName} - type: ${referenceType}`);
  }
}
