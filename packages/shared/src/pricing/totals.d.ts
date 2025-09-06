import type { DiscountType } from './discounts.js';
import type { LineItemCalculation } from './lines.js';
import type { MoneyAmount } from './money.js';
import type { TaxBreakdown } from './taxes.js';
/**
 * Quote totals calculation functions
 */
export interface QuoteTotals {
    subtotal: MoneyAmount;
    discountAmount: MoneyAmount;
    taxableAmount: MoneyAmount;
    taxAmount: MoneyAmount;
    grandTotal: MoneyAmount;
    currency: string;
}
export interface QuoteDiscount {
    type: DiscountType;
    value: number;
    description?: string;
}
export interface QuoteCalculationWithBreakdown extends QuoteTotals {
    taxBreakdown: TaxBreakdown[];
}
/**
 * Calculate quote totals from line item calculations
 * Line items already include tax, so we use their totals directly
 */
export declare function calculateQuoteTotals(lineCalculations: LineItemCalculation[], quoteDiscount?: QuoteDiscount): QuoteTotals;
/**
 * Calculate quote totals with tax breakdown
 */
export declare function calculateQuoteTotalsWithBreakdown(lineCalculations: LineItemCalculation[], quoteDiscount?: QuoteDiscount): QuoteCalculationWithBreakdown;
/**
 * Calculate totals with multiple quote-level discounts
 */
export declare function calculateQuoteTotalsWithMultipleDiscounts(lineCalculations: LineItemCalculation[], quoteDiscounts: QuoteDiscount[]): QuoteTotals;
/**
 * Calculate totals breakdown for display
 */
export declare function getTotalsBreakdown(totals: QuoteTotals): {
    subtotal: string;
    discount: string;
    taxable: string;
    tax: string;
    grandTotal: string;
};
/**
 * Validate quote totals for consistency
 */
export declare function validateQuoteTotals(totals: QuoteTotals): boolean;
/**
 * Calculate percentage breakdown of totals
 */
export declare function calculateTotalsPercentages(totals: QuoteTotals): {
    discountPercentage: number;
    taxPercentage: number;
    profitMargin?: number;
};
//# sourceMappingURL=totals.d.ts.map