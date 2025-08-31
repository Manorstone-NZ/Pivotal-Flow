import { Decimal } from 'decimal.js';
import { z } from 'zod';
import { MoneyAmount, createDecimal } from './money.js';
import { calculateTax } from './taxes.js';
import { calculateDiscount, DiscountType } from './discounts.js';
import { LineItem, calculateLineItem, calculateLineItems } from './lines.js';
import { QuoteTotals, calculateQuoteTotals, QuoteDiscount } from './totals.js';

/**
 * Main pricing orchestration module
 * Provides a single calculateQuote function for complete quote calculations
 */

// Zod schemas for input validation
export const MoneyAmountSchema = z.object({
  amount: z.custom<Decimal>((val) => val instanceof Decimal, {
    message: 'Amount must be a Decimal instance'
  }),
  currency: z.string().min(1)
});

export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: MoneyAmountSchema,
  unit: z.string().min(1),
  serviceType: z.string().optional(),
  isTaxExempt: z.boolean().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discountType: z.enum(['percentage', 'fixed_amount', 'per_unit']).optional(),
  discountValue: z.number().optional()
});

export const QuoteDiscountSchema = z.object({
  type: z.enum(['percentage', 'fixed_amount', 'per_unit']),
  value: z.number().nonnegative(),
  description: z.string().optional()
});

export const CalculateQuoteInputSchema = z.object({
  lineItems: z.array(LineItemSchema).min(1),
  quoteDiscount: QuoteDiscountSchema.optional(),
  currency: z.string().default('NZD')
});

// Output schemas
export const LineItemCalculationSchema = z.object({
  lineItem: LineItemSchema,
  quantity: z.number(),
  unitPrice: MoneyAmountSchema,
  subtotal: MoneyAmountSchema,
  discountAmount: MoneyAmountSchema,
  taxableAmount: MoneyAmountSchema,
  taxAmount: MoneyAmountSchema,
  totalAmount: MoneyAmountSchema
});

export const QuoteCalculationSchema = z.object({
  lineCalculations: z.array(LineItemCalculationSchema),
  totals: z.object({
    subtotal: MoneyAmountSchema,
    discountAmount: MoneyAmountSchema,
    taxableAmount: MoneyAmountSchema,
    taxAmount: MoneyAmountSchema,
    grandTotal: MoneyAmountSchema,
    currency: z.string()
  }),
  summary: z.object({
    totalQuantity: z.number(),
    subtotal: MoneyAmountSchema,
    totalDiscount: MoneyAmountSchema,
    totalTaxable: MoneyAmountSchema,
    totalTax: MoneyAmountSchema,
    totalAmount: MoneyAmountSchema
  })
});

export type CalculateQuoteInput = z.infer<typeof CalculateQuoteInputSchema>;
export type QuoteCalculation = z.infer<typeof QuoteCalculationSchema>;

/**
 * Main quote calculation function
 * Orchestrates all pricing calculations with proper validation and error handling
 */
export function calculateQuote(input: CalculateQuoteInput): QuoteCalculation {
  // Validate input
  const validatedInput = CalculateQuoteInputSchema.parse(input);
  
  try {
    // Ensure all line items have the same currency
    const currency = validatedInput.currency;
    const normalizedLineItems = validatedInput.lineItems.map(item => ({
      ...item,
      unitPrice: {
        ...item.unitPrice,
        currency
      }
    }));
    
    // Calculate line items
    const lineCalculations = normalizedLineItems.map(calculateLineItem);
    
    // Calculate line items summary
    const lineSummary = calculateLineItems(normalizedLineItems);
    
    // Calculate quote totals
    const totals = validatedInput.quoteDiscount
      ? calculateQuoteTotals(lineCalculations, validatedInput.quoteDiscount)
      : calculateQuoteTotals(lineCalculations);
    
    return {
      lineCalculations,
      totals,
      summary: lineSummary.summary
    };
  } catch (error) {
    throw new Error(`Quote calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate quote calculation input without performing calculations
 */
export function validateQuoteInput(input: unknown): boolean {
  try {
    CalculateQuoteInputSchema.parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get calculation breakdown for display purposes
 */
export function getQuoteBreakdown(calculation: QuoteCalculation): {
  lineItems: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
  }>;
  totals: {
    subtotal: string;
    discount: string;
    taxable: string;
    tax: string;
    grandTotal: string;
  };
} {
  const lineItems = calculation.lineCalculations.map(calc => ({
    description: calc.lineItem.description,
    quantity: calc.quantity.toString(),
    unitPrice: `${calc.unitPrice.currency} ${calc.unitPrice.amount.toFixed(2)}`,
    subtotal: `${calc.subtotal.currency} ${calc.subtotal.amount.toFixed(2)}`,
    discount: calc.discountAmount.amount.isZero()
      ? '-'
      : `${calc.discountAmount.currency} ${calc.discountAmount.amount.toFixed(2)}`,
    tax: calc.taxAmount.amount.isZero()
      ? '-'
      : `${calc.taxAmount.currency} ${calc.taxAmount.amount.toFixed(2)}`,
    total: `${calc.totalAmount.currency} ${calc.totalAmount.amount.toFixed(2)}`
  }));
  
  const totals = {
    subtotal: `${calculation.totals.currency} ${calculation.totals.subtotal.amount.toFixed(2)}`,
    discount: calculation.totals.discountAmount.amount.isZero()
      ? '-'
      : `${calculation.totals.currency} ${calculation.totals.discountAmount.amount.toFixed(2)}`,
    taxable: `${calculation.totals.currency} ${calculation.totals.taxableAmount.amount.toFixed(2)}`,
    tax: calculation.totals.taxAmount.amount.isZero()
      ? '-'
      : `${calculation.totals.currency} ${calculation.totals.taxAmount.amount.toFixed(2)}`,
    grandTotal: `${calculation.totals.currency} ${calculation.totals.grandTotal.amount.toFixed(2)}`
  };
  
  return { lineItems, totals };
}

// Re-export all types and functions for convenience
export * from './money.js';
export * from './taxes.js';
export * from './discounts.js';
export * from './lines.js';
export * from './totals.js';
