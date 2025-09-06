/**
 * Reference data service
 * Service for retrieving reference data with caching
 */
import { eq, and, asc, desc } from 'drizzle-orm';
import { getCache } from '../../lib/cache.js';
import { getDatabase } from '../../lib/db.js';
import { currencies, roles, permissions, serviceCategories, rateCards, taxClasses } from '../../lib/schema.js';
import { REFERENCE_ENDPOINTS, REFERENCE_METRICS, REFERENCE_ERRORS } from './constants.js';
/**
 * Reference data service for retrieving cached reference data
 */
export class ReferenceDataService {
    organizationId;
    userId;
    permissionService;
    auditLogger;
    db = getDatabase();
    cache = getCache();
    constructor(organizationId, userId, permissionService, auditLogger) {
        this.organizationId = organizationId;
        this.userId = userId;
        this.permissionService = permissionService;
        this.auditLogger = auditLogger;
    }
    /**
     * Get currencies reference data
     */
    async getCurrencies() {
        const endpointConfig = REFERENCE_ENDPOINTS['currencies'];
        if (!endpointConfig) {
            throw new Error('Currency endpoint configuration not found');
        }
        const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;
        // Try to get from cache
        const cached = await this.getFromCache(cacheKey);
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
        const result = {
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
    async getTaxClasses() {
        const endpointConfig = REFERENCE_ENDPOINTS['taxClasses'];
        if (!endpointConfig) {
            throw new Error('Tax classes endpoint configuration not found');
        }
        const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;
        // Try to get from cache
        const cached = await this.getFromCache(cacheKey);
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
        // Convert rate from string to number
        const convertedData = taxClassesData.map(item => ({
            ...item,
            rate: parseFloat(item.rate)
        }));
        const result = {
            data: convertedData,
            total: convertedData.length,
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
    async getRoles() {
        const endpointConfig = REFERENCE_ENDPOINTS['roles'];
        if (!endpointConfig) {
            throw new Error('Roles endpoint configuration not found');
        }
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
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'roles');
            return cached;
        }
        // Fetch from database
        const rolesData = await this.db
            .select({
            id: roles.id,
            name: roles.name,
            description: roles.description,
            isActive: roles.isActive,
        })
            .from(roles)
            .where(and(eq(roles.organizationId, this.organizationId), eq(roles.isActive, true)))
            .orderBy(asc(roles.name));
        const result = {
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
    async getPermissions() {
        const endpointConfig = REFERENCE_ENDPOINTS['permissions'];
        if (!endpointConfig) {
            throw new Error('Permissions endpoint configuration not found');
        }
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
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            this.recordMetric(REFERENCE_METRICS.CACHE_HIT, 'permissions');
            return cached;
        }
        // Fetch from database
        const permissionsData = await this.db
            .select({
            id: permissions.id,
            name: permissions.name,
            category: permissions.category,
            description: permissions.description,
        })
            .from(permissions)
            .orderBy(asc(permissions.category), asc(permissions.name));
        const result = {
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
    async getServiceCategories() {
        const endpointConfig = REFERENCE_ENDPOINTS['serviceCategories'];
        if (!endpointConfig) {
            throw new Error('Service categories endpoint configuration not found');
        }
        const cacheKey = `${endpointConfig.cacheConfig.keyPrefix}:${this.organizationId}`;
        // Try to get from cache
        const cached = await this.getFromCache(cacheKey);
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
            displayOrder: serviceCategories.ordering,
        })
            .from(serviceCategories)
            .where(and(eq(serviceCategories.organizationId, this.organizationId), eq(serviceCategories.isActive, true)))
            .orderBy(asc(serviceCategories.ordering), asc(serviceCategories.name));
        const result = {
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
    async getRateCards() {
        const endpointConfig = REFERENCE_ENDPOINTS['rateCards'];
        if (!endpointConfig) {
            throw new Error('Rate cards endpoint configuration not found');
        }
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
        const cached = await this.getFromCache(cacheKey);
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
        })
            .from(rateCards)
            .where(and(eq(rateCards.organizationId, this.organizationId), eq(rateCards.isActive, true)))
            .orderBy(desc(rateCards.isDefault), desc(rateCards.effectiveFrom), asc(rateCards.name));
        const result = {
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
    async bustCache(referenceType) {
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
            actorId: this.userId,
            action: 'reference_cache_busted',
            entityType: 'reference_data',
            entityId: referenceType,
            metadata: {
                referenceType,
                cacheKey,
            },
        });
    }
    /**
     * Get data from cache
     */
    async getFromCache(cacheKey) {
        try {
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.error('Cache get error:', error);
        }
        return null;
    }
    /**
     * Set data in cache
     */
    async setCache(cacheKey, data, ttl) {
        try {
            await this.cache.set(cacheKey, JSON.stringify(data), ttl);
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    /**
     * Record metrics
     */
    recordMetric(metricName, referenceType) {
        // In a real implementation, this would use Prometheus metrics
        console.log(`Metric: ${metricName} - type: ${referenceType}`);
    }
}
//# sourceMappingURL=service.js.map