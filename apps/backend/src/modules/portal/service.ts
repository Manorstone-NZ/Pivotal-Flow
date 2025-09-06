/**
 * Portal Service
 * 
 * Service for customer portal APIs with strict security isolation
 */

import { eq, and, isNull, desc, asc, count, gte, lte, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { FastifyInstance } from 'fastify';

import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { BaseRepository } from '../../lib/repo.base.js';
import { 
  quotes, 
  quoteLineItems, 
  invoices, 
  invoiceLineItems,
  users 
} from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';

import {
  PORTAL_PERMISSIONS,
  PORTAL_CONFIG
} from './constants.js';
import type {
  PortalUserContext,
  PortalQuote,
  PortalQuoteDetail,
  PortalQuoteLineItem,
  PortalInvoice,
  PortalInvoiceDetail,
  PortalInvoiceLineItem,
  PortalTimeEntrySummary,
  PortalQuoteFilters,
  PortalInvoiceFilters,
  PortalTimeEntryFilters,
  PortalPaginatedResponse,
  PortalSecurityViolation
} from './types.js';


/**
 * Portal Service
 * 
 * Provides read-only access to customer data with strict isolation
 */
export class PortalService extends BaseRepository {
  private permissionService: PermissionService;
  private auditLogger: AuditLogger;
  private userContext: PortalUserContext;

  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    userContext: PortalUserContext,
    fastify: FastifyInstance
  ) {
    super(db, {
      organizationId: userContext.organizationId,
      userId: userContext.userId
    });

    this.userContext = userContext;
    // Note: fastify parameter available for future use
    
    this.permissionService = new PermissionService(db, {
      organizationId: userContext.organizationId,
      userId: userContext.userId
    });
    
    this.auditLogger = new AuditLogger(fastify);
  }

  /**
   * Validate that the current user can access portal APIs
   */
  private async validatePortalAccess(): Promise<void> {
    // Verify user is external customer type
    if (this.userContext.userType !== 'external_customer') {
      await this.logSecurityViolation({
        violationType: 'unauthorized_access',
        attemptedAction: 'portal_access',
        attemptedResource: 'portal'
      });
      throw new Error('Portal access is only available to external customer users');
    }

    // Verify user exists and is linked to the claimed customer
    const user = await this.db
      .select({
        id: users.id,
        customerId: users.customerId,
        userType: users.userType,
        organizationId: users.organizationId
      })
      .from(users)
      .where(
        and(
          eq(users.id, this.userContext.userId),
          eq(users.organizationId, this.userContext.organizationId),
          eq(users.customerId, this.userContext.customerId),
          eq(users.userType, 'external_customer'),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    if (user.length === 0) {
      await this.logSecurityViolation({
        violationType: 'cross_customer',
        attemptedAction: 'portal_access',
        attemptedResource: 'user_validation'
      });
      throw new Error('User not found or not authorized for portal access');
    }
  }

  /**
   * Log security violations for audit trail
   */
  private async logSecurityViolation(violation: Omit<PortalSecurityViolation, 'userContext' | 'timestamp'>): Promise<void> {
    const fullViolation: PortalSecurityViolation = {
      ...violation,
      userContext: this.userContext,
      timestamp: new Date().toISOString()
    };

    await this.auditLogger.logEvent({
      action: 'security_violation',
      entityType: 'portal',
      entityId: violation.attemptedResourceId || 'unknown',
      organizationId: this.userContext.organizationId,
      userId: this.userContext.userId,
      metadata: fullViolation as unknown as Record<string, unknown>
    });

    // Increment metrics counter
    // TODO: Implement metrics incrementing when Prometheus integration is added
  }

  /**
   * Get quotes for the customer with filtering and pagination
   */
  async getQuotes(filters: PortalQuoteFilters): Promise<PortalPaginatedResponse<PortalQuote>> {
    await this.validatePortalAccess();

    // Check permission
    const canViewQuotes = await this.permissionService.hasPermission(
      this.userContext.userId, 
      PORTAL_PERMISSIONS.VIEW_OWN_QUOTES
    );
    
    if (!canViewQuotes.hasPermission) {
      throw new Error('Permission denied: cannot view quotes');
    }

    // Build query conditions with strict customer isolation
    const conditions = [
      eq(quotes.organizationId, this.userContext.organizationId),
      eq(quotes.customerId, this.userContext.customerId),
      isNull(quotes.deletedAt)
    ];

    // Add status filter
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      conditions.push(inArray(quotes.status, statusArray));
    }

    // Add date range filters
    if (filters.fromDate) {
      conditions.push(gte(quotes.validFrom, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(quotes.validUntil, filters.toDate));
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(quotes)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;

    // Calculate pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || PORTAL_CONFIG.DEFAULT_PAGE_SIZE, PORTAL_CONFIG.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const quotesData = await this.db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        description: quotes.description,
        status: quotes.status,
        type: quotes.type,
        validFrom: quotes.validFrom,
        validUntil: quotes.validUntil,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        discountAmount: quotes.discountAmount,
        totalAmount: quotes.totalAmount,
        notes: quotes.notes,
        approvedAt: quotes.approvedAt,
        sentAt: quotes.sentAt,
        acceptedAt: quotes.acceptedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt
      })
      .from(quotes)
      .where(and(...conditions))
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to portal format
    const portalQuotes: PortalQuote[] = quotesData.map(quote => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      description: quote.description,
      status: quote.status as any,
      type: quote.type,
      validFrom: quote.validFrom,
      validUntil: quote.validUntil,
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      discountAmount: quote.discountAmount,
      totalAmount: quote.totalAmount,
      notes: quote.notes,
      approvedAt: quote.approvedAt?.toISOString() || null,
      sentAt: quote.sentAt?.toISOString() || null,
      acceptedAt: quote.acceptedAt?.toISOString() || null,
      expiresAt: quote.expiresAt?.toISOString() || null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString()
    }));

    return {
      data: portalQuotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get quote detail by ID with customer ownership verification
   */
  async getQuoteDetail(quoteId: string): Promise<PortalQuoteDetail> {
    await this.validatePortalAccess();

    // Check permission
    const canViewQuotes = await this.permissionService.hasPermission(
      this.userContext.userId, 
      PORTAL_PERMISSIONS.VIEW_OWN_QUOTES
    );
    
    if (!canViewQuotes.hasPermission) {
      throw new Error('Permission denied: cannot view quotes');
    }

    // Get quote with strict customer isolation
    const quoteResult = await this.db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        description: quotes.description,
        status: quotes.status,
        type: quotes.type,
        validFrom: quotes.validFrom,
        validUntil: quotes.validUntil,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        discountAmount: quotes.discountAmount,
        totalAmount: quotes.totalAmount,
        notes: quotes.notes,
        approvedAt: quotes.approvedAt,
        sentAt: quotes.sentAt,
        acceptedAt: quotes.acceptedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(quotes.organizationId, this.userContext.organizationId),
          eq(quotes.customerId, this.userContext.customerId),
          isNull(quotes.deletedAt)
        )
      )
      .limit(1);

    if (quoteResult.length === 0) {
      await this.logSecurityViolation({
        violationType: 'cross_customer',
        attemptedAction: 'view_quote',
        attemptedResource: 'quote',
        attemptedResourceId: quoteId
      });
      throw new Error('Quote not found');
    }

    const quote = quoteResult[0];
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Get line items
    const lineItemsResult = await this.db
      .select({
        id: quoteLineItems.id,
        lineNumber: quoteLineItems.lineNumber,
        type: quoteLineItems.type,
        sku: quoteLineItems.sku,
        description: quoteLineItems.description,
        quantity: quoteLineItems.quantity,
        unitPrice: quoteLineItems.unitPrice,
        discountPercent: quoteLineItems.discountValue, // Using discountValue as discountPercent
        discountAmount: quoteLineItems.discountAmount,
        taxPercent: quoteLineItems.taxRate, // Using taxRate as taxPercent
        taxAmount: quoteLineItems.taxAmount,
        subtotal: quoteLineItems.subtotal,
        total: quoteLineItems.totalAmount // Using totalAmount as total
      })
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, quoteId))
      .orderBy(asc(quoteLineItems.lineNumber));

    // Transform line items
    const portalLineItems: PortalQuoteLineItem[] = lineItemsResult.map(item => ({
      id: item.id,
      lineNumber: item.lineNumber,
      type: item.type,
      sku: item.sku,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
      taxPercent: item.taxPercent,
      taxAmount: item.taxAmount,
      subtotal: item.subtotal,
      total: item.total
    }));

    // Transform quote
    const portalQuote: PortalQuoteDetail = {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      description: quote.description,
      status: quote.status as any,
      type: quote.type,
      validFrom: quote.validFrom,
      validUntil: quote.validUntil,
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      discountAmount: quote.discountAmount,
      totalAmount: quote.totalAmount,
      notes: quote.notes,
      approvedAt: quote.approvedAt?.toISOString() || null,
      sentAt: quote.sentAt?.toISOString() || null,
      acceptedAt: quote.acceptedAt?.toISOString() || null,
      expiresAt: quote.expiresAt?.toISOString() || null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      lineItems: portalLineItems
    };

    return portalQuote;
  }

  /**
   * Get invoices for the customer with filtering and pagination
   */
  async getInvoices(filters: PortalInvoiceFilters): Promise<PortalPaginatedResponse<PortalInvoice>> {
    await this.validatePortalAccess();

    // Check permission
    const canViewInvoices = await this.permissionService.hasPermission(
      this.userContext.userId, 
      PORTAL_PERMISSIONS.VIEW_OWN_INVOICES
    );
    
    if (!canViewInvoices.hasPermission) {
      throw new Error('Permission denied: cannot view invoices');
    }

    // Build query conditions with strict customer isolation
    const conditions = [
      eq(invoices.organizationId, this.userContext.organizationId),
      eq(invoices.customerId, this.userContext.customerId),
      isNull(invoices.deletedAt)
    ];

    // Add status filter
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      conditions.push(inArray(invoices.status, statusArray));
    }

    // Add date range filters (based on issued date)
    if (filters.fromDate) {
      conditions.push(gte(invoices.issuedAt, new Date(filters.fromDate)));
    }
    if (filters.toDate) {
      conditions.push(lte(invoices.issuedAt, new Date(filters.toDate)));
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;

    // Calculate pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || PORTAL_CONFIG.DEFAULT_PAGE_SIZE, PORTAL_CONFIG.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const invoicesData = await this.db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        title: invoices.title,
        description: invoices.description,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        discountAmount: invoices.discountAmount,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt
      })
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to portal format
    const portalInvoices: PortalInvoice[] = invoicesData.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      description: invoice.description,
      status: invoice.status as any,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
      issuedAt: invoice.issuedAt?.toISOString() || null,
      dueAt: invoice.dueAt?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }));

    return {
      data: portalInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get invoice detail by ID with customer ownership verification
   */
  async getInvoiceDetail(invoiceId: string): Promise<PortalInvoiceDetail> {
    await this.validatePortalAccess();

    // Check permission
    const canViewInvoices = await this.permissionService.hasPermission(
      this.userContext.userId, 
      PORTAL_PERMISSIONS.VIEW_OWN_INVOICES
    );
    
    if (!canViewInvoices.hasPermission) {
      throw new Error('Permission denied: cannot view invoices');
    }

    // Get invoice with strict customer isolation
    const invoiceResult = await this.db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        title: invoices.title,
        description: invoices.description,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        discountAmount: invoices.discountAmount,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.organizationId, this.userContext.organizationId),
          eq(invoices.customerId, this.userContext.customerId),
          isNull(invoices.deletedAt)
        )
      )
      .limit(1);

    if (invoiceResult.length === 0) {
      await this.logSecurityViolation({
        violationType: 'cross_customer',
        attemptedAction: 'view_invoice',
        attemptedResource: 'invoice',
        attemptedResourceId: invoiceId
      });
      throw new Error('Invoice not found');
    }

    const invoice = invoiceResult[0];
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Get line items
    const lineItemsResult = await this.db
      .select({
        id: invoiceLineItems.id,
        description: invoiceLineItems.description,
        quantity: invoiceLineItems.quantity,
        unitPrice: invoiceLineItems.unitPrice,
        subtotal: invoiceLineItems.subtotal,
        taxAmount: invoiceLineItems.taxAmount,
        discountAmount: invoiceLineItems.discountAmount,
        totalAmount: invoiceLineItems.totalAmount,
        unit: invoiceLineItems.unit
      })
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId));

    // Transform line items
    const portalLineItems: PortalInvoiceLineItem[] = lineItemsResult.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      taxAmount: item.taxAmount,
      discountAmount: item.discountAmount,
      totalAmount: item.totalAmount,
      unit: item.unit
    }));

    // Transform invoice
    const portalInvoice: PortalInvoiceDetail = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      description: invoice.description,
      status: invoice.status as any,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
      issuedAt: invoice.issuedAt?.toISOString() || null,
      dueAt: invoice.dueAt?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      lineItems: portalLineItems
    };

    return portalInvoice;
  }

  /**
   * Get time entry summaries (approved entries only)
   * Note: This is a placeholder since time entries table doesn't exist yet
   */
  async getTimeEntries(filters: PortalTimeEntryFilters): Promise<PortalPaginatedResponse<PortalTimeEntrySummary>> {
    await this.validatePortalAccess();

    // Check permission
    const canViewTimeEntries = await this.permissionService.hasPermission(
      this.userContext.userId, 
      PORTAL_PERMISSIONS.VIEW_OWN_TIME_ENTRIES
    );
    
    if (!canViewTimeEntries.hasPermission) {
      throw new Error('Permission denied: cannot view time entries');
    }

    // TODO: Implement when time entries table is created
    // For now, return empty result with proper pagination structure
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || PORTAL_CONFIG.DEFAULT_PAGE_SIZE, PORTAL_CONFIG.MAX_PAGE_SIZE);

    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}
