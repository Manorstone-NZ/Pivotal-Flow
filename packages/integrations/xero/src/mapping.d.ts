/**
 * Xero Mapping Layer
 * Converts between Pivotal Flow models and Xero DTOs
 */
import type { XeroContact, XeroInvoice, XeroPayment, NZTaxMapping } from './types.js';
export interface PivotalContact {
    id: string;
    companyName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };
    taxNumber?: string;
    customerNumber?: string;
    isActive: boolean;
    organizationId: string;
}
export interface PivotalInvoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    issueDate: Date;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    fxRate?: number;
    organizationId: string;
    lineItems: PivotalInvoiceLineItem[];
}
export interface PivotalInvoiceLineItem {
    id: string;
    invoiceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxRate: number;
    taxAmount: number;
    accountCode?: string;
    serviceCategoryId?: string;
}
export interface PivotalPayment {
    id: string;
    invoiceId: string;
    amount: number;
    currency: string;
    fxRate?: number;
    paymentDate: Date;
    paymentMethod: string;
    reference?: string;
    organizationId: string;
}
export declare const NZ_TAX_MAPPING: NZTaxMapping;
/**
 * Map Pivotal Flow contact to Xero contact
 */
export declare function mapContactToXero(contact: PivotalContact): XeroContact;
/**
 * Map Xero contact to Pivotal Flow contact
 */
export declare function mapContactFromXero(xeroContact: XeroContact): PivotalContact;
/**
 * Map Pivotal Flow invoice to Xero invoice
 */
export declare function mapInvoiceToXero(invoice: PivotalInvoice): XeroInvoice;
/**
 * Map Xero invoice to Pivotal Flow invoice
 */
export declare function mapInvoiceFromXero(xeroInvoice: XeroInvoice): PivotalInvoice;
/**
 * Map Pivotal Flow payment to Xero payment
 */
export declare function mapPaymentToXero(payment: PivotalPayment): XeroPayment;
/**
 * Map Xero payment to Pivotal Flow payment
 */
export declare function mapPaymentFromXero(xeroPayment: XeroPayment): PivotalPayment;
/**
 * Map tax rate to Xero tax type
 */
export declare function mapTaxRateToXero(taxRate: number): string;
/**
 * Map Xero tax type to tax rate
 */
export declare function mapXeroTaxTypeToRate(taxType: string): number;
/**
 * Map invoice status to Xero status
 */
export declare function mapInvoiceStatusToXero(status: string): XeroInvoice['status'];
/**
 * Map Xero invoice status to Pivotal Flow status
 */
export declare function mapInvoiceStatusFromXero(status: XeroInvoice['status']): PivotalInvoice['status'];
/**
 * Generate idempotency key for Xero operations
 */
export declare function generateIdempotencyKey(operation: string, resourceId: string, organizationId: string): string;
/**
 * Validate NZ GST number format
 */
export declare function validateNZGSTNumber(gstNumber: string): boolean;
/**
 * Format NZ GST number for Xero
 */
export declare function formatNZGSTNumber(gstNumber: string): string;
//# sourceMappingURL=mapping.d.ts.map