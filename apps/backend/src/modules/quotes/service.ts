import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import { quotes, quoteLineItems } from '../../lib/schema.js';
import { eq, and, isNull, desc, asc, like, or, gte, lte } from 'drizzle-orm';
import { calculateQuote, calculateQuoteDebug } from '@pivotal-flow/shared/pricing';
import { throwIfMonetaryInMetadata } from '@pivotal-flow/shared/guards/jsonbMonetaryGuard';
import { Decimal } from 'decimal.js';
import { QuoteNumberGenerator } from './quote-number.js';
import { 
  QuoteStatus, 
  isValidStatusTransition, 
  validateQuoteData,
  type CreateQuoteSchema,
  type UpdateQuoteSchema,
  type QuoteStatusTransitionSchema
} from './schemas.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { withTx } from '../../lib/withTx.js';
import { BaseRepository } from '../../lib/repo.base.js';
import type { PaginationOptions } from '../../lib/repo.base.js';
import { RateCardService } from '../rate-cards/service.js';
import { PermissionService } from '../permissions/service.js';
import { guardTypedFilters } from '@pivotal-flow/shared';
import { QuoteVersioningService } from '../../lib/quote-versioning.js';
import { QuoteLockingService } from '../../lib/quote-locking.js';
import { quoteMetrics } from '@pivotal-flow/shared/metrics/quote-metrics';

/**
 * Quote Service
 * 
 * Handles all quote business logic including:
 * - Quote creation and updates
 * - Status transitions with validation
 * - Automatic recalculation on changes
 * - Audit logging for all operations
 * - Quote number generation
 */
