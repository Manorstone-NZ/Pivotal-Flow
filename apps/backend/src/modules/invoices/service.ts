import { eq, and, desc, sql, like, gte, lte } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { createHash } from 'crypto';

import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { getDatabase } from '../../lib/db.js';
import { invoices, invoiceLineItems, payments, customers } from '../../lib/schema.js';
import type {
  Invoice,
  CreateInvoice,
  UpdateInvoice,
  InvoiceListFilters,
  InvoiceStatusTransition,
  MarkInvoicePaid,
  VoidInvoice,
} from './typeboxSchemas.js';

export interface InvoiceContext {
  organizationId: string;
  userId: string;
}

export class InvoiceService {
  private db = getDatabase();

  constructor(
    private context: InvoiceContext
  ) {}

  /**
   * Generate ETag for invoice caching
   */
  private generateETag(invoice: any): string {
    const dataString = JSON.stringify({
      id: invoice.id,
      updatedAt: invoice.updatedAt,
      paymentsCount: invoice.payments?.length || 0,
      lastPaymentDate: invoice.payments?.[0]?.updatedAt || invoice.updatedAt,
    });
    return `"${createHash('sha256').update(dataString).digest('hex').substring(0, 16)}"`;
  }

  /**
   * Generate next invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}`;

    // Get the latest invoice number for this year
    const latestInvoice = await this.db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, this.context.organizationId),
          like(invoices.invoiceNumber, `${prefix}-%`)
        )
      )
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    if (latestInvoice.length === 0) {
      return `${prefix}-001`;
    }

    // Extract number and increment
    const match = latestInvoice[0]?.invoiceNumber.match(/-(\d+)$/);
    const nextNumber = match?.[1] ? parseInt(match[1], 10) + 1 : 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * List invoices with filtering and pagination
   */
  async listInvoices(filters: InvoiceListFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(invoices.organizationId, this.context.organizationId)];

    if (filters.status) {
      whereConditions.push(eq(invoices.status, filters.status));
    }
    if (filters.customerId) {
      whereConditions.push(eq(invoices.customerId, filters.customerId));
    }
    if (filters.projectId) {
      whereConditions.push(eq(invoices.projectId, filters.projectId));
    }
    if (filters.currency) {
      whereConditions.push(eq(invoices.currency, filters.currency));
    }
    if (filters.issuedAfter) {
      whereConditions.push(gte(invoices.issuedAt, new Date(filters.issuedAfter)));
    }
    if (filters.issuedBefore) {
      whereConditions.push(lte(invoices.issuedAt, new Date(filters.issuedBefore)));
    }
    if (filters.dueAfter) {
      whereConditions.push(gte(invoices.dueAt, new Date(filters.dueAfter)));
    }
    if (filters.dueBefore) {
      whereConditions.push(lte(invoices.dueAt, new Date(filters.dueBefore)));
    }
    if (filters.minAmount) {
      whereConditions.push(gte(invoices.totalAmount, filters.minAmount.toString()));
    }
    if (filters.maxAmount) {
      whereConditions.push(lte(invoices.totalAmount, filters.maxAmount.toString()));
    }
    if (filters.search) {
      whereConditions.push(
        sql`(${invoices.invoiceNumber} ILIKE ${`%${filters.search}%`} OR ${invoices.title} ILIKE ${`%${filters.search}%`})`
      );
    }

    // Get total count
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Build sort order
    let orderBy;
    const sortField = filters.sort || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    switch (sortField) {
      case 'invoiceNumber':
        orderBy = sortOrder === 'asc' ? invoices.invoiceNumber : desc(invoices.invoiceNumber);
        break;
      case 'status':
        orderBy = sortOrder === 'asc' ? invoices.status : desc(invoices.status);
        break;
      case 'totalAmount':
        orderBy = sortOrder === 'asc' ? invoices.totalAmount : desc(invoices.totalAmount);
        break;
      case 'dueAt':
        orderBy = sortOrder === 'asc' ? invoices.dueAt : desc(invoices.dueAt);
        break;
      case 'issuedAt':
        orderBy = sortOrder === 'asc' ? invoices.issuedAt : desc(invoices.issuedAt);
        break;
      default:
        orderBy = sortOrder === 'asc' ? invoices.createdAt : desc(invoices.createdAt);
    }

