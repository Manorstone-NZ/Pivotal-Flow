import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import { BaseRepository, BaseRepositoryOptions } from './repo.base.js';
import type { Payment, NewPayment, Invoice } from '../schema.js';
import { payments, invoices, idempotencyKeys } from '../schema.js';
import { Decimal } from 'decimal.js';

export interface CreatePaymentData {
  organizationId: string;
  invoiceId: string;
  amount: number | string;
  currency: string;
  method: string;
  reference?: string;
  paidAt: Date;
  createdBy: string;
  idempotencyKey?: string;
  gatewayPayload?: Record<string, unknown>;
}

export interface VoidPaymentData {
  paymentId: string;
  reason: string;
  voidedBy: string;
}

export class PaymentRepository extends BaseRepository {
  constructor(db: NodePgDatabase, options: BaseRepositoryOptions) {
    super(db, options);
  }

  /**
   * Create a payment and recalculate invoice balance in a transaction
   */
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    return await this.db.transaction(async (tx) => {
      // Validate currency matches invoice currency
      const invoice = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, data.invoiceId))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error('Invoice not found');
      }

      if (invoice[0].currency !== data.currency) {
        throw new Error(`Payment currency ${data.currency} must match invoice currency ${invoice[0].currency}`);
      }

      // Validate amount is positive
      const amount = new Decimal(data.amount);
      if (amount.lte(0)) {
        throw new Error('Payment amount must be greater than zero');
      }

      // Check if payment would exceed outstanding balance (unless voiding overpayment)
      const outstandingBalance = new Decimal(invoice[0].balanceAmount);
      if (amount.gt(outstandingBalance)) {
        throw new Error(`Payment amount ${amount.toString()} exceeds outstanding balance ${outstandingBalance.toString()}`);
      }

      // Handle idempotency
      let idempotencyKeyId: string | undefined;
      if (data.idempotencyKey) {
        const existingKey = await tx
          .select()
          .from(idempotencyKeys)
          .where(eq(idempotencyKeys.requestHash, data.idempotencyKey))
          .limit(1);

        if (existingKey.length > 0) {
          // Return existing payment if idempotency key exists
          const existingPayment = await tx
            .select()
            .from(payments)
            .where(eq(payments.idempotencyKey, existingKey[0].id))
            .limit(1);

          if (existingPayment.length > 0) {
            return existingPayment[0];
          }
        }

        // Create new idempotency key
        idempotencyKeyId = this.generateId();
        await tx.insert(idempotencyKeys).values({
          id: idempotencyKeyId,
          organizationId: data.organizationId,
          userId: data.createdBy,
          route: '/v1/payments',
          requestHash: JSON.stringify(data),
          responseStatus: 200,
          responseBody: {},
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
      }

      // Create payment
      const paymentId = this.generateId();
      const payment: NewPayment = {
        id: paymentId,
        organizationId: data.organizationId,
        invoiceId: data.invoiceId,
        amount: amount.toString(),
        currency: data.currency,
        method: data.method,
        reference: data.reference,
        status: 'completed',
        paidAt: data.paidAt,
        idempotencyKey: idempotencyKeyId,
        gatewayPayload: data.gatewayPayload,
        createdBy: data.createdBy,
      };

      await tx.insert(payments).values(payment);

      // Recalculate invoice balance
      const newPaidAmount = new Decimal(invoice[0].paidAmount).plus(amount);
      const newBalanceAmount = new Decimal(invoice[0].totalAmount).minus(newPaidAmount);

      // Determine new status
      let newStatus = invoice[0].status;
      let paidAt = invoice[0].paidAt;
      let overdueAt = invoice[0].overdueAt;

      if (newBalanceAmount.lte(0)) {
        newStatus = 'paid';
        paidAt = data.paidAt;
        overdueAt = null;
      } else if (newPaidAmount.gt(0) && newPaidAmount.lt(invoice[0].totalAmount)) {
        newStatus = 'part_paid';
      }

      // Update invoice
      await tx
        .update(invoices)
        .set({
          paidAmount: newPaidAmount.toString(),
          balanceAmount: newBalanceAmount.toString(),
          status: newStatus,
          paidAt,
          overdueAt,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, data.invoiceId));

      // Return created payment
      const createdPayment = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      return createdPayment[0];
    });
  }

  /**
   * List payments for an invoice
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Void a payment and recalculate invoice balance
   */
  async voidPayment(data: VoidPaymentData): Promise<Payment> {
    return await this.db.transaction(async (tx) => {
      // Get payment
      const payment = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, data.paymentId))
        .limit(1);

      if (payment.length === 0) {
        throw new Error('Payment not found');
      }

      if (payment[0].status === 'void') {
        throw new Error('Payment is already void');
      }

      // Get invoice
      const invoice = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, payment[0].invoiceId))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error('Invoice not found');
      }

      // Recalculate invoice balance
      const paymentAmount = new Decimal(payment[0].amount);
      const newPaidAmount = new Decimal(invoice[0].paidAmount).minus(paymentAmount);
      const newBalanceAmount = new Decimal(invoice[0].totalAmount).minus(newPaidAmount);

      // Determine new status
      let newStatus = invoice[0].status;
      let paidAt = invoice[0].paidAt;
      let overdueAt = invoice[0].overdueAt;

      if (newPaidAmount.lte(0)) {
        newStatus = 'sent';
        paidAt = null;
      } else if (newPaidAmount.lt(invoice[0].totalAmount)) {
        newStatus = 'part_paid';
      }

      // Update payment
      await tx
        .update(payments)
        .set({
          status: 'void',
          voidedAt: new Date(),
          voidedBy: data.voidedBy,
          voidReason: data.reason,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, data.paymentId));

      // Update invoice
      await tx
        .update(invoices)
        .set({
          paidAmount: newPaidAmount.toString(),
          balanceAmount: newBalanceAmount.toString(),
          status: newStatus,
          paidAt,
          overdueAt,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, payment[0].invoiceId));

      // Return updated payment
      const updatedPayment = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, data.paymentId))
        .limit(1);

      return updatedPayment[0];
    });
  }

  /**
   * Get invoice with payments
   */
  async getInvoiceWithPayments(invoiceId: string): Promise<{ invoice: Invoice; payments: Payment[] } | null> {
    const invoice = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      return null;
    }

    const payments = await this.getPaymentsByInvoice(invoiceId);

    return {
      invoice: invoice[0],
      payments,
    };
  }

  /**
   * Validate payment data
   */
  validatePaymentData(data: CreatePaymentData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.organizationId) {
      errors.push('Organization ID is required');
    }

    if (!data.invoiceId) {
      errors.push('Invoice ID is required');
    }

    if (!data.amount || new Decimal(data.amount).lte(0)) {
      errors.push('Amount must be greater than zero');
    }

    if (!data.currency || data.currency.length !== 3) {
      errors.push('Currency must be a 3-character ISO code');
    }

    if (!data.method) {
      errors.push('Payment method is required');
    }

    if (!data.paidAt) {
      errors.push('Payment date is required');
    }

    if (!data.createdBy) {
      errors.push('Created by user ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
