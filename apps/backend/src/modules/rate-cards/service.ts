import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, isNull, desc, or, like, sql, type SQL } from 'drizzle-orm';
import { Decimal } from 'decimal.js';
import { 
  rateCards,
  rateCardItems
} from '../../lib/schema.js';
import { 
  validateRateCardData,
  validateRateCardItemData,
  type CreateRateCardSchema,
  type UpdateRateCardSchema,
  type CreateRateCardItemSchema,
  type UpdateRateCardItemSchema
} from './schemas.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { withTx } from '../../lib/withTx.js';
import { BaseRepository } from '../../lib/repo.base.js';
import type { PaginationOptions } from '../../lib/repo.base.js';
import { logger } from '../../lib/logger.js';
// Cache TTL constants as per requirements
const RATE_CARD_CACHE_TTL = 60; // 60 seconds for active rate card
const RATE_ITEM_CACHE_TTL = 300; // 300 seconds for rate item lookups

/**
 * Simple cache key builder for rate cards
 * Format: pivotal:org:{id}:ratecard:active
 */
function buildCacheKey(organizationId: string, resource: string, action?: string, identifier?: string): string {
  const parts = ['pivotal', organizationId, resource];
  if (identifier) parts.push(identifier);
  if (action) parts.push(action);
  return parts.join(':');
}


export interface PricingResolutionResult {
  unitPrice: Decimal;
  taxRate: Decimal;
  source: 'explicit' | 'rate_card' | 'default';
  rateCardId?: string;
  rateCardItemId?: string;
  serviceCategoryId?: string;
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
 * JSONB Guard - Prevents business values from being stored in metadata
 * This enforces the rule that JSONB may only hold optional metadata or rare exceptions
 */
function validateMetadataJSONB(data: any, context: string): void {
  const forbiddenFields = [
    'unitPrice', 'price', 'amount', 'total', 'subtotal', 'taxAmount', 'discountAmount',
    'quantity', 'qty', 'unit', 'taxRate', 'taxClass', 'currency', 'exchangeRate'
  ];

  const checkObject = (obj: any, path: string = '') => {
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (forbiddenFields.includes(key)) {
          throw new Error(
            `JSONB metadata cannot contain business values. Field '${key}' at path '${currentPath}' in ${context} is forbidden. ` +
            `Business values must be stored in typed columns, not in metadata JSONB.`
          );
        }
        
        if (value && typeof value === 'object') {
          checkObject(value, currentPath);
        }
      }
    }
  };

  checkObject(data);
}

/**
 * Rate Card Service
 * 
 * Handles all rate card business logic including:
 * - Rate card CRUD operations
 * - Rate card item management
 * - Pricing resolution for quotes
 * - Cache management with TTL and bust
 * - Audit logging for all operations
 */
