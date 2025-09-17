import { eq, and, desc, sql } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';

import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { getDatabase } from '../../lib/db.js';
import { quotes, quoteVersions, quoteLineItems, customers } from '../../lib/schema.js';

export interface QuoteContext {
  organizationId: string;
  userId: string;
}

export class QuoteService {
  private db = getDatabase();

  constructor(
    private context: QuoteContext,
    private auditLogger?: AuditLogger
  ) {}

  async listQuotes(pagination?: { page?: number; size?: number }, filters?: any) {
    const page = pagination?.page || 1;
    const pageSize = pagination?.size || 25;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [eq(quotes.organizationId, this.context.organizationId)];
    
    if (filters?.status) {
      whereConditions.push(eq(quotes.status, filters.status));
    }
    if (filters?.customerId) {
      whereConditions.push(eq(quotes.customerId, filters.customerId));
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(quotes)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Get quotes with pagination
    const quotesResult = await this.db
      .select()
      .from(quotes)
      .where(and(...whereConditions))
      .orderBy(desc(quotes.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      quotes: quotesResult,
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

  async getQuoteById(id: string) {
    const result = await this.db
      .select()
      .from(quotes)
      .where(and(
        eq(quotes.id, id),
        eq(quotes.organizationId, this.context.organizationId)
      ))
      .limit(1);

    return result[0] || null;
  }

  async createQuote(data: any) {
    const quoteId = generateId();
    const quoteNumber = await this.generateQuoteNumber();
    
    const quoteData = {
      id: quoteId,
      organizationId: this.context.organizationId,
      quoteNumber,
      customerId: data.customerId || data.clientId,
      projectId: data.projectId || null,
      title: data.title,
      description: data.description || null,
      status: 'draft',
      type: data.type || 'project',
      validFrom: new Date(data.validFrom || new Date()),
      validUntil: new Date(data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      currency: data.currency || 'NZD',
      exchangeRate: data.exchangeRate || '1.000000',
      subtotal: data.subtotal || '0.00',
      taxRate: data.taxRate || '0.1500',
      taxAmount: data.taxAmount || '0.00',
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || '0.0000',
      discountAmount: data.discountAmount || '0.00',
      totalAmount: data.totalAmount || '0.00',
      termsConditions: data.termsConditions || null,
      notes: data.notes || null,
      internalNotes: data.internalNotes || null,
      createdBy: this.context.userId,
      approvedBy: null,
      approvedAt: null,
      sentAt: null,
      acceptedAt: null,
      rejectedAt: null,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.insert(quotes).values(quoteData);

    // Log audit event
    if (this.auditLogger) {
      await this.auditLogger.log({
        entityType: 'quote',
        entityId: quoteId,
        action: 'create',
        userId: this.context.userId,
        organizationId: this.context.organizationId,
        metadata: { quoteNumber, title: data.title }
      });
    }

    return quoteData;
  }

  async updateQuote(id: string, data: any) {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    await this.db
      .update(quotes)
      .set(updateData)
      .where(and(
        eq(quotes.id, id),
        eq(quotes.organizationId, this.context.organizationId)
      ));

    // Log audit event
    if (this.auditLogger) {
      await this.auditLogger.log({
        entityType: 'quote',
        entityId: id,
        action: 'update',
        userId: this.context.userId,
        organizationId: this.context.organizationId,
        metadata: { updatedFields: Object.keys(data) }
      });
    }

    return await this.getQuoteById(id);
  }

  async transitionStatus(id: string, data: { status: string; reason?: string }) {
    const updateData = {
      status: data.status,
      updatedAt: new Date()
    };

    // Set specific timestamps based on status
    if (data.status === 'approved') {
      updateData.approvedBy = this.context.userId;
      updateData.approvedAt = new Date();
    } else if (data.status === 'sent') {
      updateData.sentAt = new Date();
    } else if (data.status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (data.status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    await this.db
      .update(quotes)
      .set(updateData)
      .where(and(
        eq(quotes.id, id),
        eq(quotes.organizationId, this.context.organizationId)
      ));

    // Log audit event
    if (this.auditLogger) {
      await this.auditLogger.log({
        entityType: 'quote',
        entityId: id,
        action: 'status_transition',
        userId: this.context.userId,
        organizationId: this.context.organizationId,
        metadata: { 
          fromStatus: 'unknown', // Would need to get current status first
          toStatus: data.status,
          reason: data.reason 
        }
      });
    }

    return await this.getQuoteById(id);
  }

  async getQuoteVersions(quoteId: string) {
    return await this.db
      .select()
      .from(quoteVersions)
      .where(and(
        eq(quoteVersions.quoteId, quoteId),
        eq(quoteVersions.organizationId, this.context.organizationId)
      ))
      .orderBy(desc(quoteVersions.versionNumber));
  }

  async getQuoteVersion(quoteId: string, versionId: string) {
    const result = await this.db
      .select()
      .from(quoteVersions)
      .where(and(
        eq(quoteVersions.id, versionId),
        eq(quoteVersions.quoteId, quoteId),
        eq(quoteVersions.organizationId, this.context.organizationId)
      ))
      .limit(1);

    return result[0] || null;
  }

  private async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `Q${year}`;
    
    // Get the highest quote number for this year
    const result = await this.db
      .select({ quoteNumber: quotes.quoteNumber })
      .from(quotes)
      .where(and(
        eq(quotes.organizationId, this.context.organizationId),
        sql`${quotes.quoteNumber} LIKE ${prefix + '%'}`
      ))
      .orderBy(desc(quotes.quoteNumber))
      .limit(1);

    if (result.length === 0) {
      return `${prefix}-001`;
    }

    const lastNumber = result[0]?.quoteNumber;
    if (!lastNumber) {
      return `${prefix}-001`;
    }

    const match = lastNumber.match(new RegExp(`${prefix}-(\\d+)`));
    if (!match) {
      return `${prefix}-001`;
    }

    const nextNumber = parseInt(match[1], 10) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async createQuote(data: {
    clientId: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    validUntil?: string;
    metadata: Record<string, any>;
  }) {
    const quoteId = generateId();
    const quoteNumber = await this.generateQuoteNumber();
    
    // Ensure customer exists, create if it doesn't
    const existingCustomer = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, data.clientId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      // Create a basic customer record
      await this.db.insert(customers).values({
        id: data.clientId,
        organizationId: this.context.organizationId,
        customerNumber: `CUST-${Date.now()}`,
        companyName: `Customer ${data.clientId}`,
        status: 'active',
        customerType: 'business',
        email: `${data.clientId}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const quoteData = {
      id: quoteId,
      organizationId: this.context.organizationId,
      customerId: data.clientId, // Map clientId to customerId for database
      quoteNumber,
      title: data.title,
      description: data.description || null,
      type: data.type,
      status: data.status,
      validFrom: new Date().toISOString().split('T')[0], // Required field
      validUntil: data.validUntil ? data.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
      currency: 'NZD',
      exchangeRate: '1.000000',
      subtotal: '0.00',
      taxRate: '0.1500',
      taxAmount: '0.00',
      discountType: 'percentage',
      discountValue: '0.0000',
      discountAmount: '0.00',
      totalAmount: '0.00',
      metadata: data.metadata,
      createdBy: this.context.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.insert(quotes).values(quoteData);

    // Log audit event
    if (this.auditLogger) {
      await this.auditLogger.logEvent({
        entityType: 'quote',
        entityId: quoteId,
        action: 'create',
        changes: quoteData,
        userId: this.context.userId,
        organizationId: this.context.organizationId
      });
    }

    // Return formatted response
    return {
      id: quoteData.id,
      clientId: quoteData.customerId, // Map back to clientId for API response
      title: quoteData.title,
      description: quoteData.description,
      type: quoteData.type,
      status: quoteData.status,
      validUntil: quoteData.validUntil ? `${quoteData.validUntil}T23:59:59Z` : null, // Convert date to datetime string
      metadata: quoteData.metadata,
      organizationId: quoteData.organizationId,
      createdAt: quoteData.createdAt.toISOString(),
      updatedAt: quoteData.updatedAt.toISOString(),
      lineItems: [],
      subtotal: parseFloat(quoteData.subtotal),
      taxAmount: parseFloat(quoteData.taxAmount),
      totalAmount: parseFloat(quoteData.totalAmount),
      createdBy: quoteData.createdBy,
      quoteNumber: quoteData.quoteNumber,
    };
  }
}