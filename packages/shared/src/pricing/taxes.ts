import { Decimal } from 'decimal.js';
import { MoneyAmount, createDecimal, roundToCurrency, calculatePercentage } from './money.js';

/**
 * Tax calculation functions for GST and future tax rates
 */

export interface TaxRule {
  rate: number; // Percentage as decimal (e.g., 15 for 15%)
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

/**
 * Default NZ GST rate (15%)
 */
export const DEFAULT_GST_RATE = 15;

/**
 * Default tax rule for NZ GST
 */
export const DEFAULT_TAX_RULE: TaxRule = {
  rate: DEFAULT_GST_RATE,
  name: 'GST',
  description: 'New Zealand Goods and Services Tax',
  isActive: true
};

/**
 * Calculate tax amount for a given taxable amount and tax rate
 */
export function calculateTax(
  taxableAmount: MoneyAmount,
  taxRate: number | TaxRule
): TaxCalculation {
  const rate = typeof taxRate === 'number' ? taxRate : taxRate.rate;
  const decimalRate = createDecimal(rate);
  
  // Validate tax rate
  if (decimalRate.isNegative()) {
    throw new Error(`Tax rate cannot be negative: ${rate}`);
  }
  
  if (decimalRate.greaterThan(100)) {
    throw new Error(`Tax rate cannot exceed 100%: ${rate}`);
  }
  
  // Calculate tax amount
  const taxAmount = calculatePercentage(taxableAmount, rate);
  
  // Calculate total amount
  const totalAmount = {
    amount: roundToCurrency(taxableAmount.amount.plus(taxAmount.amount)),
    currency: taxableAmount.currency
  };
  
  return {
    taxableAmount,
    taxRate: rate,
    taxAmount,
    totalAmount
  };
}

/**
 * Calculate tax amount for multiple line items with different tax rates
 */
export function calculateTaxForLineItems(
  lineItems: Array<{
    amount: MoneyAmount;
    taxRate: number;
    isTaxExempt?: boolean;
  }>
): TaxCalculation {
  if (lineItems.length === 0) {
    throw new Error('Cannot calculate tax for empty line items array');
  }
  
  const currency = lineItems[0].amount.currency;
  
  // Validate all items have same currency
  for (const item of lineItems) {
    if (item.amount.currency !== currency) {
      throw new Error(`Cannot calculate tax for items with different currencies: ${currency} and ${item.amount.currency}`);
    }
  }
  
  // Separate taxable and non-taxable amounts
  const taxableItems = lineItems.filter(item => !item.isTaxExempt);
  const nonTaxableItems = lineItems.filter(item => item.isTaxExempt);
  
  // Calculate total taxable amount
  const taxableAmount = taxableItems.length > 0 
    ? taxableItems.reduce((sum, item) => ({
        amount: sum.amount.plus(item.amount.amount),
        currency: sum.currency
      }), { amount: new Decimal(0), currency })
    : { amount: new Decimal(0), currency };
  
  // Calculate weighted average tax rate for taxable items
  let totalTaxableValue = new Decimal(0);
  let weightedTaxRate = new Decimal(0);
  
  for (const item of taxableItems) {
    totalTaxableValue = totalTaxableValue.plus(item.amount.amount);
    weightedTaxRate = weightedTaxRate.plus(
      item.amount.amount.times(createDecimal(item.taxRate))
    );
  }
  
  const averageTaxRate = totalTaxableValue.isZero() 
    ? 0 
    : weightedTaxRate.dividedBy(totalTaxableValue).toNumber();
  
  // Calculate tax amount
  const taxAmount = calculatePercentage(taxableAmount, averageTaxRate);
  
  // Calculate total amount (taxable + non-taxable + tax)
  const nonTaxableAmount = nonTaxableItems.length > 0
    ? nonTaxableItems.reduce((sum, item) => ({
        amount: sum.amount.plus(item.amount.amount),
        currency: sum.currency
      }), { amount: new Decimal(0), currency })
    : { amount: new Decimal(0), currency };
  
  const totalAmount = {
    amount: roundToCurrency(
      taxableAmount.amount.plus(nonTaxableAmount.amount).plus(taxAmount.amount)
    ),
    currency
  };
  
  return {
    taxableAmount: {
      amount: roundToCurrency(taxableAmount.amount),
      currency
    },
    taxRate: averageTaxRate,
    taxAmount,
    totalAmount
  };
}

/**
 * Extract tax amount from tax-inclusive total
 */
export function extractTaxFromInclusive(
  totalAmount: MoneyAmount,
  taxRate: number | TaxRule
): TaxCalculation {
  const rate = typeof taxRate === 'number' ? taxRate : taxRate.rate;
  const decimalRate = createDecimal(rate);
  
  // Validate tax rate
  if (decimalRate.isNegative() || decimalRate.greaterThan(100)) {
    throw new Error(`Invalid tax rate: ${rate}`);
  }
  
  // Calculate taxable amount: total / (1 + tax_rate/100)
  const divisor = new Decimal(1).plus(decimalRate.dividedBy(100));
  const taxableAmount = {
    amount: roundToCurrency(totalAmount.amount.dividedBy(divisor)),
    currency: totalAmount.currency
  };
  
  // Calculate tax amount
  const taxAmount = {
    amount: roundToCurrency(totalAmount.amount.minus(taxableAmount.amount)),
    currency: totalAmount.currency
  };
  
  return {
    taxableAmount,
    taxRate: rate,
    taxAmount,
    totalAmount
  };
}

/**
 * Validate tax rate is within acceptable range
 */
export function validateTaxRate(rate: number): boolean {
  const decimalRate = createDecimal(rate);
  return !decimalRate.isNegative() && decimalRate.lessThanOrEqualTo(100);
}

/**
 * Get tax rate for a specific service type (future extensibility)
 */
export function getTaxRateForService(
  serviceType: string,
  defaultRate: number = DEFAULT_GST_RATE
): number {
  // Future implementation: lookup tax rates by service type
  // For now, return default GST rate
  return defaultRate;
}

/**
 * Check if a service type is tax exempt
 */
export function isTaxExempt(serviceType: string): boolean {
  // Future implementation: lookup tax exemption rules
  // For now, only travel expenses are exempt
  const exemptServices = ['travel', 'mileage', 'expenses'];
  return exemptServices.includes(serviceType.toLowerCase());
}
