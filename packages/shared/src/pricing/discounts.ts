import { Decimal } from 'decimal.js';
import type { MoneyAmount } from './money.js';
import { createDecimal, roundToCurrency, calculatePercentage, isNegative } from './money.js';

/**
 * Discount calculation functions with guard rails
 */

export type DiscountType = 'percentage' | 'fixed_amount' | 'per_unit';

export interface Discount {
  type: DiscountType;
  value: number; // Percentage or fixed amount
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
export const MAX_PERCENTAGE_DISCOUNT = 100;

/**
 * Maximum allowed fixed amount discount (no limit, but must not exceed original amount)
 */
export const MAX_FIXED_DISCOUNT = Number.MAX_SAFE_INTEGER;

/**
 * Calculate discount amount based on type and value
 */
export function calculateDiscount(
  originalAmount: MoneyAmount,
  discountType: DiscountType,
  discountValue: number
): DiscountCalculation {
  const decimalValue = createDecimal(discountValue);
  
  // Validate discount value
  if (decimalValue.isNegative()) {
    throw new Error(`Discount value cannot be negative: ${discountValue}`);
  }
  
  let discountAmount: MoneyAmount;
  
  switch (discountType) {
    case 'percentage':
      // Validate percentage discount
      if (decimalValue.greaterThan(MAX_PERCENTAGE_DISCOUNT)) {
        throw new Error(`Percentage discount cannot exceed ${MAX_PERCENTAGE_DISCOUNT}%: ${discountValue}`);
      }
      
      discountAmount = calculatePercentage(originalAmount, discountValue);
      break;
      
    case 'fixed_amount':
      // Validate fixed amount discount
      if (decimalValue.greaterThan(originalAmount.amount)) {
        throw new Error(`Fixed discount cannot exceed original amount: ${discountValue} > ${originalAmount.amount}`);
      }
      
      discountAmount = {
        amount: roundToCurrency(decimalValue),
        currency: originalAmount.currency
      };
      break;
      
    case 'per_unit':
      // Per unit discount (applied to quantity)
      discountAmount = {
        amount: roundToCurrency(decimalValue),
        currency: originalAmount.currency
      };
      break;
      
    default:
      throw new Error(`Invalid discount type: ${discountType}`);
  }
  
  // Calculate final amount
  const finalAmount = {
    amount: roundToCurrency(originalAmount.amount.minus(discountAmount.amount)),
    currency: originalAmount.currency
  };
  
  return {
    originalAmount,
    discountType,
    discountValue,
    discountAmount,
    finalAmount
  };
}

/**
 * Apply multiple discounts in sequence (percentage first, then fixed)
 */
export function applyMultipleDiscounts(
  originalAmount: MoneyAmount,
  discounts: Discount[]
): DiscountCalculation {
  if (discounts.length === 0) {
    return {
      originalAmount,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: { amount: new Decimal(0), currency: originalAmount.currency },
      finalAmount: originalAmount
    };
  }
  
  // Sort discounts: percentage first, then fixed amount
  const sortedDiscounts = discounts
    .filter(d => d.isActive)
    .sort((a, b) => {
      if (a.type === 'percentage' && b.type !== 'percentage') return -1;
      if (a.type !== 'percentage' && b.type === 'percentage') return 1;
      return 0;
    });
  
  let currentAmount = originalAmount;
  let totalDiscountAmount = { amount: new Decimal(0), currency: originalAmount.currency };
  
  for (const discount of sortedDiscounts) {
    const calculation = calculateDiscount(currentAmount, discount.type, discount.value);
    currentAmount = calculation.finalAmount;
    totalDiscountAmount = {
      amount: roundToCurrency(totalDiscountAmount.amount.plus(calculation.discountAmount.amount)),
      currency: originalAmount.currency
    };
  }
  
  return {
    originalAmount,
    discountType: 'percentage', // Combined discount
    discountValue: 0, // Not applicable for combined
    discountAmount: totalDiscountAmount,
    finalAmount: currentAmount
  };
}

/**
 * Validate discount parameters
 */
export function validateDiscount(
  discountType: DiscountType,
  discountValue: number,
  originalAmount?: MoneyAmount
): boolean {
  const decimalValue = createDecimal(discountValue);
  
  // Basic validation
  if (decimalValue.isNegative()) {
    return false;
  }
  
  switch (discountType) {
    case 'percentage':
      return decimalValue.lessThanOrEqualTo(MAX_PERCENTAGE_DISCOUNT);
      
    case 'fixed_amount':
      if (!originalAmount) {
        return true; // Can't validate without original amount
      }
      return decimalValue.lessThanOrEqualTo(originalAmount.amount);
      
    case 'per_unit':
      return true; // No specific limits for per-unit discounts
      
    default:
      return false;
  }
}

/**
 * Calculate effective discount percentage
 */
export function calculateEffectiveDiscountPercentage(
  originalAmount: MoneyAmount,
  finalAmount: MoneyAmount
): number {
  if (originalAmount.currency !== finalAmount.currency) {
    throw new Error(`Cannot calculate discount for different currencies: ${originalAmount.currency} and ${finalAmount.currency}`);
  }
  
  if (originalAmount.amount.isZero()) {
    return 0;
  }
  
  const discountAmount = originalAmount.amount.minus(finalAmount.amount);
  const percentage = discountAmount.dividedBy(originalAmount.amount).times(100);
  
  return roundToCurrency(percentage).toNumber();
}

/**
 * Check if discount would result in negative amount
 */
export function wouldResultInNegative(
  originalAmount: MoneyAmount,
  discountType: DiscountType,
  discountValue: number
): boolean {
  try {
    const calculation = calculateDiscount(originalAmount, discountType, discountValue);
    return isNegative(calculation.finalAmount);
  } catch {
    return true; // Invalid discount would result in error
  }
}

/**
 * Get maximum safe discount value for a given amount
 */
export function getMaximumSafeDiscount(
  originalAmount: MoneyAmount,
  discountType: DiscountType
): number {
  switch (discountType) {
    case 'percentage':
      return MAX_PERCENTAGE_DISCOUNT;
      
    case 'fixed_amount':
      return originalAmount.amount.toNumber();
      
    case 'per_unit':
      return Number.MAX_SAFE_INTEGER; // No practical limit
      
    default:
      return 0;
  }
}

/**
 * Format discount for display
 */
export function formatDiscount(discount: Discount): string {
  switch (discount.type) {
    case 'percentage':
      return `${discount.value}%`;
    case 'fixed_amount':
      return `$${discount.value.toFixed(2)}`;
    case 'per_unit':
      return `$${discount.value.toFixed(2)} per unit`;
    default:
      return 'Unknown discount';
  }
}
