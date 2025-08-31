import { Decimal } from 'decimal.js';
import { MoneyAmount, createDecimal, roundToCurrency, multiplyMoney } from './money.js';
import { calculateTax, isTaxExempt } from './taxes.js';
import { calculateDiscount, DiscountType } from './discounts.js';

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
  taxRate?: number;
  discountType?: DiscountType;
  discountValue?: number;
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
export function calculateLineItem(lineItem: LineItem): LineItemCalculation {
  // Validate inputs
  if (lineItem.quantity <= 0) {
    throw new Error(`Quantity must be positive: ${lineItem.quantity}`);
  }
  
  if (lineItem.unitPrice.amount.isNegative()) {
    throw new Error(`Unit price cannot be negative: ${lineItem.unitPrice.amount}`);
  }
  
  // Calculate subtotal (quantity × unit price)
  const subtotal = multiplyMoney(lineItem.unitPrice, lineItem.quantity);
  
  // Apply line-level discount if present
  let discountAmount: MoneyAmount;
  let taxableAmount: MoneyAmount;
  
  if (lineItem.discountType && lineItem.discountValue !== undefined) {
    const discountCalculation = calculateDiscount(
      subtotal,
      lineItem.discountType,
      lineItem.discountValue
    );
    discountAmount = discountCalculation.discountAmount;
    taxableAmount = discountCalculation.finalAmount;
  } else {
    discountAmount = { amount: new Decimal(0), currency: subtotal.currency };
    taxableAmount = subtotal;
  }
  
  // Determine tax rate
  const taxRate = lineItem.taxRate ?? 15; // Default GST rate
  
  // Check if line item is tax exempt
  const isExempt = lineItem.isTaxExempt ?? isTaxExempt(lineItem.serviceType ?? '');
  
  // Calculate tax
  let taxAmount: MoneyAmount;
  if (isExempt || taxRate === 0) {
    taxAmount = { amount: new Decimal(0), currency: subtotal.currency };
  } else {
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
    unitPrice: lineItem.unitPrice,
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
export function calculateLineItems(lineItems: LineItem[]): {
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
  const calculations = lineItems.map(calculateLineItem);
  
  // Calculate summary totals
  const totalQuantity = calculations.reduce((sum, calc) => sum + calc.quantity, 0);
  
  const subtotal = {
    amount: roundToCurrency(
      calculations.reduce((sum, calc) => sum.plus(calc.subtotal.amount), new Decimal(0))
    ),
    currency
  };
  
  const totalDiscount = {
    amount: roundToCurrency(
      calculations.reduce((sum, calc) => sum.plus(calc.discountAmount.amount), new Decimal(0))
    ),
    currency
  };
  
  const totalTaxable = {
    amount: roundToCurrency(
      calculations.reduce((sum, calc) => sum.plus(calc.taxableAmount.amount), new Decimal(0))
    ),
    currency
  };
  
  const totalTax = {
    amount: roundToCurrency(
      calculations.reduce((sum, calc) => sum.plus(calc.taxAmount.amount), new Decimal(0))
    ),
    currency
  };
  
  const totalAmount = {
    amount: roundToCurrency(
      calculations.reduce((sum, calc) => sum.plus(calc.totalAmount.amount), new Decimal(0))
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
