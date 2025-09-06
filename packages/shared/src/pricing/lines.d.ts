import type { DiscountType } from './discounts.js';
import type { MoneyAmount } from './money.js';
/**
 * Line item calculation functions with rounding at line level
 */
export interface LineItem {
    description: string;
    quantity: number;
    unitPrice: MoneyAmount;
    unit: string;
    serviceType?: string;
    isTaxExempt?: boolean;
    taxInclusive?: boolean;
    taxRate?: number;
    discountType?: DiscountType;
    discountValue?: number;
    percentageDiscount?: number;
    fixedDiscount?: MoneyAmount;
}
export interface LineItemCalculation {
    lineItem: LineItem;
    quantity: number;
    unitPrice: MoneyAmount;
    subtotal: MoneyAmount;
    discountAmount: MoneyAmount;
    taxableAmount: MoneyAmount;
    taxAmount: MoneyAmount;
    totalAmount: MoneyAmount;
}
/**
 * Calculate line item total with all components
 */
export declare function calculateLineItem(lineItem: LineItem, currencyDecimals?: number): LineItemCalculation;
/**
 * Calculate multiple line items and return summary
 */
export declare function calculateLineItems(lineItems: LineItem[], currencyDecimals?: number): {
    calculations: LineItemCalculation[];
    summary: {
        totalQuantity: number;
        subtotal: MoneyAmount;
        totalDiscount: MoneyAmount;
        totalTaxable: MoneyAmount;
        totalTax: MoneyAmount;
        totalAmount: MoneyAmount;
    };
};
/**
 * Validate line item parameters
 */
export declare function validateLineItem(lineItem: LineItem): boolean;
/**
 * Get line item breakdown for display
 */
export declare function getLineItemBreakdown(calculation: LineItemCalculation): {
    quantity: string;
    unitPrice: string;
    subtotal: string;
    discount: string;
    taxable: string;
    tax: string;
    total: string;
};
//# sourceMappingURL=lines.d.ts.map