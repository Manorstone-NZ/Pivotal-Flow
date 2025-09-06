/**
 * Payment Repository
 * Handles payment-related database operations
 */
import { type Payment, type NewPayment } from '../schema.js';
import { BaseRepository } from './repo.base.js';
export declare class PaymentRepository extends BaseRepository {
    /**
     * Create a new payment
     */
    create(payment: NewPayment): Promise<Payment>;
    /**
     * Get payment by ID
     */
    getById(id: string): Promise<Payment | null>;
    /**
     * Get payments for an invoice
     */
    getByInvoiceId(invoiceId: string): Promise<Payment[]>;
    /**
     * Update payment
     */
    update(id: string, updates: Partial<NewPayment>): Promise<Payment | null>;
    /**
     * Delete payment
     */
    delete(id: string): Promise<boolean>;
    /**
     * Validate payment data
     */
    validatePaymentData(paymentData: any): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Create payment (alias for create method)
     */
    createPayment(paymentData: NewPayment): Promise<Payment>;
    /**
     * Get invoice with payments (placeholder - would need invoice table)
     */
    getInvoiceWithPayments(invoiceId: string): Promise<any>;
    /**
     * Void payment
     */
    voidPayment(id: string, reason: string, userId: string): Promise<Payment | null>;
}
//# sourceMappingURL=repo.payments.d.ts.map