export class QuoteService extends BaseRepository {
  private quoteNumberGenerator: QuoteNumberGenerator;
  private auditLogger: AuditLogger;
  private rateCardService: RateCardService;
  private permissionService: PermissionService;
  private versioningService: QuoteVersioningService;
  private lockingService: QuoteLockingService;

  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    public override options: { organizationId: string; userId: string },
    auditLogger?: AuditLogger
  ) {
    super(db, options);
    this.quoteNumberGenerator = new QuoteNumberGenerator(db);
    this.auditLogger = auditLogger || new AuditLogger(db as any);
    this.rateCardService = new RateCardService(db, options, auditLogger);
    this.permissionService = new PermissionService(db, options);
    this.versioningService = new QuoteVersioningService(db);
    this.lockingService = new QuoteLockingService(db);
  }

  /**
   * Create a new quote with line items
   */
  async createQuote(data: z.infer<typeof CreateQuoteSchema>): Promise<any> {
    const timer = quoteMetrics.startQuoteTimer(this.options.organizationId, 'create');
    
    try {
      // Validate quote data
      const validation = validateQuoteData(data);
      if (!validation.isValid) {
        quoteMetrics.recordQuoteError(this.options.organizationId, 'create', 'validation');
        throw new Error(`Quote validation failed: ${validation.errors.join(', ')}`);
      }

      // Validate that line item metadata JSONB doesn't contain business values
      for (const item of data.lineItems) {
        if (item.metadata) {
          throwIfMonetaryInMetadata(item.metadata);
        }
      }

    return withTx(this.db, async (tx) => {
      // Generate quote number
      const quoteNumber = await this.quoteNumberGenerator.generateQuoteNumber(this.options.organizationId);

      // Check if user has permission to override prices
      const canOverridePrice = await this.permissionService.canCurrentUserOverrideQuotePrice();
      
      // Resolve pricing for line items using rate cards
      const pricingResolution = await this.rateCardService.resolvePricing(
        data.lineItems.map(item => {
          const mappedItem: any = {
            lineNumber: item.lineNumber,
            description: item.description,
            serviceCategoryId: item.serviceCategoryId,
            rateCardId: item.rateCardId,
            taxRate: item.taxRate,
            itemCode: item.sku, // Pass SKU as itemCode for priority 2 lookup
            unit: item.unit // Pass unit for rate item defaults
          };
          
          if (item.unitPrice) {
            mappedItem.unitPrice = {
              amount: item.unitPrice.amount.toNumber(),
              currency: item.unitPrice.currency
            };
          }
          
          return mappedItem;
        }),
        canOverridePrice.hasPermission,
        new Date(data.validFrom)
      );

      if (!pricingResolution.success || !pricingResolution.results) {
        const errorDetails = pricingResolution.errors?.map(e => `Line ${e.lineNumber}: ${e.reason}`).join('; ');
        throw new Error(`Pricing resolution failed: ${errorDetails}`);
      }

      // At this point, we know results exists and is an array
      const results = pricingResolution.results;

      // Calculate totals using the pricing library with resolved prices
      const calculationInput = {
        lineItems: data.lineItems.map((item, index) => {
          const resolvedPricing = results[index];
          if (!resolvedPricing) {
            throw new Error(`No pricing resolved for line item ${index + 1}`);
          }
          return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: { 
              amount: new Decimal(resolvedPricing.unitPrice.toNumber()), 
              currency: data.currency 
            },
            unit: resolvedPricing.unit, // Use resolved unit from rate card
            serviceType: item.type,
            taxInclusive: item.taxInclusive ?? false, // New field
            taxRate: resolvedPricing.taxRate.toNumber(),
            discountType: item.discountType as 'percentage' | 'fixed_amount' | 'per_unit',
            discountValue: item.discountValue,
            percentageDiscount: item.percentageDiscount, // New field
            fixedDiscount: item.fixedDiscount ? { 
              amount: new Decimal(item.fixedDiscount.amount), 
              currency: data.currency 
            } : undefined, // New field
            isTaxExempt: resolvedPricing.taxRate.toNumber() === 0
          };
        }),
        currency: data.currency,
        quoteDiscount: data.discountType && data.discountValue ? {
          type: data.discountType as 'percentage' | 'fixed_amount' | 'per_unit',
          value: data.discountValue,
          description: 'Quote-level discount'
        } : undefined
      };

      const calculation = calculateQuote(calculationInput);

      // Create quote record
      const quoteData = {
        id: crypto.randomUUID(),
        organizationId: this.options.organizationId,
        quoteNumber,
        customerId: data.customerId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: QuoteStatus.DRAFT,
        type: data.type,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        currency: data.currency,
        exchangeRate: data.exchangeRate.toString(),
        subtotal: calculation.totals.subtotal.amount.toString(),
        taxRate: data.taxRate.toString(),
        taxAmount: calculation.totals.taxAmount.amount.toString(),
        discountType: data.discountType,
        discountValue: data.discountValue ? data.discountValue.toString() : '0',
        discountAmount: calculation.totals.discountAmount.amount.toString(),
        totalAmount: calculation.totals.grandTotal.amount.toString(),
        termsConditions: data.termsConditions,
        notes: data.notes,
        internalNotes: data.internalNotes,
        createdBy: this.options.userId,
        metadata: {}
      };

      await tx.insert(quotes).values(quoteData);

      // Create line items
      const lineItemData = data.lineItems.map((item, index) => {
        const resolvedPricing = results[index];
        if (!resolvedPricing) {
          throw new Error(`No pricing resolved for line item ${index + 1}`);
        }
        return {
          id: crypto.randomUUID(),
          quoteId: quoteData.id,
          lineNumber: item.lineNumber,
          type: item.type,
          sku: resolvedPricing.itemCode || item.sku, // Use resolved itemCode or original SKU
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: resolvedPricing.unitPrice.toString(),
          unitCost: item.unitCost?.amount.toString(),
          unit: resolvedPricing.unit, // New field
          taxInclusive: item.taxInclusive ?? false, // New field
          taxRate: resolvedPricing.taxRate.toString(),
          taxAmount: calculation.lineCalculations[index]?.taxAmount.amount.toString() ?? '0',
          discountType: item.discountType,
          discountValue: item.discountValue ? item.discountValue.toString() : '0',
          discountAmount: calculation.lineCalculations[index]?.discountAmount.amount.toString() ?? '0',
          subtotal: calculation.lineCalculations[index]?.subtotal.amount.toString() ?? '0',
          totalAmount: calculation.lineCalculations[index]?.totalAmount.amount.toString() ?? '0',
          serviceCategoryId: resolvedPricing.serviceCategoryId || item.serviceCategoryId,
          rateCardId: resolvedPricing.rateCardId || item.rateCardId,
          metadata: item.metadata
        };
      });

      await tx.insert(quoteLineItems).values(lineItemData);

      // Audit log
      await this.auditLogger.logEvent({
        action: 'quotes.create',
        entityType: 'Quote',
        entityId: quoteData.id,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        newValues: {
          quoteNumber,
          title: data.title,
          status: QuoteStatus.DRAFT,
          totalAmount: calculation.totals.grandTotal.amount.toNumber(),
          lineItemsCount: data.lineItems.length
        }
      }, {} as any);

      return this.getQuoteByIdWithTx(tx, quoteData.id);
    });
    
    // Record success metrics
    quoteMetrics.recordQuoteCreated(this.options.organizationId, QuoteStatus.DRAFT);
    timer();
    
  } catch (error) {
    quoteMetrics.recordQuoteError(this.options.organizationId, 'create', 'unknown');
    timer();
    throw error;
  }
}

