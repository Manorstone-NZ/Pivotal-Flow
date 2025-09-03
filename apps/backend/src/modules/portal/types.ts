/**
 * Portal Module Types
 * 
 * Type definitions for the customer portal API system
 */

import type { CustomerVisibleQuoteStatus, CustomerVisibleInvoiceStatus } from './constants.js';

// Base portal user context for security
export interface PortalUserContext {
  userId: string;
  organizationId: string;
  customerId: string; // Required for external customer users
  userType: 'external_customer';
  email: string;
  firstName: string;
  lastName: string;
}

// Quote data visible to customers (read-only, no internal fields)
export interface PortalQuote {
  id: string;
  quoteNumber: string;
  title: string;
  description: string | null;
  status: CustomerVisibleQuoteStatus;
  type: string;
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  currency: string;
  subtotal: string; // Decimal as string
  taxAmount: string; // Decimal as string
  discountAmount: string; // Decimal as string
  totalAmount: string; // Decimal as string
  notes: string | null;
  approvedAt: string | null; // ISO datetime string
  sentAt: string | null; // ISO datetime string
  acceptedAt: string | null; // ISO datetime string
  expiresAt: string | null; // ISO datetime string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Quote line item visible to customers
export interface PortalQuoteLineItem {
  id: string;
  lineNumber: number;
  type: string;
  sku: string | null;
  description: string;
  quantity: string; // Decimal as string
  unitPrice: string; // Decimal as string
  discountPercent: string; // Decimal as string
  discountAmount: string; // Decimal as string
  taxPercent: string; // Decimal as string
  taxAmount: string; // Decimal as string
  subtotal: string; // Decimal as string
  total: string; // Decimal as string
}

// Detailed quote with line items
export interface PortalQuoteDetail extends PortalQuote {
  lineItems: PortalQuoteLineItem[];
}

// Invoice data visible to customers (read-only)
export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  status: CustomerVisibleInvoiceStatus;
  currency: string;
  subtotal: string; // Decimal as string
  taxAmount: string; // Decimal as string
  discountAmount: string; // Decimal as string
  totalAmount: string; // Decimal as string
  paidAmount: string; // Decimal as string
  balanceAmount: string; // Decimal as string
  issuedAt: string | null; // ISO datetime string
  dueAt: string | null; // ISO datetime string
  paidAt: string | null; // ISO datetime string
  notes: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Invoice line item visible to customers
export interface PortalInvoiceLineItem {
  id: string;
  description: string;
  quantity: string; // Decimal as string
  unitPrice: string; // Decimal as string
  subtotal: string; // Decimal as string
  taxAmount: string; // Decimal as string
  discountAmount: string; // Decimal as string
  totalAmount: string; // Decimal as string
  unit: string;
}

// Detailed invoice with line items
export interface PortalInvoiceDetail extends PortalInvoice {
  lineItems: PortalInvoiceLineItem[];
}

// Time entry summary (approved entries only)
export interface PortalTimeEntrySummary {
  projectId: string;
  projectName: string;
  month: string; // YYYY-MM format
  totalHours: string; // Decimal as string
  totalAmount: string; // Decimal as string (if billable)
  currency: string;
}

// List query filters with strict customer isolation
export interface PortalQuoteFilters {
  status?: CustomerVisibleQuoteStatus | CustomerVisibleQuoteStatus[];
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
  page?: number;
  limit?: number;
}

export interface PortalInvoiceFilters {
  status?: CustomerVisibleInvoiceStatus | CustomerVisibleInvoiceStatus[];
  fromDate?: string; // ISO date string  
  toDate?: string; // ISO date string
  page?: number;
  limit?: number;
}

export interface PortalTimeEntryFilters {
  projectId?: string;
  fromMonth?: string; // YYYY-MM format
  toMonth?: string; // YYYY-MM format
  page?: number;
  limit?: number;
}

// Paginated response wrapper
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

// List response types
export interface PortalQuoteListResponse extends PortalPaginatedResponse<PortalQuote> {}
export interface PortalInvoiceListResponse extends PortalPaginatedResponse<PortalInvoice> {}
export interface PortalTimeEntryListResponse extends PortalPaginatedResponse<PortalTimeEntrySummary> {}

// Security violation details for audit logging
export interface PortalSecurityViolation {
  violationType: 'cross_tenant' | 'cross_customer' | 'unauthorized_access';
  attemptedAction: string;
  attemptedResource: string;
  attemptedResourceId?: string;
  userContext: PortalUserContext;
  timestamp: string;
}

// Rate limit context
export interface PortalRateLimitContext {
  userId: string;
  organizationId: string;
  customerId: string;
  endpoint: string;
  windowStart: number;
  requestCount: number;
  limit: number;
}
