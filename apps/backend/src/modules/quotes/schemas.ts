import { z } from 'zod';
import { Decimal } from 'decimal.js';

// Quote status enum based on B.1 specification
export const QuoteStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus];

// Quote type enum
export const QuoteType = {
  PROJECT: 'project',
  SERVICE: 'service',
  PRODUCT: 'product',
  RECURRING: 'recurring',
  ONE_TIME: 'one_time'
} as const;

export type QuoteType = typeof QuoteType[keyof typeof QuoteType];

// Line item type enum
export const LineItemType = {
  SERVICE: 'service',
  PRODUCT: 'product',
  MATERIAL: 'material',
  TRAVEL: 'travel',
  EXPENSE: 'expense',
  DISCOUNT: 'discount',
  TAX: 'tax'
} as const;

export type LineItemType = typeof LineItemType[keyof typeof LineItemType];

// Discount type enum
export const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  PER_UNIT: 'per_unit'
} as const;

export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

// Decimal schema for validation
const DecimalSchema = z.custom<Decimal>((val) => val instanceof Decimal, {
  message: 'Amount must be a Decimal instance'
});

// Money amount schema
const MoneyAmountSchema = z.object({
  amount: DecimalSchema,
  currency: z.string().length(3)
});

// Quote line item schema
export const QuoteLineItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  type: z.enum(Object.values(LineItemType) as [string, ...string[]]).default(LineItemType.SERVICE),
  description: z.string().min(1).max(1000),
  sku: z.string().max(50).optional(), // SKU/code for rate card lookup
  quantity: z.number().positive(),
  unitPrice: MoneyAmountSchema,
  unitCost: MoneyAmountSchema.optional(),
  unit: z.string().max(50).default('hour'), // New field
  taxInclusive: z.boolean().default(false), // New field
  taxRate: z.number().min(0).max(1).default(0.15),
  discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]).optional(),
  discountValue: z.number().min(0).optional(),
  percentageDiscount: z.number().min(0).max(100).optional(), // New field
  fixedDiscount: MoneyAmountSchema.optional(), // New field
  serviceCategoryId: z.string().uuid().optional(),
  rateCardId: z.string().uuid().optional(),
  metadata: z.record(z.any()).default({})
});

// Quote creation schema
export const CreateQuoteSchema = z.object({
  customerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  title: z.string().min(3).max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(Object.values(QuoteType) as [string, ...string[]]).default(QuoteType.PROJECT),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  currency: z.string().length(3).default('NZD'),
  exchangeRate: z.number().positive().default(1.0),
  taxRate: z.number().min(0).max(1).default(0.15),
  discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]).optional(),
  discountValue: z.number().min(0).optional(),
  termsConditions: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  lineItems: z.array(QuoteLineItemSchema).min(1).max(1000)
});

// Quote update schema
export const UpdateQuoteSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(Object.values(QuoteType) as [string, ...string[]]).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  currency: z.string().length(3).optional(),
  exchangeRate: z.number().positive().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]).optional(),
  discountValue: z.number().min(0).optional(),
  termsConditions: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  lineItems: z.array(QuoteLineItemSchema).min(1).max(1000).optional()
});

// Quote status transition schema
export const QuoteStatusTransitionSchema = z.object({
  status: z.enum(Object.values(QuoteStatus) as [string, ...string[]]),
  notes: z.string().max(2000).optional()
});

// Quote list filters schema
export const QuoteListFiltersSchema = z.object({
  status: z.enum(Object.values(QuoteStatus) as [string, ...string[]]).optional(),
  customerId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  type: z.enum(Object.values(QuoteType) as [string, ...string[]]).optional(),
  q: z.string().max(100).optional(), // Search query
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  createdBy: z.string().uuid().optional()
});

// Quote list pagination schema
export const QuoteListPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status', 'totalAmount', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Quote response schema
export const QuoteResponseSchema = z.object({
  id: z.string().uuid(),
  quoteNumber: z.string(),
  customerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(Object.values(QuoteStatus) as [string, ...string[]]),
  type: z.enum(Object.values(QuoteType) as [string, ...string[]]),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  currency: z.string(),
  exchangeRate: z.number(),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]).optional(),
  discountValue: z.number().optional(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  termsConditions: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  createdBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lineItems: z.array(z.object({
    id: z.string().uuid(),
    lineNumber: z.number(),
    type: z.enum(Object.values(LineItemType) as [string, ...string[]]),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    unitCost: z.number().optional(),
    taxRate: z.number(),
    taxAmount: z.number(),
    discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]).optional(),
    discountValue: z.number().optional(),
    discountAmount: z.number(),
    subtotal: z.number(),
    totalAmount: z.number(),
    serviceCategoryId: z.string().uuid().optional(),
    rateCardId: z.string().uuid().optional(),
    metadata: z.record(z.any()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  }))
});

// Quote list response schema
export const QuoteListResponseSchema = z.object({
  quotes: z.array(QuoteResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// Error response schema
export const QuoteErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
});

// Status transition validation
export const STATUS_TRANSITIONS = {
  [QuoteStatus.DRAFT]: [QuoteStatus.PENDING, QuoteStatus.CANCELLED],
  [QuoteStatus.PENDING]: [QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.CANCELLED],
  [QuoteStatus.APPROVED]: [QuoteStatus.SENT],
  [QuoteStatus.SENT]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED],
  [QuoteStatus.ACCEPTED]: [],
  [QuoteStatus.REJECTED]: [],
  [QuoteStatus.CANCELLED]: []
} as const;

// Validation function for status transitions
export function isValidStatusTransition(fromStatus: QuoteStatus, toStatus: QuoteStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus] as unknown as QuoteStatus[];
  return allowedTransitions.includes(toStatus);
}

// Validation function for quote data
export function validateQuoteData(data: z.infer<typeof CreateQuoteSchema>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate dates
  if (new Date(data.validFrom) >= new Date(data.validUntil)) {
    errors.push('Valid from date must be before valid until date');
  }

  // Validate line items
  if (data.lineItems.length === 0) {
    errors.push('At least one line item is required');
  }

  // Validate line item references
  for (const lineItem of data.lineItems) {
    if (!lineItem.serviceCategoryId && !lineItem.rateCardId) {
      errors.push(`Line item ${lineItem.lineNumber} must reference either a service category or rate card`);
    }

    if (lineItem.quantity <= 0) {
      errors.push(`Line item ${lineItem.lineNumber} quantity must be greater than 0`);
    }

    // Handle both Decimal objects and string/number values
    const unitPriceAmount = typeof lineItem.unitPrice.amount === 'object' && lineItem.unitPrice.amount !== null && 'toNumber' in lineItem.unitPrice.amount
      ? (lineItem.unitPrice.amount as unknown as { toNumber(): number }).toNumber()
      : parseFloat(String(lineItem.unitPrice.amount));
    
    if (unitPriceAmount < 0) {
      errors.push(`Line item ${lineItem.lineNumber} unit price cannot be negative`);
    }

    if (lineItem.discountValue !== undefined && lineItem.discountValue < 0) {
      errors.push(`Line item ${lineItem.lineNumber} discount value cannot be negative`);
    }
  }

  // Validate discount
  if (data.discountValue !== undefined && data.discountValue < 0) {
    errors.push('Discount value cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
