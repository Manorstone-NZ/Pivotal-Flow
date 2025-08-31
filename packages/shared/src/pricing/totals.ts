import { Decimal } from 'decimal.js';
import { MoneyAmount, roundToCurrency, sumMoney } from './money.js';
import { calculateTax, TaxCalculation } from './taxes.js';
import { calculateDiscount, DiscountType, applyMultipleDiscounts } from './discounts.js';
import { LineItemCalculation } from './lines.js';

/**
 * Totals calculation functions for subtotal, tax, and grand total
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

/**
 * Calculate quote totals from line item calculations
 * Line items already include tax, so we use their totals directly
 */
export function calculateQuoteTotals(
  lineCalculations: LineItemCalculation[],
  quoteDiscount?: QuoteDiscount
): QuoteTotals {
  if (lineCalculations.length === 0) {
    throw new Error('Cannot calculate totals for empty line calculations');
  }
  
  const currency = lineCalculations[0].totalAmount.currency;
  
  // Validate all calculations have same currency
  for (const calc of lineCalculations) {
    if (calc.totalAmount.currency !== currency) {
      throw new Error(`Cannot calculate totals for different currencies: ${currency} and ${calc.totalAmount.currency}`);
    }
  }
  
  // Calculate subtotal from line item subtotals (before tax)
  const subtotal = sumMoney(lineCalculations.map(calc => calc.subtotal));
  
  // Calculate total tax from line items
  const totalTax = sumMoney(lineCalculations.map(calc => calc.taxAmount));
  
  // Calculate total from line items (includes tax)
  const lineTotal = sumMoney(lineCalculations.map(calc => calc.totalAmount));
  
  // Apply quote-level discount if present
  let discountAmount: MoneyAmount;
  let taxableAmount: MoneyAmount;
  
  if (quoteDiscount) {
    const discountCalculation = calculateDiscount(
      lineTotal,
      quoteDiscount.type,
      quoteDiscount.value
    );
    discountAmount = discountCalculation.discountAmount;
    taxableAmount = discountCalculation.finalAmount;
  } else {
    discountAmount = { amount: new Decimal(0), currency };
    taxableAmount = lineTotal;
  }
  
  // Calculate grand total
  const grandTotal = {
    amount: roundToCurrency(taxableAmount.amount),
    currency
  };
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount: totalTax,
    grandTotal,
    currency
  };
}

/**
 * Calculate totals with multiple quote-level discounts
 */
export function calculateQuoteTotalsWithMultipleDiscounts(
  lineCalculations: LineItemCalculation[],
  quoteDiscounts: QuoteDiscount[]
): QuoteTotals {
  if (lineCalculations.length === 0) {
    throw new Error('Cannot calculate totals for empty line calculations');
  }
  
  const currency = lineCalculations[0].totalAmount.currency;
  
  // Validate all calculations have same currency
  for (const calc of lineCalculations) {
    if (calc.totalAmount.currency !== currency) {
      throw new Error(`Cannot calculate totals for different currencies: ${currency} and ${calc.totalAmount.currency}`);
    }
  }
  
  // Calculate subtotal from line item subtotals (before tax)
  const subtotal = sumMoney(lineCalculations.map(calc => calc.subtotal));
  
  // Calculate total tax from line items
  const totalTax = sumMoney(lineCalculations.map(calc => calc.taxAmount));
  
  // Calculate total from line items (includes tax)
  const lineTotal = sumMoney(lineCalculations.map(calc => calc.totalAmount));
  
  // Apply multiple discounts
  const discounts = quoteDiscounts.map(d => ({
    type: d.type,
    value: d.value,
    description: d.description,
    isActive: true
  }));
  
  const discountCalculation = applyMultipleDiscounts(lineTotal, discounts);
  const discountAmount = discountCalculation.discountAmount;
  const taxableAmount = discountCalculation.finalAmount;
  
  // Calculate grand total
  const grandTotal = {
    amount: roundToCurrency(taxableAmount.amount),
    currency
  };
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount: totalTax,
    grandTotal,
    currency
  };
}

/**
 * Calculate totals breakdown for display
 */
export function getTotalsBreakdown(totals: QuoteTotals): {
  subtotal: string;
  discount: string;
  taxable: string;
  tax: string;
  grandTotal: string;
} {
  return {
    subtotal: `${totals.currency} ${totals.subtotal.amount.toFixed(2)}`,
    discount: totals.discountAmount.amount.isZero()
      ? '-'
      : `${totals.currency} ${totals.discountAmount.amount.toFixed(2)}`,
    taxable: `${totals.currency} ${totals.taxableAmount.amount.toFixed(2)}`,
    tax: totals.taxAmount.amount.isZero()
      ? '-'
      : `${totals.currency} ${totals.taxAmount.amount.toFixed(2)}`,
    grandTotal: `${totals.currency} ${totals.grandTotal.amount.toFixed(2)}`
  };
}

/**
 * Validate quote totals for consistency
 */
export function validateQuoteTotals(totals: QuoteTotals): boolean {
  try {
    // Check that all amounts have same currency
    const currency = totals.currency;
    const amounts = [totals.subtotal, totals.discountAmount, totals.taxableAmount, totals.taxAmount, totals.grandTotal];
    
    for (const amount of amounts) {
      if (amount.currency !== currency) {
        return false;
      }
    }
    
    // Check that discount doesn't exceed subtotal
    if (totals.discountAmount.amount.greaterThan(totals.subtotal.amount)) {
      return false;
    }
    
    // Check that taxable amount equals subtotal minus discount
    const expectedTaxable = totals.subtotal.amount.minus(totals.discountAmount.amount);
    if (!totals.taxableAmount.amount.equals(expectedTaxable)) {
      return false;
    }
    
    // Check that grand total equals taxable plus tax
    const expectedGrandTotal = totals.taxableAmount.amount.plus(totals.taxAmount.amount);
    if (!totals.grandTotal.amount.equals(expectedGrandTotal)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate percentage breakdown of totals
 */
export function calculateTotalsPercentages(totals: QuoteTotals): {
  discountPercentage: number;
  taxPercentage: number;
  profitMargin?: number;
} {
  if (totals.subtotal.amount.isZero()) {
    return {
      discountPercentage: 0,
      taxPercentage: 0
    };
  }
  
  const discountPercentage = totals.discountAmount.amount
    .dividedBy(totals.subtotal.amount)
    .times(100)
    .toNumber();
  
  const taxPercentage = totals.taxAmount.amount
    .dividedBy(totals.subtotal.amount)
    .times(100)
    .toNumber();
  
  return {
    discountPercentage: roundToCurrency(new Decimal(discountPercentage)).toNumber(),
    taxPercentage: roundToCurrency(new Decimal(taxPercentage)).toNumber()
  };
}
