import { Decimal } from 'decimal.js';
import type { MoneyAmount } from './money.js';
import { createDecimal, roundToCurrency, roundToCurrencyDecimals, multiplyMoney } from './money.js';
import type { DiscountType } from './discounts.js';
import { calculateDiscount } from './discounts.js';
import type { TaxRule } from './taxes.js';
import { calculateTax, isTaxExempt } from './taxes.js';

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
  taxInclusive?: boolean; // New field: indicates if unit price includes tax
  taxRate?: number;
  discountType?: DiscountType;
  discountValue?: number;
  // Support for multiple discounts: percentage then fixed
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
export function calculateLineItem(lineItem: LineItem, currencyDecimals: number = 2): LineItemCalculation {
  // Validate inputs
  if (lineItem.quantity <= 0) {
    throw new Error(`Quantity must be positive: ${lineItem.quantity}`);
  }
  
  if (lineItem.unitPrice.amount.isNegative()) {
    throw new Error(`Unit price cannot be negative: ${lineItem.unitPrice.amount}`);
  }
  
  // Handle tax inclusive pricing
  let workingUnitPrice: MoneyAmount;
  let extractedTaxAmount: MoneyAmount = { amount: new Decimal(0), currency: lineItem.unitPrice.currency };
  
  if (lineItem.taxInclusive) {
    const taxRate = lineItem.taxRate ?? 15; // Default GST rate
    const taxRateDecimal = createDecimal(taxRate).dividedBy(100);
    
    // Convert tax inclusive to exclusive
    workingUnitPrice = {
      amount: roundToCurrencyDecimals(lineItem.unitPrice.amount.dividedBy(createDecimal(1).plus(taxRateDecimal)), currencyDecimals),
      currency: lineItem.unitPrice.currency
    };
    
    // Calculate extracted tax amount
    extractedTaxAmount = {
      amount: roundToCurrencyDecimals(lineItem.unitPrice.amount.minus(workingUnitPrice.amount), currencyDecimals),
      currency: lineItem.unitPrice.currency
    };
  } else {
    workingUnitPrice = lineItem.unitPrice;
  }
  
  // Calculate subtotal (quantity × unit price)
  const subtotal = multiplyMoney(workingUnitPrice, lineItem.quantity);
  
  // Apply line-level discounts in order: percentage then fixed
  let discountAmount: MoneyAmount = { amount: new Decimal(0), currency: subtotal.currency };
  let taxableAmount: MoneyAmount = subtotal;
  
  // Apply percentage discount first (if specified)
  if (lineItem.percentageDiscount !== undefined && lineItem.percentageDiscount > 0) {
    const percentageDiscountCalculation = calculateDiscount(
      taxableAmount,
      'percentage',
      lineItem.percentageDiscount
    );
    discountAmount = percentageDiscountCalculation.discountAmount;
    taxableAmount = percentageDiscountCalculation.finalAmount;
  }
  
  // Apply fixed discount after percentage discount
  if (lineItem.fixedDiscount && lineItem.fixedDiscount.amount.greaterThan(0)) {
    const fixedDiscountCalculation = calculateDiscount(
      taxableAmount,
      'fixed_amount',
      lineItem.fixedDiscount.amount.toNumber()
    );
    discountAmount = {
      amount: roundToCurrency(discountAmount.amount.plus(fixedDiscountCalculation.discountAmount.amount)),
      currency: subtotal.currency
    };
    taxableAmount = fixedDiscountCalculation.finalAmount;
  }
  
  // Apply legacy discountType/discountValue if present (for backward compatibility)
  if (lineItem.discountType && lineItem.discountValue !== undefined) {
    const legacyDiscountCalculation = calculateDiscount(
      taxableAmount,
      lineItem.discountType,
      lineItem.discountValue
    );
    discountAmount = {
      amount: roundToCurrency(discountAmount.amount.plus(legacyDiscountCalculation.discountAmount.amount)),
      currency: subtotal.currency
    };
    taxableAmount = legacyDiscountCalculation.finalAmount;
  }
  
  // Determine tax rate
  const taxRate = lineItem.taxRate ?? 15; // Default GST rate
  
  // Check if line item is tax exempt
  const isExempt = lineItem.isTaxExempt ?? isTaxExempt(lineItem.serviceType ?? '');
  
  // Calculate tax
  let taxAmount: MoneyAmount;
  if (isExempt || taxRate === 0) {
    taxAmount = { amount: new Decimal(0), currency: subtotal.currency };
  } else if (lineItem.taxInclusive && !lineItem.percentageDiscount && !lineItem.fixedDiscount && !lineItem.discountType) {
    // For tax inclusive items without discounts, use the extracted tax amount
    const totalExtractedTax = multiplyMoney(extractedTaxAmount, lineItem.quantity);
    taxAmount = totalExtractedTax;
  } else {
    // For tax exclusive items or tax inclusive items with discounts, calculate tax on taxable amount
    const taxCalculation = calculateTax(taxableAmount, taxRate);
    taxAmount = taxCalculation.taxAmount;
  }
  
  // Calculate total amount
  const totalAmount = {
    amount: roundToCurrency(taxableAmount.amount.plus(taxAmount.amount)),
    currency: subtotal.currency
  };
  
  return {
    lineItem,
    quantity: lineItem.quantity,
    unitPrice: lineItem.unitPrice, // Return original unit price for display
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount
  };
}

