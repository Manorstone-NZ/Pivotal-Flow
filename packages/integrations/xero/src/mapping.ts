/**
 * Xero Mapping Layer
 * Converts between Pivotal Flow models and Xero DTOs
 */

import type { 
  XeroContact, 
  XeroInvoice, 
  XeroInvoiceLineItem, 
  XeroPayment, 
  XeroAccountCode,
  NZTaxMapping 
} from './types.js';

// Pivotal Flow model types (imported from main app)
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

// NZ Tax mapping configuration
export const NZ_TAX_MAPPING: NZTaxMapping = {
  gstRate: 15.0,
  gstTaxType: 'OUTPUT',
  zeroRateTaxType: 'ZERO',
  exemptTaxType: 'EXEMPT',
  importTaxType: 'IMPORT',
};

/**
 * Map Pivotal Flow contact to Xero contact
 */
export function mapContactToXero(contact: PivotalContact): XeroContact {
  return {
    contactId: contact.id,
    name: contact.companyName,
    firstName: contact.firstName,
    lastName: contact.lastName,
    emailAddress: contact.email,
    phoneNumber: contact.phone,
    address: contact.address ? {
      addressType: 'POBOX',
      addressLine1: contact.address.line1,
      addressLine2: contact.address.line2,
      city: contact.address.city,
      region: contact.address.region,
      postalCode: contact.address.postalCode,
      country: contact.address.country || 'NZ',
    } : undefined,
    taxNumber: contact.taxNumber,
    accountNumber: contact.customerNumber,
    isCustomer: true,
    isSupplier: false,
    status: contact.isActive ? 'ACTIVE' : 'ARCHIVED',
    updatedDateUTC: new Date().toISOString(),
  };
}

/**
 * Map Xero contact to Pivotal Flow contact
 */
export function mapContactFromXero(xeroContact: XeroContact): PivotalContact {
  return {
    id: xeroContact.contactId,
    companyName: xeroContact.name,
    firstName: xeroContact.firstName,
    lastName: xeroContact.lastName,
    email: xeroContact.emailAddress,
    phone: xeroContact.phoneNumber,
    address: xeroContact.address ? {
      line1: xeroContact.address.addressLine1,
      line2: xeroContact.address.addressLine2,
      city: xeroContact.address.city,
      region: xeroContact.address.region,
      postalCode: xeroContact.address.postalCode,
      country: xeroContact.address.country,
    } : undefined,
    taxNumber: xeroContact.taxNumber,
    customerNumber: xeroContact.accountNumber,
    isActive: xeroContact.status === 'ACTIVE',
    organizationId: '', // Will be set by caller
  };
}

/**
 * Map Pivotal Flow invoice to Xero invoice
 */
export function mapInvoiceToXero(invoice: PivotalInvoice): XeroInvoice {
  const lineItems: XeroInvoiceLineItem[] = invoice.lineItems.map(item => ({
    lineItemId: item.id,
    description: item.description,
    quantity: item.quantity,
    unitAmount: item.unitPrice,
    lineAmount: item.lineTotal,
    accountCode: item.accountCode || '200',
    taxType: mapTaxRateToXero(item.taxRate),
    taxAmount: item.taxAmount,
  }));

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    contact: {
      contactId: invoice.customerId,
      name: invoice.customerName,
    },
    date: invoice.issueDate.toISOString().split('T')[0],
    dueDate: invoice.dueDate.toISOString().split('T')[0],
    status: mapInvoiceStatusToXero(invoice.status),
    lineAmountTypes: 'Exclusive', // NZ standard
    lineItems,
    subtotal: invoice.subtotal,
    totalTax: invoice.taxAmount,
    total: invoice.total,
    currencyCode: invoice.currency,
    currencyRate: invoice.fxRate,
    hasAttachments: false,
    hasErrors: false,
  };
}

/**
 * Map Xero invoice to Pivotal Flow invoice
 */
export function mapInvoiceFromXero(xeroInvoice: XeroInvoice): PivotalInvoice {
  const lineItems: PivotalInvoiceLineItem[] = xeroInvoice.lineItems.map(item => ({
    id: item.lineItemId,
    invoiceId: xeroInvoice.invoiceId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitAmount,
    lineTotal: item.lineAmount,
    taxRate: mapXeroTaxTypeToRate(item.taxType),
    taxAmount: item.taxAmount,
    accountCode: item.accountCode,
  }));

  return {
    id: xeroInvoice.invoiceId,
    invoiceNumber: xeroInvoice.invoiceNumber,
    customerId: xeroInvoice.contact.contactId,
    customerName: xeroInvoice.contact.name,
    issueDate: new Date(xeroInvoice.date),
    dueDate: new Date(xeroInvoice.dueDate),
    status: mapInvoiceStatusFromXero(xeroInvoice.status),
    subtotal: xeroInvoice.subtotal,
    taxAmount: xeroInvoice.totalTax,
    total: xeroInvoice.total,
    currency: xeroInvoice.currencyCode,
    fxRate: xeroInvoice.currencyRate,
    organizationId: '', // Will be set by caller
    lineItems,
  };
}

