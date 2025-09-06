/**
 * Payment Repository
 * Handles payment-related database operations
 */
import { eq, desc } from 'drizzle-orm';
import { payments } from '../schema.js';
import { required } from '../utils/strict.js';
import { BaseRepository } from './repo.base.js';
export class PaymentRepository extends BaseRepository {
    /**
     * Create a new payment
     */
    async create(payment) {
        const [created] = await this.db
            .insert(payments)
            .values(payment)
            .returning();
        return required(created, 'Payment creation failed');
    }
    /**
     * Get payment by ID
     */
    async getById(id) {
        const [payment] = await this.db
            .select()
            .from(payments)
            .where(eq(payments.id, id))
            .limit(1);
        return payment || null;
    }
    /**
     * Get payments for an invoice
     */
    async getByInvoiceId(invoiceId) {
        return await this.db
            .select()
            .from(payments)
            .where(eq(payments.invoiceId, invoiceId))
            .orderBy(desc(payments.createdAt));
    }
    /**
     * Update payment
     */
    async update(id, updates) {
        const [updated] = await this.db
            .update(payments)
            .set(updates)
            .where(eq(payments.id, id))
            .returning();
        return updated || null;
    }
    /**
     * Delete payment
     */
    async delete(id) {
        const result = await this.db
            .delete(payments)
            .where(eq(payments.id, id));
        return result.length > 0;
    }
    /**
     * Validate payment data
     */
    validatePaymentData(paymentData) {
        const errors = [];
        if (!paymentData.invoiceId) {
            errors.push('Invoice ID is required');
        }
        if (!paymentData.amount || paymentData.amount <= 0) {
            errors.push('Amount must be positive');
        }
        if (!paymentData.currency || paymentData.currency.length !== 3) {
            errors.push('Currency must be 3 characters');
        }
        if (!paymentData.method) {
            errors.push('Payment method is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Create payment (alias for create method)
     */
    async createPayment(paymentData) {
        return this.create(paymentData);
    }
    /**
     * Get invoice with payments (placeholder - would need invoice table)
     */
    async getInvoiceWithPayments(invoiceId) {
        // This is a placeholder implementation
        // In a real implementation, you would join with the invoices table
        const invoicePayments = await this.getByInvoiceId(invoiceId);
        return {
            invoiceId,
            payments: invoicePayments
        };
    }
    /**
     * Void payment
     */
    async voidPayment(id, reason, userId) {
        return this.update(id, {
            status: 'voided',
            voidedAt: new Date(),
            voidedBy: userId,
            voidReason: reason
        });
    }
}
//# sourceMappingURL=repo.payments.js.map