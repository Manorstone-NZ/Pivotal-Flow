import type { MoneyAmount } from './money.js';
/**
 * Tax calculation functions for GST and future tax rates
 */
export interface TaxRule {
    rate: number;
    name: string;
    description?: string;
    isActive: boolean;
}
export interface TaxCalculation {
    taxableAmount: MoneyAmount;
    taxRate: number;
    taxAmount: MoneyAmount;
    totalAmount: MoneyAmount;
}
export interface TaxBreakdown {
    rate: number;
    taxableAmount: MoneyAmount;
    taxAmount: MoneyAmount;
    description: string;
}
/**
 * Default NZ GST rate (15%)
 */
export declare const DEFAULT_GST_RATE = 15;
/**
 * Default tax rule for NZ GST
 */
export declare const DEFAULT_TAX_RULE: TaxRule;
/**
 * Calculate tax amount for a given taxable amount and tax rate
 */
export declare function calculateTax(taxableAmount: MoneyAmount, taxRate: number | TaxRule): TaxCalculation;
/**
 * Calculate tax breakdown for multiple line items with different tax rates
 */
export declare function calculateTaxBreakdown(lineItems: Array<{
    amount: MoneyAmount;
    taxRate: number;
    isTaxExempt?: boolean;
}>): TaxBreakdown[];
/**
 * Calculate total tax amount from tax breakdown
 */
export declare function calculateTotalTaxFromBreakdown(breakdown: TaxBreakdown[]): MoneyAmount;
/**
 * Extract tax amount from tax-inclusive total
 */
export declare function extractTaxFromInclusive(totalAmount: MoneyAmount, taxRate: number | TaxRule): TaxCalculation;
/**
 * Validate tax rate is within acceptable range
 */
export declare function validateTaxRate(rate: number): boolean;
/**
 * Get tax rate for a specific service type (future extensibility)
 */
export declare function getTaxRateForService(_serviceType: string, defaultRate?: number): number;
/**
 * Check if a service type is tax exempt
 */
export declare function isTaxExempt(serviceType: string): boolean;
//# sourceMappingURL=taxes.d.ts.map