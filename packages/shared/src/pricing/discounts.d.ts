import type { MoneyAmount } from './money.js';
/**
 * Discount calculation functions with guard rails
 */
export type DiscountType = 'percentage' | 'fixed_amount' | 'per_unit';
export interface Discount {
    type: DiscountType;
    value: number;
    description?: string;
    isActive: boolean;
}
export interface DiscountCalculation {
    originalAmount: MoneyAmount;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: MoneyAmount;
    finalAmount: MoneyAmount;
}
/**
 * Maximum allowed percentage discount (100%)
 */
export declare const MAX_PERCENTAGE_DISCOUNT = 100;
/**
 * Maximum allowed fixed amount discount (no limit, but must not exceed original amount)
 */
export declare const MAX_FIXED_DISCOUNT: number;
/**
 * Calculate discount amount based on type and value
 */
export declare function calculateDiscount(originalAmount: MoneyAmount, discountType: DiscountType, discountValue: number): DiscountCalculation;
/**
 * Apply multiple discounts in sequence (percentage first, then fixed)
 */
export declare function applyMultipleDiscounts(originalAmount: MoneyAmount, discounts: Discount[]): DiscountCalculation;
/**
 * Validate discount parameters
 */
export declare function validateDiscount(discountType: DiscountType, discountValue: number, originalAmount?: MoneyAmount): boolean;
/**
 * Calculate effective discount percentage
 */
export declare function calculateEffectiveDiscountPercentage(originalAmount: MoneyAmount, finalAmount: MoneyAmount): number;
/**
 * Check if discount would result in negative amount
 */
export declare function wouldResultInNegative(originalAmount: MoneyAmount, discountType: DiscountType, discountValue: number): boolean;
/**
 * Get maximum safe discount value for a given amount
 */
export declare function getMaximumSafeDiscount(originalAmount: MoneyAmount, discountType: DiscountType): number;
/**
 * Format discount for display
 */
export declare function formatDiscount(discount: Discount): string;
//# sourceMappingURL=discounts.d.ts.map