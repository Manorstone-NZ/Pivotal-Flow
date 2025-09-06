/**
 * Xero Mapping Layer
 * Converts between Pivotal Flow models and Xero DTOs
 */
import { required } from '@pivotal-flow/shared/utils/strict.js';
// NZ Tax mapping configuration
export const NZ_TAX_MAPPING = {
    gstRate: 15.0,
    gstTaxType: 'OUTPUT',
    zeroRateTaxType: 'ZERO',
    exemptTaxType: 'EXEMPT',
    importTaxType: 'IMPORT',
};
/**
 * Map Pivotal Flow contact to Xero contact
 */
export function mapContactToXero(contact) {
    const result = {
        contactId: contact.id,
        name: contact.companyName,
        isCustomer: true,
        isSupplier: false,
        status: contact.isActive ? 'ACTIVE' : 'ARCHIVED',
        updatedDateUTC: new Date().toISOString(),
    };
    if (contact.firstName)
        result.firstName = contact.firstName;
    if (contact.lastName)
        result.lastName = contact.lastName;
    if (contact.email)
        result.emailAddress = contact.email;
    if (contact.phone)
        result.phoneNumber = contact.phone;
    if (contact.taxNumber)
        result.taxNumber = contact.taxNumber;
    if (contact.customerNumber)
        result.accountNumber = contact.customerNumber;
    if (contact.address) {
        result.address = {
            addressType: 'POBOX',
            country: contact.address.country || 'NZ',
        };
        if (contact.address.line1)
            result.address.addressLine1 = contact.address.line1;
        if (contact.address.line2)
            result.address.addressLine2 = contact.address.line2;
        if (contact.address.city)
            result.address.city = contact.address.city;
        if (contact.address.region)
            result.address.region = contact.address.region;
        if (contact.address.postalCode)
            result.address.postalCode = contact.address.postalCode;
    }
    return result;
}
/**
 * Map Xero contact to Pivotal Flow contact
 */
export function mapContactFromXero(xeroContact) {
    const result = {
        id: xeroContact.contactId,
        companyName: xeroContact.name,
        isActive: xeroContact.status === 'ACTIVE',
        organizationId: '', // Will be set by caller
    };
    if (xeroContact.firstName)
        result.firstName = xeroContact.firstName;
    if (xeroContact.lastName)
        result.lastName = xeroContact.lastName;
    if (xeroContact.emailAddress)
        result.email = xeroContact.emailAddress;
    if (xeroContact.phoneNumber)
        result.phone = xeroContact.phoneNumber;
    if (xeroContact.taxNumber)
        result.taxNumber = xeroContact.taxNumber;
    if (xeroContact.accountNumber)
        result.customerNumber = xeroContact.accountNumber;
    if (xeroContact.address) {
        result.address = {};
        if (xeroContact.address.addressLine1)
            result.address.line1 = xeroContact.address.addressLine1;
        if (xeroContact.address.addressLine2)
            result.address.line2 = xeroContact.address.addressLine2;
        if (xeroContact.address.city)
            result.address.city = xeroContact.address.city;
        if (xeroContact.address.region)
            result.address.region = xeroContact.address.region;
        if (xeroContact.address.postalCode)
            result.address.postalCode = xeroContact.address.postalCode;
        if (xeroContact.address.country)
            result.address.country = xeroContact.address.country;
    }
    return result;
}
/**
 * Map Pivotal Flow invoice to Xero invoice
 */
export function mapInvoiceToXero(invoice) {
    const lineItems = invoice.lineItems.map(item => ({
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
        date: required(invoice.issueDate, 'Invoice issueDate is required').toISOString().split('T')[0],
        dueDate: required(invoice.dueDate, 'Invoice dueDate is required').toISOString().split('T')[0],
        status: mapInvoiceStatusToXero(invoice.status),
        lineAmountTypes: 'Exclusive', // NZ standard
        lineItems,
        subtotal: invoice.subtotal,
        totalTax: invoice.taxAmount,
        total: invoice.total,
        currencyCode: invoice.currency,
        ...(invoice.fxRate !== undefined && { currencyRate: invoice.fxRate }),
        hasAttachments: false,
        hasErrors: false,
    };
}
/**
 * Map Xero invoice to Pivotal Flow invoice
 */
export function mapInvoiceFromXero(xeroInvoice) {
    const lineItems = xeroInvoice.lineItems.map(item => ({
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
        ...(xeroInvoice.currencyRate !== undefined && { fxRate: xeroInvoice.currencyRate }),
        organizationId: '', // Will be set by caller
        lineItems,
    };
}
/**
 * Map Pivotal Flow payment to Xero payment
 */
export function mapPaymentToXero(payment) {
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
        date: required(payment.paymentDate, 'Payment paymentDate is required').toISOString().split('T')[0],
        amount: payment.amount,
        ...(payment.fxRate !== undefined && { currencyRate: payment.fxRate }),
        ...(payment.reference && { reference: payment.reference }),
        status: 'AUTHORISED',
        paymentType: 'ACCRECPAYMENT',
        updatedDateUTC: new Date().toISOString(),
    };
}
/**
 * Map Xero payment to Pivotal Flow payment
 */
export function mapPaymentFromXero(xeroPayment) {
    return {
        id: xeroPayment.paymentId,
        invoiceId: xeroPayment.invoice.invoiceId,
        amount: xeroPayment.amount,
        currency: 'NZD', // Default for NZ
        ...(xeroPayment.currencyRate !== undefined && { fxRate: xeroPayment.currencyRate }),
        paymentDate: new Date(xeroPayment.date),
        paymentMethod: xeroPayment.account.name,
        ...(xeroPayment.reference && { reference: xeroPayment.reference }),
        organizationId: '', // Will be set by caller
    };
}
/**
 * Map tax rate to Xero tax type
 */
export function mapTaxRateToXero(taxRate) {
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
export function mapXeroTaxTypeToRate(taxType) {
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
export function mapInvoiceStatusToXero(status) {
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
export function mapInvoiceStatusFromXero(status) {
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
export function generateIdempotencyKey(operation, resourceId, organizationId) {
    const timestamp = new Date().toISOString();
    return `${operation}_${resourceId}_${organizationId}_${timestamp}`;
}
/**
 * Validate NZ GST number format
 */
export function validateNZGSTNumber(gstNumber) {
    // NZ GST numbers are 8-9 digits
    const gstRegex = /^\d{8,9}$/;
    return gstRegex.test(gstNumber);
}
/**
 * Format NZ GST number for Xero
 */
export function formatNZGSTNumber(gstNumber) {
    // Remove any non-digit characters
    const cleaned = gstNumber.replace(/\D/g, '');
    // Add NZ prefix if not present
    if (cleaned.length === 8 || cleaned.length === 9) {
        return `NZ${cleaned}`;
    }
    return gstNumber;
}
//# sourceMappingURL=mapping.js.map