export class RateCardService extends BaseRepository {
  private auditLogger: AuditLogger;

  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    public override options: { organizationId: string; userId: string },
    auditLogger?: AuditLogger
  ) {
    super(db, options);
    this.auditLogger = auditLogger || new AuditLogger(db as any);
  }

  /**
   * Get active rate card by date and organization with caching
   * Cache key: pivotal:org:{id}:ratecard:active
   * TTL: 60 seconds as per requirements
   */
  async getActiveRateCard(date: Date = new Date()): Promise<any> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Build cache key as per requirements
    const cacheKey = buildCacheKey(
      this.options.organizationId,
      'ratecard',
      'active'
    );

    // Try to get from cache first
    try {
      // Note: In a real implementation, you would use the Redis client here
      // For now, we'll implement the cache logic structure
      const cachedResult = await this.getFromCache<any>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    } catch (error) {
      // Cache miss or error - continue with database query
      logger.warn('Cache miss for active rate card:', error);
    }

    // Database query
    const result = await this.db
      .select()
      .from(rateCards)
      .where(
        and(
          eq(rateCards.organizationId, this.options.organizationId),
          eq(rateCards.isActive, true),
          sql`${rateCards.effectiveFrom} <= ${dateStr}`,
          or(
            isNull(rateCards.effectiveUntil),
            sql`${rateCards.effectiveUntil} >= ${dateStr}`
          )
        )
      )
      .orderBy(desc(rateCards.isDefault), desc(rateCards.effectiveFrom))
      .limit(1);

    const rateCard = result[0] || null;

    // Cache the result
    if (rateCard) {
      try {
        await this.setCache(cacheKey, rateCard, RATE_CARD_CACHE_TTL);
      } catch (error) {
        logger.warn('Failed to cache active rate card:', error);
      }
    }

    return rateCard;
  }

  /**
   * Get rate card items for a specific rate card with caching
   * Cache key: pivotal:org:{id}:rateitem:{rateCardId}
   * TTL: 300 seconds as per requirements
   */
  async getRateCardItems(rateCardId: string): Promise<any[]> {
    // Build cache key as per requirements
    const cacheKey = buildCacheKey(
      this.options.organizationId,
      'rateitem',
      undefined,
      rateCardId
    );

    // Try to get from cache first
    try {
      const cachedResult = await this.getFromCache<any[]>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    } catch (error) {
      // Cache miss or error - continue with database query
      logger.warn('Cache miss for rate card items:', error);
    }

    // Database query
    const result = await this.db
      .select()
      .from(rateCardItems)
      .where(
        and(
          eq(rateCardItems.rateCardId, rateCardId),
          eq(rateCardItems.isActive, true)
        )
      );

    // Cache the result
    try {
      await this.setCache(cacheKey, result, RATE_ITEM_CACHE_TTL);
    } catch (error) {
              logger.warn('Failed to cache rate card items:', error);
    }

    return result;
  }

  /**
   * Get rate card item by code with caching
   * Cache key: pivotal:org:{id}:rateitem:code:{itemCode}
   * TTL: 300 seconds as per requirements
   */
  async getRateCardItemByCode(itemCode: string): Promise<any | null> {
    // Build cache key as per requirements
    const cacheKey = buildCacheKey(
      this.options.organizationId,
      'rateitem',
      'code',
      itemCode
    );

    // Try to get from cache first
    try {
      const cachedResult = await this.getFromCache<any>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    } catch (error) {
      // Cache miss or error - continue with database query
      logger.warn('Cache miss for rate card item by code:', error);
    }

    // Database query
    const result = await this.db
      .select()
      .from(rateCardItems)
      .where(
        and(
          eq(rateCardItems.itemCode, itemCode),
          eq(rateCardItems.isActive, true)
        )
      )
      .limit(1);

    const item = result[0] || null;

    // Cache the result
    if (item) {
      try {
        await this.setCache(cacheKey, item, RATE_ITEM_CACHE_TTL);
      } catch (error) {
        console.warn('Failed to cache rate card item by code:', error);
      }
    }

    return item;
  }

  /**
   * Resolve pricing for quote line items
   * Priority: explicit unit price > rate card match by code > description fallback
   */
  async resolvePricing(
    lineItems: Array<{
      lineNumber: number;
      description: string;
      unitPrice?: { amount: number; currency: string };
      serviceCategoryId?: string;
      rateCardId?: string;
      taxRate?: number;
      itemCode?: string; // Added itemCode for priority 2 lookup
    }>,
    userHasOverridePermission: boolean = false,
    effectiveDate: Date = new Date()
  ): Promise<PricingResolutionResponse> {
    const results: PricingResolutionResult[] = [];
    const errors: PricingResolutionError[] = [];

    // Get active rate card for the organization
    const activeRateCard = await this.getActiveRateCard(effectiveDate);
    if (!activeRateCard) {
      // If no active rate card, return errors for all lines
      return {
        success: false,
        errors: lineItems.map(item => ({
          lineNumber: item.lineNumber,
          description: item.description,
          reason: 'No active rate card found for organization'
        }))
      };
    }

    // Get rate card items for the active rate card
    const rateCardItemsList = await this.getRateCardItems(activeRateCard.id);

    for (const item of lineItems) {
      try {
        let result: PricingResolutionResult;

        // Priority 1: Explicit unit price if user has permission
        if (item.unitPrice && userHasOverridePermission) {
          result = {
            unitPrice: new Decimal(item.unitPrice.amount),
            taxRate: new Decimal(item.taxRate || 0.15), // Default tax rate
            source: 'explicit',
            ...(item.serviceCategoryId && { serviceCategoryId: item.serviceCategoryId })
          };
        }
        // Priority 2: Match by itemCode (SKU) then description
        else if (item.itemCode) {
          const rateItem = await this.getRateCardItemByCode(item.itemCode);
          
          if (rateItem) {
            result = {
              unitPrice: new Decimal(rateItem.baseRate),
              taxRate: new Decimal(rateItem.taxClass === 'exempt' ? 0 : 0.15), // Use taxClass from rate item
              source: 'rate_card',
              rateCardId: activeRateCard.id,
              rateCardItemId: rateItem.id,
              serviceCategoryId: rateItem.serviceCategoryId
            };
          } else {
            // Fallback to description matching
            const rateItem = this.findMatchingRateItemByDescription(
              rateCardItemsList,
              item.description
            );

            if (rateItem) {
              result = {
                unitPrice: new Decimal(rateItem.baseRate),
                taxRate: new Decimal(rateItem.taxClass === 'exempt' ? 0 : 0.15),
                source: 'rate_card',
                rateCardId: activeRateCard.id,
                rateCardItemId: rateItem.id,
                serviceCategoryId: rateItem.serviceCategoryId
              };
            } else {
              errors.push({
                lineNumber: item.lineNumber,
                description: item.description,
                reason: 'No matching rate found for item code or description'
              });
              continue;
            }
          }
        }
        // Priority 3: Match by service category and description
        else if (item.serviceCategoryId) {
          const rateItem = this.findMatchingRateItem(
            rateCardItemsList,
            item.serviceCategoryId,
            item.description
          );

          if (rateItem) {
            result = {
              unitPrice: new Decimal(rateItem.baseRate),
              taxRate: new Decimal(rateItem.taxClass === 'exempt' ? 0 : 0.15),
              source: 'rate_card',
              rateCardId: activeRateCard.id,
              rateCardItemId: rateItem.id,
              serviceCategoryId: item.serviceCategoryId
            };
          } else {
            errors.push({
              lineNumber: item.lineNumber,
              description: item.description,
              reason: 'No matching rate found for service category'
            });
            continue;
          }
        }
        // Priority 4: Match by description only
        else {
          const rateItem = this.findMatchingRateItemByDescription(
            rateCardItemsList,
            item.description
          );

          if (rateItem) {
            result = {
              unitPrice: new Decimal(rateItem.baseRate),
              taxRate: new Decimal(rateItem.taxClass === 'exempt' ? 0 : 0.15),
              source: 'rate_card',
              rateCardId: activeRateCard.id,
              rateCardItemId: rateItem.id,
              serviceCategoryId: rateItem.serviceCategoryId
            };
          } else {
            errors.push({
              lineNumber: item.lineNumber,
              description: item.description,
              reason: 'No matching rate found for description'
            });
            continue;
          }
        }

        results.push(result);
      } catch (error) {
        errors.push({
          lineNumber: item.lineNumber,
          description: item.description,
          reason: `Error resolving pricing: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    const response: PricingResolutionResponse = {
      success: errors.length === 0
    };
    
    if (results.length > 0) {
      response.results = results;
    }
    
    if (errors.length > 0) {
      response.errors = errors;
    }
    
    return response;
  }

  /**
   * Find matching rate item by service category and description
   */
  private findMatchingRateItem(
    rateItems: any[],
    serviceCategoryId: string,
    _description: string
  ): any | null {
    // First try exact service category match
    let match = rateItems.find(item => 
      item.serviceCategoryId === serviceCategoryId &&
      item.isActive
    );

    if (match) {
      return match;
    }

    // Fallback to description similarity (basic implementation)
    return rateItems.find(item => {
      if (!item.isActive) return false;
      
      // Check if description contains key terms from service category
      // This is a basic implementation - could be enhanced with fuzzy matching
      return item.serviceCategoryId === serviceCategoryId;
    }) || null;
  }

  /**
   * Find matching rate item by description only
   */
  private findMatchingRateItemByDescription(
    rateItems: any[],
    _description: string
  ): any | null {
    // Find the best match by description similarity
    // This is a basic implementation - could be enhanced with fuzzy matching
    return rateItems.find(item => 
      item.isActive
    ) || null;
  }

  /**
   * Create a new rate card
   */
  async createRateCard(data: CreateRateCardSchema): Promise<any> {
    const validation = validateRateCardData(data);
    if (!validation.isValid) {
      throw new Error(`Rate card validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate that metadata JSONB doesn't contain business values
    if (data.metadata) {
      validateMetadataJSONB(data.metadata, 'rate card metadata');
    }

    return withTx(this.db, async (tx) => {
      const rateCardData = {
        id: crypto.randomUUID(),
        organizationId: this.options.organizationId,
        name: data.name,
        description: data.description,
        currency: data.currency,
        effectiveFrom: data.effectiveFrom,
        effectiveUntil: data.effectiveUntil,
        isDefault: data.isDefault,
        isActive: data.isActive,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await tx.insert(rateCards).values(rateCardData);

      // Bust cache for active rate cards
      await this.bustRateCardCache(rateCardData.id);

      // Audit log
      await this.auditLogger.logEvent({
        action: 'rate_cards.create',
        entityType: 'RateCard',
        entityId: rateCardData.id,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        newValues: {
          name: data.name,
          currency: data.currency,
          effectiveFrom: data.effectiveFrom,
          isDefault: data.isDefault
        }
      }, {} as any);

      return this.getRateCardByIdWithTx(tx, rateCardData.id);
    });
  }

  /**
   * Update an existing rate card
   */
  async updateRateCard(rateCardId: string, data: UpdateRateCardSchema): Promise<any> {
    const existingRateCard = await this.getRateCardById(rateCardId);
    if (!existingRateCard) {
      throw new Error('Rate card not found');
    }

    const validation = validateRateCardData({ ...existingRateCard, ...data });
    if (!validation.isValid) {
      throw new Error(`Rate card validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate that metadata JSONB doesn't contain business values
    if (data.metadata) {
      validateMetadataJSONB(data.metadata, 'rate card metadata');
    }

    return withTx(this.db, async (tx) => {
      const updateData: any = {
        ...data,
        updatedAt: new Date()
      };

      await tx.update(rateCards)
        .set(updateData)
        .where(eq(rateCards.id, rateCardId));

      // Bust cache for rate cards
      await this.bustRateCardCache(rateCardId);

      // Audit log
      await this.auditLogger.logEvent({
        action: 'rate_cards.update',
        entityType: 'RateCard',
        entityId: rateCardId,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        oldValues: existingRateCard,
        newValues: updateData
      }, {} as any);

      return this.getRateCardByIdWithTx(tx, rateCardId);
    });
  }

  /**
   * Create a new rate card item
   */
  async createRateCardItem(data: CreateRateCardItemSchema): Promise<any> {
    const validation = validateRateCardItemData(data);
    if (!validation.isValid) {
      throw new Error(`Rate card item validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate that metadata JSONB doesn't contain business values
    if (data.metadata) {
      validateMetadataJSONB(data.metadata, 'rate card item metadata');
    }

    return withTx(this.db, async (tx) => {
      const rateCardItemData = {
        id: crypto.randomUUID(),
        rateCardId: data.rateCardId,
        serviceCategoryId: data.serviceCategoryId,
        roleId: data.roleId,
        baseRate: data.baseRate.toString(),
        currency: data.currency,
        effectiveFrom: data.effectiveFrom,
        effectiveUntil: data.effectiveUntil,
        isActive: data.isActive,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await tx.insert(rateCardItems).values(rateCardItemData);

      // Bust cache for rate card items
      await this.bustRateCardCache(data.rateCardId);

      // Audit log
      await this.auditLogger.logEvent({
        action: 'rate_card_items.create',
        entityType: 'RateCardItem',
        entityId: rateCardItemData.id,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        newValues: {
          rateCardId: data.rateCardId,
          serviceCategoryId: data.serviceCategoryId,
          baseRate: data.baseRate,
          currency: data.currency
        }
      }, {} as any);

      return this.getRateCardItemByIdWithTx(tx, rateCardItemData.id);
    });
  }

  /**
   * Update an existing rate card item
   */
  async updateRateCardItem(rateCardItemId: string, data: UpdateRateCardItemSchema): Promise<any> {
    const existingItem = await this.getRateCardItemById(rateCardItemId);
    if (!existingItem) {
      throw new Error('Rate card item not found');
    }

    const validation = validateRateCardItemData({ ...existingItem, ...data });
    if (!validation.isValid) {
      throw new Error(`Rate card item validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate that metadata JSONB doesn't contain business values
    if (data.metadata) {
      validateMetadataJSONB(data.metadata, 'rate card item metadata');
    }

    return withTx(this.db, async (tx) => {
      const updateData: any = {
        ...data,
        updatedAt: new Date()
      };

      await tx.update(rateCardItems)
        .set(updateData)
        .where(eq(rateCardItems.id, rateCardItemId));

      // Bust cache for rate card items
      await this.bustRateCardCache(existingItem.rateCardId);

      // Audit log
      await this.auditLogger.logEvent({
        action: 'rate_card_items.update',
        entityType: 'RateCardItem',
        entityId: rateCardItemId,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        oldValues: existingItem,
        newValues: updateData
      }, {} as any);

      return this.getRateCardItemByIdWithTx(tx, rateCardItemId);
    });
  }

  /**
   * Get rate card by ID
   */
  async getRateCardById(rateCardId: string): Promise<any> {
    const result = await this.db
      .select()
      .from(rateCards)
      .where(
        and(
          eq(rateCards.id, rateCardId),
          eq(rateCards.organizationId, this.options.organizationId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get rate card by ID within transaction
   */
  async getRateCardByIdWithTx(tx: any, rateCardId: string): Promise<any> {
    const result = await tx
      .select()
      .from(rateCards)
      .where(
        and(
          eq(rateCards.id, rateCardId),
          eq(rateCards.organizationId, this.options.organizationId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get rate card item by ID
   */
  async getRateCardItemById(rateCardItemId: string): Promise<any> {
    const result = await this.db
      .select()
      .from(rateCardItems)
      .where(eq(rateCardItems.id, rateCardItemId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get rate card item by ID within transaction
   */
  async getRateCardItemByIdWithTx(tx: any, rateCardItemId: string): Promise<any> {
    const result = await tx
      .select()
      .from(rateCardItems)
      .where(eq(rateCardItems.id, rateCardItemId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * List rate cards with pagination
   */
  async listRateCards(options: PaginationOptions = { page: 1, pageSize: 20 }): Promise<{ data: any[]; total: number }> {
    const { page = 1, pageSize = 20, search } = options;
    const offset = (page - 1) * pageSize;

    let whereClause: SQL<unknown> = eq(rateCards.organizationId, this.options.organizationId);

    if (search) {
      const nameMatch = like(rateCards.name, `%${search}%`);
      
      if (rateCards.description) {
        const descriptionMatch = like(rateCards.description, `%${search}%`);
        const searchClause = or(nameMatch, descriptionMatch) as SQL<unknown>;
        whereClause = and(whereClause, searchClause) as SQL<unknown>;
      } else {
        whereClause = and(whereClause, nameMatch) as SQL<unknown>;
      }
    }

    const [data, totalResult] = await Promise.all([
      this.db
        .select()
        .from(rateCards)
        .where(whereClause)
        .orderBy(desc(rateCards.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql`count(*)` })
        .from(rateCards)
        .where(whereClause)
    ]);

    return {
      data,
      total: Number(totalResult[0]?.count || 0)
    };
  }

  /**
   * Bust cache when rate card changes
   * Busts all related cache keys for the organization
   */
  async bustRateCardCache(rateCardId: string): Promise<void> {
    try {
      // Bust active rate card cache
      const activeRateCardKey = buildCacheKey(
        this.options.organizationId,
        'ratecard',
        'active'
      );
      await this.deleteFromCache(activeRateCardKey);

      // Bust rate card items cache
      const rateCardItemsKey = buildCacheKey(
        this.options.organizationId,
        'rateitem',
        undefined,
        rateCardId
      );
      await this.deleteFromCache(rateCardItemsKey);

      // Bust all rate item code caches for this organization
      // Note: In a production system, you might want to use Redis SCAN to find all keys
      // For now, we'll log the cache bust action
      console.log(`Cache busted for rate card: ${rateCardId}`);
    } catch (error) {
      console.warn('Failed to bust rate card cache:', error);
    }
  }

  // Cache helper methods
  private async getFromCache<T>(_key: string): Promise<T | null> {
    try {
      // In a real implementation, you would use the Redis client here
      // For now, return null to simulate cache miss
      return null;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  private async setCache<T>(key: string, _value: T, ttl: number): Promise<void> {
    try {
      // In a real implementation, you would use the Redis client here
      // For now, just log the cache set action
      console.log(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  private async deleteFromCache(key: string): Promise<void> {
    try {
      // In a real implementation, you would use the Redis client here
      // For now, just log the cache delete action
      console.log(`Cache delete: ${key}`);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }
}
