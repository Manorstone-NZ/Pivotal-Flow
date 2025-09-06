/**
 * Portal Module Schemas
 * 
 * Zod validation schemas for portal API requests and responses
 */

import { z } from 'zod';

import { 
  CUSTOMER_VISIBLE_QUOTE_STATUSES, 
  CUSTOMER_VISIBLE_INVOICE_STATUSES,
  PORTAL_CONFIG 
} from './constants.js';

// Common pagination schema
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PORTAL_CONFIG.MAX_PAGE_SIZE).default(PORTAL_CONFIG.DEFAULT_PAGE_SIZE)
});

// Date range validation helpers
const ISODateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format (YYYY-MM-DD)');
const ISODateTimeString = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Must be ISO datetime format');
const YearMonthString = z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM format');

// Base filter schemas without pagination
const BasePortalQuoteFiltersSchema = z.object({
  status: z.union([
    z.enum(Object.values(CUSTOMER_VISIBLE_QUOTE_STATUSES) as [string, ...string[]]),
    z.array(z.enum(Object.values(CUSTOMER_VISIBLE_QUOTE_STATUSES) as [string, ...string[]]))
  ]).optional(),
  fromDate: ISODateString.optional(),
  toDate: ISODateString.optional()
});

const BasePortalInvoiceFiltersSchema = z.object({
  status: z.union([
    z.enum(Object.values(CUSTOMER_VISIBLE_INVOICE_STATUSES) as [string, ...string[]]),
    z.array(z.enum(Object.values(CUSTOMER_VISIBLE_INVOICE_STATUSES) as [string, ...string[]]))
  ]).optional(),
  fromDate: ISODateString.optional(),
  toDate: ISODateString.optional()
});

const BasePortalTimeEntryFiltersSchema = z.object({
  projectId: z.string().uuid().optional(),
  fromMonth: YearMonthString.optional(),
  toMonth: YearMonthString.optional()
});

// Quote filter schemas
export const PortalQuoteFiltersSchema = BasePortalQuoteFiltersSchema.extend({
  page: PaginationSchema.shape.page,
  limit: PaginationSchema.shape.limit
}).refine(data => {
  if (data.fromDate && data.toDate) {
    return new Date(data.fromDate) <= new Date(data.toDate);
  }
  return true;
}, {
  message: "fromDate must be before or equal to toDate",
  path: ["fromDate"]
});

// Invoice filter schemas  
export const PortalInvoiceFiltersSchema = BasePortalInvoiceFiltersSchema.extend({
  page: PaginationSchema.shape.page,
  limit: PaginationSchema.shape.limit
}).refine(data => {
  if (data.fromDate && data.toDate) {
    return new Date(data.fromDate) <= new Date(data.toDate);
  }
  return true;
}, {
  message: "fromDate must be before or equal to toDate",
  path: ["fromDate"]
});

// Time entry filter schemas
export const PortalTimeEntryFiltersSchema = BasePortalTimeEntryFiltersSchema.extend({
  page: PaginationSchema.shape.page,
  limit: PaginationSchema.shape.limit
}).refine(data => {
  if (data.fromMonth && data.toMonth) {
    return data.fromMonth <= data.toMonth;
  }
  return true;
}, {
  message: "fromMonth must be before or equal to toMonth",
  path: ["fromMonth"]
});

// Schemas for route validation (without required pagination)
export const PortalQuoteQuerySchema = BasePortalQuoteFiltersSchema.extend({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PORTAL_CONFIG.MAX_PAGE_SIZE).optional()
});

export const PortalInvoiceQuerySchema = BasePortalInvoiceFiltersSchema.extend({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PORTAL_CONFIG.MAX_PAGE_SIZE).optional()
});

export const PortalTimeEntryQuerySchema = BasePortalTimeEntryFiltersSchema.extend({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PORTAL_CONFIG.MAX_PAGE_SIZE).optional()
});

// Portal user context schema (for auth middleware)
export const PortalUserContextSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  userType: z.literal('external_customer'),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

// Quote response schemas
export const PortalQuoteLineItemSchema = z.object({
  id: z.string().uuid(),
  lineNumber: z.number().int().min(1),
  type: z.string(),
  sku: z.string().nullable(),
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  discountPercent: z.string(),
  discountAmount: z.string(),
  taxPercent: z.string(),
  taxAmount: z.string(),
  subtotal: z.string(),
  total: z.string()
});

export const PortalQuoteSchema = z.object({
  id: z.string().uuid(),
  quoteNumber: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(Object.values(CUSTOMER_VISIBLE_QUOTE_STATUSES) as [string, ...string[]]),
  type: z.string(),
  validFrom: ISODateString,
  validUntil: ISODateString,
  currency: z.string().length(3),
  subtotal: z.string(),
  taxAmount: z.string(),
  discountAmount: z.string(),
  totalAmount: z.string(),
  notes: z.string().nullable(),
  approvedAt: ISODateTimeString.nullable(),
  sentAt: ISODateTimeString.nullable(),
  acceptedAt: ISODateTimeString.nullable(),
  expiresAt: ISODateTimeString.nullable(),
  createdAt: ISODateTimeString,
  updatedAt: ISODateTimeString
});

export const PortalQuoteDetailSchema = PortalQuoteSchema.extend({
  lineItems: z.array(PortalQuoteLineItemSchema)
});

// Invoice response schemas
export const PortalInvoiceLineItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  discountAmount: z.string(),
  totalAmount: z.string(),
  unit: z.string()
});

export const PortalInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(Object.values(CUSTOMER_VISIBLE_INVOICE_STATUSES) as [string, ...string[]]),
  currency: z.string().length(3),
  subtotal: z.string(),
  taxAmount: z.string(),
  discountAmount: z.string(),
  totalAmount: z.string(),
  paidAmount: z.string(),
  balanceAmount: z.string(),
  issuedAt: ISODateTimeString.nullable(),
  dueAt: ISODateTimeString.nullable(),
  paidAt: ISODateTimeString.nullable(),
  notes: z.string().nullable(),
  createdAt: ISODateTimeString,
  updatedAt: ISODateTimeString
});

export const PortalInvoiceDetailSchema = PortalInvoiceSchema.extend({
  lineItems: z.array(PortalInvoiceLineItemSchema)
});

// Time entry response schemas
export const PortalTimeEntrySummarySchema = z.object({
  projectId: z.string().uuid(),
  projectName: z.string(),
  month: YearMonthString,
  totalHours: z.string(),
  totalAmount: z.string(),
  currency: z.string().length(3)
});

// Pagination response schema
const PaginationResponseSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

// Paginated list response schemas
export const PortalQuoteListResponseSchema = z.object({
  data: z.array(PortalQuoteSchema),
  pagination: PaginationResponseSchema
});

export const PortalInvoiceListResponseSchema = z.object({
  data: z.array(PortalInvoiceSchema),
  pagination: PaginationResponseSchema
});

export const PortalTimeEntryListResponseSchema = z.object({
  data: z.array(PortalTimeEntrySummarySchema),
  pagination: PaginationResponseSchema
});

// Error response schema for portal APIs
export const PortalErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
});

// Rate limit headers schema
export const RateLimitHeadersSchema = z.object({
  'X-RateLimit-Limit': z.string(),
  'X-RateLimit-Remaining': z.string(),
  'X-RateLimit-Reset': z.string(),
  'X-RateLimit-Window': z.string()
});
