/**
 * Portal Module Types
 *
 * Type definitions for the customer portal API system
 */
import type { CustomerVisibleQuoteStatus, CustomerVisibleInvoiceStatus } from './constants.js';
export interface PortalUserContext {
    userId: string;
    organizationId: string;
    customerId: string;
    userType: 'external_customer';
    email: string;
    firstName: string;
    lastName: string;
}
export interface PortalQuote {
    id: string;
    quoteNumber: string;
    title: string;
    description: string | null;
    status: CustomerVisibleQuoteStatus;
    type: string;
    validFrom: string;
    validUntil: string;
    currency: string;
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    totalAmount: string;
    notes: string | null;
    approvedAt: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface PortalQuoteLineItem {
    id: string;
    lineNumber: number;
    type: string;
    sku: string | null;
    description: string;
    quantity: string;
    unitPrice: string;
    discountPercent: string;
    discountAmount: string;
    taxPercent: string;
    taxAmount: string;
    subtotal: string;
    total: string;
}
export interface PortalQuoteDetail extends PortalQuote {
    lineItems: PortalQuoteLineItem[];
}
export interface PortalInvoice {
    id: string;
    invoiceNumber: string;
    title: string;
    description: string | null;
    status: CustomerVisibleInvoiceStatus;
    currency: string;
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    totalAmount: string;
    paidAmount: string;
    balanceAmount: string;
    issuedAt: string | null;
    dueAt: string | null;
    paidAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface PortalInvoiceLineItem {
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    totalAmount: string;
    unit: string;
}
export interface PortalInvoiceDetail extends PortalInvoice {
    lineItems: PortalInvoiceLineItem[];
}
export interface PortalTimeEntrySummary {
    projectId: string;
    projectName: string;
    month: string;
    totalHours: string;
    totalAmount: string;
    currency: string;
}
export interface PortalQuoteFilters {
    status?: CustomerVisibleQuoteStatus | CustomerVisibleQuoteStatus[];
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export interface PortalInvoiceFilters {
    status?: CustomerVisibleInvoiceStatus | CustomerVisibleInvoiceStatus[];
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export interface PortalTimeEntryFilters {
    projectId?: string;
    fromMonth?: string;
    toMonth?: string;
    page?: number;
    limit?: number;
}
export interface PortalPaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface PortalQuoteListResponse extends PortalPaginatedResponse<PortalQuote> {
}
export interface PortalInvoiceListResponse extends PortalPaginatedResponse<PortalInvoice> {
}
export interface PortalTimeEntryListResponse extends PortalPaginatedResponse<PortalTimeEntrySummary> {
}
export interface PortalSecurityViolation {
    violationType: 'cross_tenant' | 'cross_customer' | 'unauthorized_access';
    attemptedAction: string;
    attemptedResource: string;
    attemptedResourceId?: string;
    userContext: PortalUserContext;
    timestamp: string;
}
export interface PortalRateLimitContext {
    userId: string;
    organizationId: string;
    customerId: string;
    endpoint: string;
    windowStart: number;
    requestCount: number;
    limit: number;
}
//# sourceMappingURL=types.d.ts.map