/**
 * Map Pivotal Flow payment to Xero payment
 */
export function mapPaymentToXero(payment: PivotalPayment): XeroPayment {
  return {
    paymentId: payment.id,
    invoice: {
      invoiceId: payment.invoiceId,
      invoiceNumber: '', // Will be populated by caller
    },
    account: {
      accountId: '1', // Default bank account
      code: '090',
      name: 'Bank Account',
    },
    date: payment.paymentDate.toISOString().split('T')[0],
    amount: payment.amount,
    currencyRate: payment.fxRate,
    reference: payment.reference,
    status: 'AUTHORISED',
    paymentType: 'ACCRECPAYMENT',
    updatedDateUTC: new Date().toISOString(),
  };
}

/**
 * Map Xero payment to Pivotal Flow payment
 */
export function mapPaymentFromXero(xeroPayment: XeroPayment): PivotalPayment {
  return {
    id: xeroPayment.paymentId,
    invoiceId: xeroPayment.invoice.invoiceId,
    amount: xeroPayment.amount,
    currency: 'NZD', // Default for NZ
    fxRate: xeroPayment.currencyRate,
    paymentDate: new Date(xeroPayment.date),
    paymentMethod: xeroPayment.account.name,
    reference: xeroPayment.reference,
    organizationId: '', // Will be set by caller
  };
}

/**
 * Map tax rate to Xero tax type
 */
export function mapTaxRateToXero(taxRate: number): string {
  if (taxRate === 0) {
    return NZ_TAX_MAPPING.zeroRateTaxType;
  }
  if (taxRate === NZ_TAX_MAPPING.gstRate) {
    return NZ_TAX_MAPPING.gstTaxType;
  }
  return 'EXEMPT';
}

/**
 * Map Xero tax type to tax rate
 */
export function mapXeroTaxTypeToRate(taxType: string): number {
  switch (taxType) {
    case NZ_TAX_MAPPING.gstTaxType:
      return NZ_TAX_MAPPING.gstRate;
    case NZ_TAX_MAPPING.zeroRateTaxType:
      return 0;
    case NZ_TAX_MAPPING.exemptTaxType:
      return 0;
    default:
      return 0;
  }
}

/**
 * Map invoice status to Xero status
 */
export function mapInvoiceStatusToXero(status: string): XeroInvoice['status'] {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'sent':
      return 'SUBMITTED';
    case 'paid':
      return 'PAID';
    case 'overdue':
      return 'AUTHORISED';
    case 'cancelled':
      return 'VOIDED';
    default:
      return 'DRAFT';
  }
}

/**
 * Map Xero invoice status to Pivotal Flow status
 */
export function mapInvoiceStatusFromXero(status: XeroInvoice['status']): PivotalInvoice['status'] {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'SUBMITTED':
      return 'sent';
    case 'AUTHORISED':
      return 'sent';
    case 'PAID':
      return 'paid';
    case 'VOIDED':
      return 'cancelled';
    default:
      return 'draft';
  }
}

/**
 * Generate idempotency key for Xero operations
 */
export function generateIdempotencyKey(operation: string, resourceId: string, organizationId: string): string {
  const timestamp = new Date().toISOString();
  return `${operation}_${resourceId}_${organizationId}_${timestamp}`;
}

/**
 * Validate NZ GST number format
 */
export function validateNZGSTNumber(gstNumber: string): boolean {
  // NZ GST numbers are 8-9 digits
  const gstRegex = /^\d{8,9}$/;
  return gstRegex.test(gstNumber);
}

/**
 * Format NZ GST number for Xero
 */
export function formatNZGSTNumber(gstNumber: string): string {
  // Remove any non-digit characters
  const cleaned = gstNumber.replace(/\D/g, '');
  
  // Add NZ prefix if not present
  if (cleaned.length === 8 || cleaned.length === 9) {
    return `NZ${cleaned}`;
  }
  
  return gstNumber;
}