    // Get invoices with customer info
    const invoiceResults = await this.db
      .select({
        invoice: invoices,
        customer: {
          id: customers.id,
          name: customers.companyName,
          email: customers.email,
          phone: customers.phone,
          address: customers.street,
        },
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedInvoices = invoiceResults.map((row) => ({
      ...row.invoice,
      subtotal: parseFloat(row.invoice.subtotal.toString()),
      taxAmount: parseFloat(row.invoice.taxAmount.toString()),
      discountAmount: parseFloat(row.invoice.discountAmount.toString()),
      totalAmount: parseFloat(row.invoice.totalAmount.toString()),
      paidAmount: parseFloat(row.invoice.paidAmount.toString()),
      balanceAmount: parseFloat(row.invoice.balanceAmount.toString()),
      customer: row.customer,
      etag: this.generateETag(row.invoice),
    }));

    return {
      data: formattedInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get invoice by ID with full details
   */
  async getInvoiceById(id: string): Promise<any> {
    // Get invoice with customer
    const invoiceResult = await this.db
      .select({
        invoice: invoices,
        customer: {
          id: customers.id,
          name: customers.companyName,
          email: customers.email,
          phone: customers.phone,
          address: customers.street,
        },
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          eq(invoices.id, id),
          eq(invoices.organizationId, this.context.organizationId)
        )
      )
      .limit(1);

    if (invoiceResult.length === 0) {
      return null;
    }

    const result = invoiceResult[0];
    if (!result) {
      return null;
    }

    const { invoice, customer } = result;

    // Get line items
    const lineItemResults = await this.db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.id);

    // Get payments
    const paymentResults = await this.db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id))
      .orderBy(desc(payments.paidAt));

    // Format line items
    const formattedLineItems = lineItemResults.map((item, index) => ({
      ...item,
      lineNumber: index + 1, // Add line number for frontend compatibility
      quantity: parseFloat(item.quantity.toString()),
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      taxRate: 0.15, // Default tax rate since it's not stored in the table
      taxAmount: parseFloat(item.taxAmount.toString()),
      totalAmount: parseFloat(item.totalAmount.toString()),
    }));

    // Format payments
    const formattedPayments = paymentResults.map((payment) => ({
      ...payment,
      amount: parseFloat(payment.amount.toString()),
      paymentDate: payment.paidAt, // Map paidAt to paymentDate for frontend compatibility
      paymentMethod: payment.method, // Map method to paymentMethod for frontend compatibility
    }));

    // Return formatted invoice
    return {
      id: invoice.id,
      organizationId: invoice.organizationId,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      projectId: invoice.projectId || undefined,
      quoteId: invoice.quoteId || undefined,
      currency: invoice.currency,
      subtotal: parseFloat(invoice.subtotal.toString()),
      taxAmount: parseFloat(invoice.taxAmount.toString()),
      discountAmount: parseFloat(invoice.discountAmount.toString()),
      totalAmount: parseFloat(invoice.totalAmount.toString()),
      paidAmount: parseFloat(invoice.paidAmount.toString()),
      balanceAmount: parseFloat(invoice.balanceAmount.toString()),
      status: invoice.status as any,
      issuedAt: invoice.issuedAt?.toISOString(),
      dueAt: invoice.dueAt?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      overdueAt: invoice.overdueAt?.toISOString(),
      writtenOffAt: invoice.writtenOffAt?.toISOString(),
      title: invoice.title,
      description: invoice.description || undefined,
      termsConditions: invoice.termsConditions || undefined,
      notes: invoice.notes || undefined,
      internalNotes: invoice.internalNotes || undefined,
      metadata: invoice.metadata as Record<string, any> || {},
      customer: customer ? {
        id: customer.id,
        name: customer.name,
        ...(customer.email && { email: customer.email }),
        ...(customer.phone && { phone: customer.phone }),
        ...(customer.address && { address: customer.address }),
      } : undefined,
      lineItems: formattedLineItems.map(item => ({
        id: item.id,
        invoiceId: item.invoiceId,
        lineNumber: item.lineNumber,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        metadata: item.metadata || {},
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      payments: formattedPayments.map(payment => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.paymentDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        ...(payment.paymentMethod && { paymentMethod: payment.paymentMethod }),
        ...(payment.reference && { reference: payment.reference }),
      })),
      createdBy: invoice.createdBy,
      approvedBy: invoice.approvedBy || undefined,
      approvedAt: invoice.approvedAt?.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      etag: this.generateETag({ ...invoice, payments: formattedPayments }),
    };
  }

  /**
   * Create new invoice
   */
  async createInvoice(data: CreateInvoice): Promise<any> {
    const invoiceId = generateId();
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create invoice with minimal required fields
    const invoiceData = {
      id: invoiceId,
      organizationId: this.context.organizationId,
      invoiceNumber,
      customerId: data.customerId,
      projectId: data.projectId || null,
      quoteId: data.quoteId || null,
      currency: data.currency || 'NZD',
      subtotal: '0.00',
      taxAmount: '0.00',
      discountAmount: '0.00',
      totalAmount: '0.00',
      paidAmount: '0.00',
      balanceAmount: '0.00',
      status: 'draft',
      title: data.title,
      description: data.description || null,
      termsConditions: data.termsConditions || null,
      notes: data.notes || null,
      internalNotes: null,
      metadata: data.metadata || {},
      createdBy: this.context.userId,
      approvedBy: null,
      approvedAt: null,
      issuedAt: null,
      dueAt: data.dueDate ? new Date(data.dueDate) : null,
      paidAt: null,
      overdueAt: null,
      writtenOffAt: null,
      fxRateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    await this.db.insert(invoices).values(invoiceData);

    // Skip audit logging since we removed the audit logger dependency

    // Return simple response for frontend
    return {
      id: invoiceId,
      organizationId: this.context.organizationId,
      invoiceNumber,
      customerId: data.customerId,
      projectId: data.projectId || undefined,
      quoteId: data.quoteId || undefined,
      currency: data.currency || 'NZD',
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,
      status: 'draft',
      title: data.title,
      description: data.description || undefined,
      termsConditions: data.termsConditions || undefined,
      notes: data.notes || undefined,
      internalNotes: undefined,
      metadata: data.metadata || {},
      customer: {
        id: data.customerId,
        name: 'Customer',
      },
      lineItems: [],
      payments: [],
      createdBy: this.context.userId,
      approvedBy: undefined,
      approvedAt: undefined,
      issuedAt: undefined,
      dueAt: data.dueDate || undefined,
      paidAt: undefined,
      overdueAt: undefined,
      writtenOffAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      etag: `"${invoiceId}"`,
    };
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice | null> {
    // Verify invoice exists and belongs to organization
    const existingInvoice = await this.getInvoiceById(id);
    if (!existingInvoice) {
      return null;
    }

    // Only allow updates to draft invoices
    if (existingInvoice.status !== 'draft') {
      throw new Error('Can only update draft invoices');
    }

    // Update invoice
    await this.db
      .update(invoices)
      .set({
        ...data,
        dueAt: data.dueDate ? new Date(data.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    // Log update
    if (this.auditLogger) {
      await this.auditLogger.logEvent({
        action: 'invoice_updated',
        entityType: 'invoice',
        entityId: id,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        metadata: data,
      });
    }

    return await this.getInvoiceById(id);
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(id: string, transition: InvoiceStatusTransition): Promise<Invoice | null> {
    const existingInvoice = await this.getInvoiceById(id);
    if (!existingInvoice) {
      return null;
    }

    const updateData: any = {
      status: transition.status,
      updatedAt: new Date(),
    };

    // Set status-specific timestamps
    const effectiveDate = transition.effectiveDate ? new Date(transition.effectiveDate) : new Date();
    
    switch (transition.status) {
      case 'sent':
        updateData.issuedAt = effectiveDate;
        break;
      case 'paid':
        updateData.paidAt = effectiveDate;
        break;
      case 'overdue':
        updateData.overdueAt = effectiveDate;
        break;
      case 'written_off':
        updateData.writtenOffAt = effectiveDate;
        break;
    }

    await this.db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id));

    // Log status change
    if (this.auditLogger) {
      await this.auditLogger.logEvent({
        action: 'invoice_status_changed',
        entityType: 'invoice',
        entityId: id,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        metadata: {
          previousStatus: existingInvoice.status,
          newStatus: transition.status,
          reason: transition.reason,
        },
      });
    }

    return await this.getInvoiceById(id);
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(id: string, paymentData: MarkInvoicePaid): Promise<Invoice | null> {
    const existingInvoice = await this.getInvoiceById(id);
    if (!existingInvoice) {
      return null;
    }

    const paymentAmount = paymentData.amount || existingInvoice.balanceAmount;
    const newPaidAmount = existingInvoice.paidAmount + paymentAmount;
    const newBalanceAmount = existingInvoice.totalAmount - newPaidAmount;

    // Create payment record
    const paymentId = generateId();
    await this.db.insert(payments).values({
      id: paymentId,
      organizationId: this.context.organizationId,
      invoiceId: id,
      amount: paymentAmount.toString(),
      currency: existingInvoice.currency,
      method: paymentData.paymentMethod || 'other',
      reference: paymentData.reference,
      status: 'completed',
      paidAt: new Date(paymentData.paymentDate),
      createdBy: this.context.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update invoice amounts and status
    const newStatus = newBalanceAmount <= 0 ? 'paid' : 'part_paid';
    const updateData: any = {
      paidAmount: newPaidAmount.toString(),
      balanceAmount: newBalanceAmount.toString(),
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'paid') {
      updateData.paidAt = new Date(paymentData.paymentDate);
    }

    await this.db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id));

    // Log payment
    if (this.auditLogger) {
      await this.auditLogger.logEvent({
        action: 'invoice_payment_recorded',
        entityType: 'invoice',
        entityId: id,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        metadata: {
          paymentId,
          amount: paymentAmount,
          newBalance: newBalanceAmount,
          newStatus,
        },
      });
    }

    return await this.getInvoiceById(id);
  }

  /**
   * Void invoice
   */
  async voidInvoice(id: string, voidData: VoidInvoice): Promise<Invoice | null> {
    const existingInvoice = await this.getInvoiceById(id);
    if (!existingInvoice) {
      return null;
    }

    // Can't void paid invoices
    if (existingInvoice.status === 'paid' || existingInvoice.status === 'part_paid') {
      throw new Error('Cannot void invoices with payments');
    }

    await this.db
      .update(invoices)
      .set({
        status: 'void',
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    // Log void action
    if (this.auditLogger) {
      await this.auditLogger.logEvent({
        action: 'invoice_voided',
        entityType: 'invoice',
        entityId: id,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        metadata: {
          reason: voidData.reason,
          previousStatus: existingInvoice.status,
        },
      });
    }

    return await this.getInvoiceById(id);
  }
}
