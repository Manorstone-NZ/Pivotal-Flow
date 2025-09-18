import { Type } from '@sinclair/typebox';
import type { Static } from '@sinclair/typebox';

// Invoice Status enum
export const InvoiceStatusSchema = Type.Union([
  Type.Literal('draft'),
  Type.Literal('sent'),
  Type.Literal('part_paid'),
  Type.Literal('paid'),
  Type.Literal('overdue'),
  Type.Literal('written_off'),
  Type.Literal('void'),
]);

export type InvoiceStatus = Static<typeof InvoiceStatusSchema>;

// Invoice Line Item Schema
export const InvoiceLineItemSchema = Type.Object({
  id: Type.String(),
  invoiceId: Type.String(),
  lineNumber: Type.Number(),
  description: Type.String(),
  quantity: Type.Number(),
  unitPrice: Type.Number(),
  subtotal: Type.Number(),
  taxRate: Type.Number(),
  taxAmount: Type.Number(),
  totalAmount: Type.Number(),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type InvoiceLineItem = Static<typeof InvoiceLineItemSchema>;

// Payment Schema
export const PaymentSchema = Type.Object({
  id: Type.String(),
  invoiceId: Type.String(),
  amount: Type.Number(),
  currency: Type.String(),
  paymentDate: Type.String(),
  paymentMethod: Type.Optional(Type.String()),
  reference: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type Payment = Static<typeof PaymentSchema>;

// Customer Schema (simplified for invoice context)
export const InvoiceCustomerSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
});

export type InvoiceCustomer = Static<typeof InvoiceCustomerSchema>;

// Main Invoice Schema
export const InvoiceSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  invoiceNumber: Type.String(),
  customerId: Type.String(),
  projectId: Type.Optional(Type.String()),
  quoteId: Type.Optional(Type.String()),
  
  // Financial data
  currency: Type.String(),
  subtotal: Type.Number(),
  taxAmount: Type.Number(),
  discountAmount: Type.Number(),
  totalAmount: Type.Number(),
  paidAmount: Type.Number(),
  balanceAmount: Type.Number(),
  
  // Status and dates
  status: InvoiceStatusSchema,
  issuedAt: Type.Optional(Type.String()),
  dueAt: Type.Optional(Type.String()),
  paidAt: Type.Optional(Type.String()),
  overdueAt: Type.Optional(Type.String()),
  writtenOffAt: Type.Optional(Type.String()),
  
  // Content
  title: Type.String(),
  description: Type.Optional(Type.String()),
  termsConditions: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  internalNotes: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  
  // Relations (populated when requested)
  customer: Type.Optional(InvoiceCustomerSchema),
  lineItems: Type.Optional(Type.Array(InvoiceLineItemSchema)),
  payments: Type.Optional(Type.Array(PaymentSchema)),
  
  // Audit fields
  createdBy: Type.String(),
  approvedBy: Type.Optional(Type.String()),
  approvedAt: Type.Optional(Type.String()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  
  // ETag for caching
  etag: Type.Optional(Type.String()),
});

export type Invoice = Static<typeof InvoiceSchema>;

// Create Invoice Schema
export const CreateInvoiceSchema = Type.Object({
  customerId: Type.String(),
  projectId: Type.Optional(Type.String()),
  quoteId: Type.Optional(Type.String()),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  termsConditions: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  currency: Type.Optional(Type.String()),
  dueDate: Type.Optional(Type.String()),
  lineItems: Type.Optional(Type.Array(Type.Object({
    description: Type.String(),
    quantity: Type.Number(),
    unitPrice: Type.Number(),
  }))),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type CreateInvoice = Static<typeof CreateInvoiceSchema>;

// Update Invoice Schema
export const UpdateInvoiceSchema = Type.Partial(
  Type.Object({
    title: Type.String(),
    description: Type.String(),
    termsConditions: Type.String(),
    notes: Type.String(),
    dueDate: Type.String(),
    metadata: Type.Record(Type.String(), Type.Any()),
  })
);

export type UpdateInvoice = Static<typeof UpdateInvoiceSchema>;

// Invoice Status Transition Schema
export const InvoiceStatusTransitionSchema = Type.Object({
  status: InvoiceStatusSchema,
  reason: Type.Optional(Type.String()),
  effectiveDate: Type.Optional(Type.String()),
});

export type InvoiceStatusTransition = Static<typeof InvoiceStatusTransitionSchema>;

// Mark Invoice Paid Schema
export const MarkInvoicePaidSchema = Type.Object({
  paymentDate: Type.String(),
  amount: Type.Optional(Type.Number()), // If not provided, uses full balance
  paymentMethod: Type.Optional(Type.String()),
  reference: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
});

export type MarkInvoicePaid = Static<typeof MarkInvoicePaidSchema>;

// Void Invoice Schema
export const VoidInvoiceSchema = Type.Object({
  reason: Type.String(),
  effectiveDate: Type.Optional(Type.String()),
});

export type VoidInvoice = Static<typeof VoidInvoiceSchema>;

// Invoice List Filters Schema
export const InvoiceListFiltersSchema = Type.Object({
  status: Type.Optional(InvoiceStatusSchema),
  customerId: Type.Optional(Type.String()),
  projectId: Type.Optional(Type.String()),
  currency: Type.Optional(Type.String()),
  issuedAfter: Type.Optional(Type.String()),
  issuedBefore: Type.Optional(Type.String()),
  dueAfter: Type.Optional(Type.String()),
  dueBefore: Type.Optional(Type.String()),
  minAmount: Type.Optional(Type.Number()),
  maxAmount: Type.Optional(Type.Number()),
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
  sort: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
});

export type InvoiceListFilters = Static<typeof InvoiceListFiltersSchema>;

// Invoice Response Schema
export const InvoiceResponseSchema = InvoiceSchema;

// Invoice List Response Schema
export const InvoiceListResponseSchema = Type.Object({
  data: Type.Array(InvoiceSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
  etag: Type.Optional(Type.String()),
});

export type InvoiceListResponse = Static<typeof InvoiceListResponseSchema>;

// Error Response Schema
export const InvoiceErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String(),
  details: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type InvoiceError = Static<typeof InvoiceErrorSchema>;