/**
 * Calculate multiple line items and return summary
 */
export function calculateLineItems(lineItems: LineItem[], currencyDecimals: number = 2): {
  calculations: LineItemCalculation[];
  summary: {
    totalQuantity: number;
    subtotal: MoneyAmount;
    totalDiscount: MoneyAmount;
    totalTaxable: MoneyAmount;
    totalTax: MoneyAmount;
    totalAmount: MoneyAmount;
  };
} {
  if (lineItems.length === 0) {
    throw new Error('Cannot calculate empty line items array');
  }
  
  const currency = lineItems[0].unitPrice.currency;
  
  // Validate all items have same currency
  for (const item of lineItems) {
    if (item.unitPrice.currency !== currency) {
      throw new Error(`Cannot calculate items with different currencies: ${currency} and ${item.unitPrice.currency}`);
    }
  }
  
  // Calculate each line item
  const calculations = lineItems.map(item => calculateLineItem(item, currencyDecimals));
  
  // Calculate summary totals
  const totalQuantity = calculations.reduce((sum, calc) => sum + calc.quantity, 0);
  
  const subtotal = {
    amount: roundToCurrencyDecimals(
      calculations.reduce((sum, calc) => sum.plus(calc.subtotal.amount), new Decimal(0)),
      currencyDecimals
    ),
    currency
  };
  
  const totalDiscount = {
    amount: roundToCurrencyDecimals(
      calculations.reduce((sum, calc) => sum.plus(calc.discountAmount.amount), new Decimal(0)),
      currencyDecimals
    ),
    currency
  };
  
  const totalTaxable = {
    amount: roundToCurrencyDecimals(
      calculations.reduce((sum, calc) => sum.plus(calc.taxableAmount.amount), new Decimal(0)),
      currencyDecimals
    ),
    currency
  };
  
  const totalTax = {
    amount: roundToCurrencyDecimals(
      calculations.reduce((sum, calc) => sum.plus(calc.taxAmount.amount), new Decimal(0)),
      currencyDecimals
    ),
    currency
  };
  
  const totalAmount = {
    amount: roundToCurrencyDecimals(
      calculations.reduce((sum, calc) => sum.plus(calc.totalAmount.amount), new Decimal(0)),
      currencyDecimals
    ),
    currency
  };
  
  return {
    calculations,
    summary: {
      totalQuantity,
      subtotal,
      totalDiscount,
      totalTaxable,
      totalTax,
      totalAmount
    }
  };
}

/**
 * Validate line item parameters
 */
export function validateLineItem(lineItem: LineItem): boolean {
  try {
    // Check quantity
    if (lineItem.quantity <= 0) {
      return false;
    }
    
    // Check unit price
    if (lineItem.unitPrice.amount.isNegative()) {
      return false;
    }
    
    // Check discount if present
    if (lineItem.discountType && lineItem.discountValue !== undefined) {
      const subtotal = multiplyMoney(lineItem.unitPrice, lineItem.quantity);
      const discountCalculation = calculateDiscount(
        subtotal,
        lineItem.discountType,
        lineItem.discountValue
      );
      
      if (discountCalculation.finalAmount.amount.isNegative()) {
        return false;
      }
    }
    
    // Check tax rate
    if (lineItem.taxRate !== undefined) {
      if (lineItem.taxRate < 0 || lineItem.taxRate > 100) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get line item breakdown for display
 */
export function getLineItemBreakdown(calculation: LineItemCalculation): {
  quantity: string;
  unitPrice: string;
  subtotal: string;
  discount: string;
  taxable: string;
  tax: string;
  total: string;
} {
  return {
    quantity: calculation.quantity.toString(),
    unitPrice: `${calculation.unitPrice.currency} ${calculation.unitPrice.amount.toFixed(2)}`,
    subtotal: `${calculation.subtotal.currency} ${calculation.subtotal.amount.toFixed(2)}`,
    discount: calculation.discountAmount.amount.isZero() 
      ? '-' 
      : `${calculation.discountAmount.currency} ${calculation.discountAmount.amount.toFixed(2)}`,
    taxable: `${calculation.taxableAmount.currency} ${calculation.taxableAmount.amount.toFixed(2)}`,
    tax: calculation.taxAmount.amount.isZero()
      ? '-'
      : `${calculation.taxAmount.currency} ${calculation.taxAmount.amount.toFixed(2)}`,
    total: `${calculation.totalAmount.currency} ${calculation.totalAmount.amount.toFixed(2)}`
  };
}
