import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { z } from 'zod';
import { quotes, quoteLineItems } from '../../lib/schema.js';
import { eq, and, isNull, desc, asc, like, or, gte, lte } from 'drizzle-orm';
// Temporary mock for calculateQuote until import issue is resolved
function calculateQuote(input: any) {
  // Mock implementation - will be replaced with real import
  const lineItems = input.lineItems || [];
  
  const lineCalculations = lineItems.map((item: any) => {
    const quantity = new Decimal(item.quantity || 1);
    const unitPrice = new Decimal(item.unitPrice?.amount || 0);
    const subtotal = quantity.mul(unitPrice);
    const taxRate = new Decimal(item.taxRate || 0);
    const taxAmount = subtotal.mul(taxRate);
    const discountAmount = new Decimal(0);
    const totalAmount = subtotal.add(taxAmount).sub(discountAmount);
    
    return {
      subtotal: { amount: subtotal },
      taxAmount: { amount: taxAmount },
      discountAmount: { amount: discountAmount },
      totalAmount: { amount: totalAmount }
    };
  });
  
  const subtotal = lineCalculations.reduce((sum: any, calc: any) => sum.add(calc.subtotal.amount), new Decimal(0));
  const taxAmount = lineCalculations.reduce((sum: any, calc: any) => sum.add(calc.taxAmount.amount), new Decimal(0));
  const discountAmount = new Decimal(0);
  const grandTotal = subtotal.add(taxAmount).sub(discountAmount);
  
  return {
    lineCalculations,
    totals: {
      subtotal: { amount: subtotal },
      taxAmount: { amount: taxAmount },
      discountAmount: { amount: discountAmount },
      grandTotal: { amount: grandTotal }
    }
  };
}
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

  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    public override options: { organizationId: string; userId: string },
    auditLogger?: AuditLogger
  ) {
    super(db, options);
    this.quoteNumberGenerator = new QuoteNumberGenerator(db);
    this.auditLogger = auditLogger || new AuditLogger(db as any);
  }

  /**
   * Create a new quote with line items
   */
  async createQuote(data: z.infer<typeof CreateQuoteSchema>): Promise<any> {
    // Validate quote data
    const validation = validateQuoteData(data);
    if (!validation.isValid) {
      throw new Error(`Quote validation failed: ${validation.errors.join(', ')}`);
    }

    return withTx(this.db, async (tx) => {
      // Generate quote number
      const quoteNumber = await this.quoteNumberGenerator.generateQuoteNumber(this.options.organizationId);

      // Calculate totals using the pricing library
      const calculationInput = {
        lineItems: data.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: { amount: item.unitPrice.amount, currency: data.currency },
          unit: 'hours', // Default unit
          serviceType: item.type,
          taxRate: item.taxRate,
          discountType: item.discountType as 'percentage' | 'fixed_amount' | 'per_unit',
          discountValue: item.discountValue,
          isTaxExempt: item.taxRate === 0
        })),
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
      const lineItemData = data.lineItems.map((item, index) => ({
        id: crypto.randomUUID(),
        quoteId: quoteData.id,
        lineNumber: item.lineNumber,
        type: item.type,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.amount.toString(),
        unitCost: item.unitCost?.amount.toString(),
        taxRate: item.taxRate.toString(),
        taxAmount: calculation.lineCalculations[index].taxAmount.amount.toString(),
        discountType: item.discountType,
        discountValue: item.discountValue ? item.discountValue.toString() : '0',
        discountAmount: calculation.lineCalculations[index].discountAmount.amount.toString(),
        subtotal: calculation.lineCalculations[index].subtotal.amount.toString(),
        totalAmount: calculation.lineCalculations[index].totalAmount.amount.toString(),
        serviceCategoryId: item.serviceCategoryId,
        rateCardId: item.rateCardId,
        metadata: item.metadata
      }));

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
  }

  /**
   * Update quote header and/or line items with recalculation
   */
  async updateQuote(quoteId: string, data: z.infer<typeof UpdateQuoteSchema>): Promise<any> {
    // Get existing quote
    const existingQuote = await this.getQuoteById(quoteId);
    if (!existingQuote) {
      throw new Error('Quote not found');
    }

    // Validate status allows updates
    if (![QuoteStatus.DRAFT, QuoteStatus.PENDING].includes(existingQuote.status)) {
      throw new Error('Quote cannot be updated in current status');
    }

    return withTx(this.db, async (tx) => {
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
            taxAmount: calc.taxAmount.amount.toString(),
            discountAmount: calc.discountAmount.amount.toString(),
            subtotal: calc.subtotal.amount.toString(),
            totalAmount: calc.totalAmount.amount.toString(),
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
          .where(eq(quoteLineItems.quoteId, quote.id))
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
}