/**
 * Update quote header and/or line items with recalculation
 */
  async updateQuote(quoteId: string, data: z.infer<typeof UpdateQuoteSchema>): Promise<any> {
    const timer = quoteMetrics.startQuoteTimer(this.options.organizationId, 'update');
    
    try {
      // Get existing quote
      const existingQuote = await this.getQuoteById(quoteId);
      if (!existingQuote) {
        quoteMetrics.recordQuoteError(this.options.organizationId, 'update', 'not_found');
        throw new Error('Quote not found');
      }

      // Check quote locking and permissions
      const lockResult = await this.lockingService.checkQuoteLock({
        quoteId,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        newData: data
      });

      if (lockResult.isLocked && !lockResult.canForceEdit) {
        throw new Error(lockResult.reason || 'Quote is locked and cannot be edited');
      }

      // Check if material changes require versioning
      const hasMaterialChanges = await this.versioningService.hasMaterialChanges(quoteId, data);
      const requiresVersioning = lockResult.requiresVersioning || hasMaterialChanges;

      return withTx(this.db, async (tx) => {
      // Create version if required
      if (requiresVersioning) {
        const versionData = {
          quoteId,
          organizationId: this.options.organizationId,
          customerId: existingQuote.customerId,
          projectId: existingQuote.projectId,
          title: existingQuote.title,
          description: existingQuote.description,
          status: existingQuote.status,
          type: existingQuote.type,
          validFrom: existingQuote.validFrom,
          validUntil: existingQuote.validUntil,
          currency: existingQuote.currency,
          exchangeRate: existingQuote.exchangeRate,
          subtotal: existingQuote.subtotal,
          taxRate: existingQuote.taxRate,
          taxAmount: existingQuote.taxAmount,
          discountType: existingQuote.discountType,
          discountValue: existingQuote.discountValue,
          discountAmount: existingQuote.discountAmount,
          totalAmount: existingQuote.totalAmount,
          termsConditions: existingQuote.termsConditions,
          notes: existingQuote.notes,
          internalNotes: existingQuote.internalNotes,
          createdBy: existingQuote.createdBy,
          approvedBy: existingQuote.approvedBy,
          approvedAt: existingQuote.approvedAt,
          sentAt: existingQuote.sentAt,
          acceptedAt: existingQuote.acceptedAt,
          expiresAt: existingQuote.expiresAt,
          metadata: existingQuote.metadata,
          lineItems: existingQuote.lineItems.map((item: any) => ({
            lineNumber: item.lineNumber,
            type: item.type,
            sku: item.sku,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost,
            unit: item.unit,
            taxInclusive: item.taxInclusive,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            discountType: item.discountType,
            discountValue: item.discountValue,
            discountAmount: item.discountAmount,
            subtotal: item.subtotal,
            totalAmount: item.totalAmount,
            serviceCategoryId: item.serviceCategoryId,
            rateCardId: item.rateCardId,
            metadata: item.metadata
          }))
        };

        await this.versioningService.createVersion(versionData);
      }

      const updateData: any = {};

      // Update header fields if provided
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.validFrom !== undefined) updateData.validFrom = data.validFrom;
      if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.exchangeRate !== undefined) updateData.exchangeRate = data.exchangeRate.toString();
      if (data.taxRate !== undefined) updateData.taxRate = data.taxRate.toString();
      if (data.discountType !== undefined) updateData.discountType = data.discountType;
      if (data.discountValue !== undefined) updateData.discountValue = data.discountValue.toString();
      if (data.termsConditions !== undefined) updateData.termsConditions = data.termsConditions;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;

          // Update line items if provided
    if (data.lineItems) {
      // Validate that line item metadata JSONB doesn't contain business values
      for (const item of data.lineItems) {
        if (item.metadata) {
          throwIfMonetaryInMetadata(item.metadata);
        }
      }

      // Delete existing line items
      await tx.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId));

      // Create new line items
      const lineItemData = data.lineItems.map(item => ({
          id: crypto.randomUUID(),
          quoteId,
          lineNumber: item.lineNumber,
          type: item.type,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.amount.toString(),
          unitCost: item.unitCost?.amount.toString(),
          taxRate: item.taxRate.toString(),
          discountType: item.discountType,
          discountValue: item.discountValue ? item.discountValue.toString() : '0',
          subtotal: '0', // Will be calculated later
          totalAmount: '0', // Will be calculated later
          serviceCategoryId: item.serviceCategoryId,
          rateCardId: item.rateCardId,
          metadata: item.metadata
        }));

        await tx.insert(quoteLineItems).values(lineItemData);
      }

      // Recalculate totals
      const updatedQuote = await this.getQuoteByIdWithTx(tx, quoteId);
      const calculationInput = {
        lineItems: updatedQuote.lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: { amount: new Decimal(item.unitPrice), currency: updatedQuote.currency },
          unit: 'hours',
          serviceType: item.type,
          taxRate: item.taxRate,
          discountType: item.discountType,
          discountValue: item.discountValue,
          isTaxExempt: item.taxRate === 0
        })),
        currency: updatedQuote.currency,
        quoteDiscount: updatedQuote.discountType && updatedQuote.discountValue ? {
          type: updatedQuote.discountType,
          value: updatedQuote.discountValue,
          description: 'Quote-level discount'
        } : undefined
      };

      const calculation = calculateQuote(calculationInput);

      // Update totals
      updateData.subtotal = calculation.totals.subtotal.amount.toString();
      updateData.taxAmount = calculation.totals.taxAmount.amount.toString();
      updateData.discountAmount = calculation.totals.discountAmount.amount.toString();
      updateData.totalAmount = calculation.totals.grandTotal.amount.toString();
      updateData.updatedAt = new Date();

      await tx.update(quotes).set(updateData).where(eq(quotes.id, quoteId));

      // Update line item totals
      for (let i = 0; i < updatedQuote.lineItems.length; i++) {
        const lineItem = updatedQuote.lineItems[i];
        const calc = calculation.lineCalculations[i];
        
        await tx.update(quoteLineItems)
          .set({
            taxAmount: calc?.taxAmount.amount.toString() ?? '0',
            discountAmount: calc?.discountAmount.amount.toString() ?? '0',
            subtotal: calc?.subtotal.amount.toString() ?? '0',
            totalAmount: calc?.totalAmount.amount.toString() ?? '0',
            updatedAt: new Date()
          })
          .where(eq(quoteLineItems.id, lineItem.id));
      }

      // Audit log
      await this.auditLogger.logEvent({
        action: 'quotes.update',
        entityType: 'Quote',
        entityId: quoteId,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        oldValues: {
          title: existingQuote.title,
          totalAmount: existingQuote.totalAmount
        },
        newValues: {
          title: updateData.title || existingQuote.title,
          totalAmount: calculation.totals.grandTotal.amount.toNumber(),
          lineItemsCount: data.lineItems?.length || existingQuote.lineItems.length
        }
      }, {} as any);

      return this.getQuoteByIdWithTx(tx, quoteId);
    });
    
    // Record success metrics
    quoteMetrics.recordQuoteUpdated(this.options.organizationId, existingQuote.status);
    if (data.lineItems) {
      quoteMetrics.recordQuoteRecalc(this.options.organizationId, 'line_items_update');
    }
    timer();
    
  } catch (error) {
    quoteMetrics.recordQuoteError(this.options.organizationId, 'update', 'unknown');
    timer();
    throw error;
  }
}

  /**
   * Transition quote status with validation
   */
  async transitionStatus(quoteId: string, transition: z.infer<typeof QuoteStatusTransitionSchema>): Promise<any> {
    const quote = await this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Validate status transition
    if (!isValidStatusTransition(quote.status as QuoteStatus, transition.status as QuoteStatus)) {
      throw new Error(`Invalid status transition from ${quote.status} to ${transition.status}`);
    }

    return withTx(this.db, async (tx) => {
      const updateData: any = {
        status: transition.status,
        updatedAt: new Date()
      };

      // Set status-specific timestamps
      switch (transition.status) {
        case QuoteStatus.APPROVED:
          updateData.approvedBy = this.options.userId;
          updateData.approvedAt = new Date();
          break;
        case QuoteStatus.SENT:
          updateData.sentAt = new Date();
          break;
        case QuoteStatus.ACCEPTED:
          updateData.acceptedAt = new Date();
          break;
      }

      await tx.update(quotes).set(updateData).where(eq(quotes.id, quoteId));

      // Audit log
      await this.auditLogger.logEvent({
        action: 'quotes.status_transition',
        entityType: 'Quote',
        entityId: quoteId,
        organizationId: this.options.organizationId,
        userId: this.options.userId,
        oldValues: { status: quote.status },
        newValues: { 
          status: transition.status,
          notes: transition.notes
        }
      }, {} as any);

      return this.getQuoteByIdWithTx(tx, quoteId);
    });
  }

  /**
   * Get quote by ID using transaction context
   */
  private async getQuoteByIdWithTx(tx: any, quoteId: string): Promise<any> {
    const result = await tx
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.organizationId, this.options.organizationId),
          isNull(quotes.deletedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const quote = result[0];

    // Get line items
    const lineItems = await tx
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, quoteId))
      .orderBy(asc(quoteLineItems.lineNumber));

    return {
      ...quote,
      lineItems
    };
  }

  /**
   * Get quote by ID with line items
   */
  async getQuoteById(quoteId: string): Promise<any> {
    const result = await this.db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.organizationId, this.options.organizationId),
          isNull(quotes.deletedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const quote = result[0];

    // Get line items
    const lineItems = await this.db
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, quoteId))
      .orderBy(asc(quoteLineItems.lineNumber));

    return {
      ...quote,
      lineItems
    };
  }

  /**
   * List quotes with pagination and filters
   */
  async listQuotes(
    pagination: PaginationOptions,
    filters: any = {}
  ): Promise<{ quotes: any[]; pagination: any }> {
    const filtersCount = Object.keys(filters).filter(key => filters[key] !== undefined).length;
    const timer = quoteMetrics.startQuoteListTimer(this.options.organizationId, pagination.pageSize, filtersCount);
    
    try {
      // Guard against JSONB filter misuse
      const check = guardTypedFilters(filters);
      if (!check.ok) {
        quoteMetrics.recordQuoteError(this.options.organizationId, 'list', 'jsonb_filter');
        const e: any = new Error(check.reason);
        e.statusCode = 400;
        e.code = "JSONB_FILTER_FORBIDDEN";
        throw e;
      }

    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    // Build where clause
    const whereConditions = [
      eq(quotes.organizationId, this.options.organizationId),
      isNull(quotes.deletedAt)
    ];

    if (filters.status) {
      whereConditions.push(eq(quotes.status, filters.status));
    }

    if (filters.customerId) {
      whereConditions.push(eq(quotes.customerId, filters.customerId));
    }

    if (filters.projectId) {
      whereConditions.push(eq(quotes.projectId, filters.projectId));
    }

    if (filters.type) {
      whereConditions.push(eq(quotes.type, filters.type));
    }

    if (filters.q) {
      whereConditions.push(
        or(
          like(quotes.title, `%${filters.q}%`),
          like(quotes.description, `%${filters.q}%`),
          like(quotes.quoteNumber, `%${filters.q}%`)
        )!
      );
    }

    if (filters.validFrom) {
      whereConditions.push(gte(quotes.validFrom, filters.validFrom));
    }

    if (filters.validUntil) {
      whereConditions.push(lte(quotes.validUntil, filters.validUntil));
    }

    if (filters.createdBy) {
      whereConditions.push(eq(quotes.createdBy, filters.createdBy));
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: quotes.id })
      .from(quotes)
      .where(and(...whereConditions));

    const total = totalResult.length;

    // Get quotes with pagination
    const quotesResult = await this.db
      .select()
      .from(quotes)
      .where(and(...whereConditions))
      .orderBy(desc(quotes.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get line items for each quote
    const quotesWithLineItems = await Promise.all(
      quotesResult.map(async (quote) => {
        const lineItems = await this.db
          .select()
          .from(quoteLineItems)
          .where(eq(quoteLineItems.quoteId, quote['id']))
          .orderBy(asc(quoteLineItems.lineNumber));

        return {
          ...quote,
          lineItems
        };
      })
    );

    return {
      quotes: quotesWithLineItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
    
    // Record success metrics
    const filtersApplied = Object.keys(filters).filter(key => filters[key] !== undefined).join(',');
    quoteMetrics.recordQuoteListed(this.options.organizationId, filtersApplied || 'none');
    timer();
    
  } catch (error) {
    quoteMetrics.recordQuoteError(this.options.organizationId, 'list', 'unknown');
    timer();
    throw error;
  }
}

/**
 * Delete quote (soft delete)
 */
  async deleteQuote(quoteId: string): Promise<void> {
    const quote = await this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Only allow deletion of draft quotes
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new Error('Only draft quotes can be deleted');
    }

    await this.db
      .update(quotes)
      .set({ deletedAt: new Date() })
      .where(eq(quotes.id, quoteId));

    // Audit log
    await this.auditLogger.logEvent({
      action: 'quotes.delete',
      entityType: 'Quote',
      entityId: quoteId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      oldValues: { status: quote.status, title: quote.title }
    }, {} as any);
  }

  /**
   * Get all versions of a quote
   */
  async getQuoteVersions(quoteId: string): Promise<any[]> {
    return this.versioningService.getQuoteVersions(quoteId, this.options.organizationId);
  }

  /**
   * Get a specific version of a quote with line items
   */
  async getQuoteVersion(quoteId: string, versionId: string): Promise<any | null> {
    return this.versioningService.getQuoteVersion(quoteId, versionId, this.options.organizationId);
  }

  /**
   * Calculate quote with debug information
   */
  async calculateQuoteDebug(input: z.infer<typeof CreateQuoteSchema>): Promise<any> {
    // Validate quote data
    const validation = validateQuoteData(input);
    if (!validation.isValid) {
      throw new Error(`Quote validation failed: ${validation.errors.join(', ')}`);
    }

    // Resolve pricing from rate cards
    const permissionCheck = await this.permissionService.hasPermission(this.options.userId, 'quotes.override_price');
    const pricingResolution = await this.rateCardService.resolvePricing(
      input.lineItems.map(item => ({
        lineNumber: item.lineNumber,
        description: item.description,
        ...(item.unitPrice && {
          unitPrice: {
            amount: item.unitPrice.amount.toNumber(),
            currency: item.unitPrice.currency
          }
        }),
        ...(item.serviceCategoryId && { serviceCategoryId: item.serviceCategoryId }),
        ...(item.rateCardId && { rateCardId: item.rateCardId }),
        ...(item.taxRate && { taxRate: item.taxRate }),
        ...(item.sku && { itemCode: item.sku }),
        ...(item.unit && { unit: item.unit })
      })),
      permissionCheck.hasPermission,
      new Date(input.validFrom)
    );

    if (!pricingResolution.success || !pricingResolution.results) {
      const errorDetails = pricingResolution.errors?.map(e => `Line ${e.lineNumber}: ${e.reason}`).join('; ');
      throw new Error(`Pricing resolution failed: ${errorDetails}`);
    }

    // At this point, we know results exists and is an array
    const results = pricingResolution.results;

    // Calculate totals using the pricing library with resolved prices
    const calculationInput = {
      lineItems: input.lineItems.map((item, index) => {
        const resolvedPricing = results[index];
        if (!resolvedPricing) {
          throw new Error(`No pricing resolved for line item ${index + 1}`);
        }
                            return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: { 
              amount: new Decimal(resolvedPricing.unitPrice.toNumber()), 
              currency: input.currency 
            },
            unit: resolvedPricing.unit, // Use resolved unit from rate card
            serviceType: item.type,
            taxInclusive: item.taxInclusive ?? false, // New field
            taxRate: resolvedPricing.taxRate.toNumber(),
            discountType: item.discountType as 'percentage' | 'fixed_amount' | 'per_unit',
            discountValue: item.discountValue,
            percentageDiscount: item.percentageDiscount, // New field
            fixedDiscount: item.fixedDiscount ? { 
              amount: new Decimal(item.fixedDiscount.amount), 
              currency: input.currency 
            } : undefined, // New field
            isTaxExempt: resolvedPricing.taxRate.toNumber() === 0
          };
      }),
      currency: input.currency,
      quoteDiscount: input.discountType && input.discountValue ? {
        type: input.discountType as 'percentage' | 'fixed_amount' | 'per_unit',
        value: input.discountValue,
        description: 'Quote-level discount'
      } : undefined
    };

    const debugCalculation = calculateQuoteDebug(calculationInput);
    const calculation = calculateQuote(calculationInput);

    return {
      success: true,
      debug: debugCalculation,
      calculation
    };
  }
}
