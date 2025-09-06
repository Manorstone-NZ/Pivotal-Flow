import { Decimal } from 'decimal.js';
import { z } from 'zod';
import { calculateLineItem, calculateLineItems } from './lines.js';
import { calculateQuoteTotals, calculateQuoteTotalsWithBreakdown } from './totals.js';
/**
 * Main pricing orchestration module
 * Provides a single calculateQuote function for complete quote calculations
 */
// Zod schemas for input validation
export const MoneyAmountSchema = z.object({
    amount: z.custom((val) => val instanceof Decimal, {
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
    taxInclusive: z.boolean().optional(),
    taxRate: z.number().min(0).max(100).optional(),
    discountType: z.enum(['percentage', 'fixed_amount', 'per_unit']).optional(),
    discountValue: z.number().optional(),
    percentageDiscount: z.number().optional(),
    fixedDiscount: MoneyAmountSchema.optional()
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
// Debug output schemas
export const LineItemDebugSchema = z.object({
    lineNumber: z.number(),
    description: z.string(),
    steps: z.object({
        input: z.object({
            quantity: z.number(),
            unitPrice: MoneyAmountSchema,
            taxInclusive: z.boolean(),
            taxRate: z.number(),
            discountType: z.enum(['percentage', 'fixed_amount', 'per_unit']).optional(),
            discountValue: z.number().optional(),
            percentageDiscount: z.number().optional(),
            fixedDiscount: MoneyAmountSchema.optional()
        }),
        calculations: z.object({
            subtotal: MoneyAmountSchema,
            percentageDiscount: MoneyAmountSchema.optional(),
            fixedDiscount: MoneyAmountSchema.optional(),
            taxableAmount: MoneyAmountSchema,
            taxAmount: MoneyAmountSchema,
            totalAmount: MoneyAmountSchema
        }),
        breakdown: z.object({
            subtotal: z.string(),
            discount: z.string(),
            taxable: z.string(),
            tax: z.string(),
            total: z.string()
        })
    })
});
export const QuoteDebugSchema = z.object({
    lineCalculations: z.array(LineItemDebugSchema),
    quoteCalculations: z.object({
        input: z.object({
            lineTotals: z.array(MoneyAmountSchema),
            quoteDiscountType: z.enum(['percentage', 'fixed_amount', 'per_unit']).optional(),
            quoteDiscountValue: z.number().optional()
        }),
        calculations: z.object({
            subtotal: MoneyAmountSchema,
            quotePercentageDiscount: MoneyAmountSchema.optional(),
            quoteFixedDiscount: MoneyAmountSchema.optional(),
            taxableAmount: MoneyAmountSchema,
            taxAmount: MoneyAmountSchema,
            grandTotal: MoneyAmountSchema
        }),
        breakdown: z.object({
            subtotal: z.string(),
            discount: z.string(),
            taxable: z.string(),
            tax: z.string(),
            grandTotal: z.string()
        })
    }),
    taxBreakdown: z.array(z.object({
        rate: z.number(),
        taxableAmount: MoneyAmountSchema,
        taxAmount: MoneyAmountSchema,
        description: z.string()
    }))
});
/**
 * Main quote calculation function
 * Orchestrates all pricing calculations with proper validation and error handling
 */
export function calculateQuote(input, currencyDecimals = 2) {
    // Validate input
    const validatedInput = CalculateQuoteInputSchema.parse(input);
    try {
        // Ensure all line items have the same currency
        const currency = validatedInput.currency;
        const normalizedLineItems = validatedInput.lineItems.map(item => {
            const normalized = {
                ...item,
                unitPrice: {
                    ...item.unitPrice,
                    currency
                }
            };
            if (item.serviceType !== undefined)
                normalized.serviceType = item.serviceType;
            if (item.description !== undefined)
                normalized.description = item.description;
            return normalized;
        });
        // Calculate line items
        const lineCalculations = normalizedLineItems.map(item => calculateLineItem(item, currencyDecimals));
        // Calculate line items summary
        const lineSummary = calculateLineItems(normalizedLineItems, currencyDecimals);
        // Calculate quote totals
        const totals = validatedInput.quoteDiscount
            ? calculateQuoteTotals(lineCalculations, {
                type: validatedInput.quoteDiscount.type,
                value: validatedInput.quoteDiscount.value,
                ...(validatedInput.quoteDiscount.description && { description: validatedInput.quoteDiscount.description }),
            })
            : calculateQuoteTotals(lineCalculations);
        return {
            lineCalculations,
            totals,
            summary: lineSummary.summary
        };
    }
    catch (error) {
        throw new Error(`Quote calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Debug quote calculation function
 * Returns detailed intermediate calculation steps
 */
export function calculateQuoteDebug(input) {
    // Validate input
    const validatedInput = CalculateQuoteInputSchema.parse(input);
    try {
        // Ensure all line items have the same currency
        const currency = validatedInput.currency;
        const normalizedLineItems = validatedInput.lineItems.map(item => {
            const normalized = {
                ...item,
                unitPrice: {
                    ...item.unitPrice,
                    currency
                }
            };
            if (item.serviceType !== undefined)
                normalized.serviceType = item.serviceType;
            if (item.description !== undefined)
                normalized.description = item.description;
            return normalized;
        });
        // Calculate line items with debug information
        const lineCalculations = normalizedLineItems.map(calculateLineItem);
        // Calculate quote totals with breakdown
        const totalsWithBreakdown = validatedInput.quoteDiscount
            ? calculateQuoteTotalsWithBreakdown(lineCalculations, {
                type: validatedInput.quoteDiscount.type,
                value: validatedInput.quoteDiscount.value,
                ...(validatedInput.quoteDiscount.description && { description: validatedInput.quoteDiscount.description }),
            })
            : calculateQuoteTotalsWithBreakdown(lineCalculations);
        // Build debug output
        const debugLineCalculations = lineCalculations.map((calc, index) => {
            const lineItem = calc.lineItem;
            // Build breakdown strings
            const breakdown = {
                subtotal: `$${calc.subtotal.amount.toFixed(2)}`,
                discount: calc.discountAmount.amount.greaterThan(0)
                    ? `$${calc.discountAmount.amount.toFixed(2)}`
                    : '$0.00',
                taxable: `$${calc.taxableAmount.amount.toFixed(2)}`,
                tax: `$${calc.taxAmount.amount.toFixed(2)} (${lineItem.taxRate ?? 15}%)`,
                total: `$${calc.totalAmount.amount.toFixed(2)}`
            };
            return {
                lineNumber: index + 1,
                description: lineItem.description,
                steps: {
                    input: {
                        quantity: lineItem.quantity,
                        unitPrice: lineItem.unitPrice,
                        taxInclusive: lineItem.taxInclusive ?? false,
                        taxRate: lineItem.taxRate ?? 15,
                        discountType: lineItem.discountType,
                        discountValue: lineItem.discountValue,
                        percentageDiscount: lineItem.percentageDiscount,
                        fixedDiscount: lineItem.fixedDiscount
                    },
                    calculations: {
                        subtotal: calc.subtotal,
                        percentageDiscount: lineItem.percentageDiscount && lineItem.percentageDiscount > 0
                            ? { amount: calc.discountAmount.amount, currency: calc.discountAmount.currency }
                            : undefined,
                        fixedDiscount: lineItem.fixedDiscount && lineItem.fixedDiscount.amount.greaterThan(0)
                            ? lineItem.fixedDiscount
                            : undefined,
                        taxableAmount: calc.taxableAmount,
                        taxAmount: calc.taxAmount,
                        totalAmount: calc.totalAmount
                    },
                    breakdown
                }
            };
        });
        // Build quote calculations debug
        const lineTotals = lineCalculations.map(calc => calc.totalAmount);
        const quoteCalculations = {
            input: {
                lineTotals,
                quoteDiscountType: validatedInput.quoteDiscount?.type,
                quoteDiscountValue: validatedInput.quoteDiscount?.value
            },
            calculations: {
                subtotal: totalsWithBreakdown.subtotal,
                quotePercentageDiscount: validatedInput.quoteDiscount?.type === 'percentage'
                    ? totalsWithBreakdown.discountAmount
                    : undefined,
                quoteFixedDiscount: validatedInput.quoteDiscount?.type === 'fixed_amount'
                    ? totalsWithBreakdown.discountAmount
                    : undefined,
                taxableAmount: totalsWithBreakdown.taxableAmount,
                taxAmount: totalsWithBreakdown.taxAmount,
                grandTotal: totalsWithBreakdown.grandTotal
            },
            breakdown: {
                subtotal: `$${totalsWithBreakdown.subtotal.amount.toFixed(2)}`,
                discount: totalsWithBreakdown.discountAmount.amount.greaterThan(0)
                    ? `$${totalsWithBreakdown.discountAmount.amount.toFixed(2)}`
                    : '$0.00',
                taxable: `$${totalsWithBreakdown.taxableAmount.amount.toFixed(2)}`,
                tax: `$${totalsWithBreakdown.taxAmount.amount.toFixed(2)}`,
                grandTotal: `$${totalsWithBreakdown.grandTotal.amount.toFixed(2)}`
            }
        };
        return {
            lineCalculations: debugLineCalculations,
            quoteCalculations,
            taxBreakdown: totalsWithBreakdown.taxBreakdown
        };
    }
    catch (error) {
        throw new Error(`Quote debug calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Validate quote calculation input without performing calculations
 */
export function validateQuoteInput(input) {
    try {
        CalculateQuoteInputSchema.parse(input);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get calculation breakdown for display purposes
 */
export function getQuoteBreakdown(calculation) {
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
//# sourceMappingURL=index.js.map