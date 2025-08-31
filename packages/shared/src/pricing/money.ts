import { Decimal } from 'decimal.js';

/**
 * Money helper functions for precise decimal arithmetic
 * All functions use Decimal.js to avoid floating-point errors
 */

export interface MoneyAmount {
  amount: Decimal;
  currency: string;
}

/**
 * Create a Decimal from a number or string with proper precision
 */
export function createDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Round a Decimal to 2 decimal places using half-up rounding
 */
export function roundToCurrency(decimal: Decimal): Decimal {
  return decimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Add two monetary amounts (must be same currency)
 */
export function addMoney(a: MoneyAmount, b: MoneyAmount): MoneyAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add amounts with different currencies: ${a.currency} and ${b.currency}`);
  }
  
  return {
    amount: roundToCurrency(a.amount.plus(b.amount)),
    currency: a.currency
  };
}

/**
 * Subtract two monetary amounts (must be same currency)
 */
export function subtractMoney(a: MoneyAmount, b: MoneyAmount): MoneyAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract amounts with different currencies: ${a.currency} and ${b.currency}`);
  }
  
  return {
    amount: roundToCurrency(a.amount.minus(b.amount)),
    currency: a.currency
  };
}

/**
 * Multiply a monetary amount by a factor
 */
export function multiplyMoney(money: MoneyAmount, factor: number | Decimal): MoneyAmount {
  const decimalFactor = createDecimal(factor);
  
  return {
    amount: roundToCurrency(money.amount.times(decimalFactor)),
    currency: money.currency
  };
}

/**
 * Divide a monetary amount by a factor
 */
export function divideMoney(money: MoneyAmount, factor: number | Decimal): MoneyAmount {
  const decimalFactor = createDecimal(factor);
  
  if (decimalFactor.isZero()) {
    throw new Error('Cannot divide by zero');
  }
  
  return {
    amount: roundToCurrency(money.amount.dividedBy(decimalFactor)),
    currency: money.currency
  };
}

/**
 * Calculate percentage of a monetary amount
 */
export function calculatePercentage(money: MoneyAmount, percentage: number | Decimal): MoneyAmount {
  const decimalPercentage = createDecimal(percentage);
  
  return {
    amount: roundToCurrency(money.amount.times(decimalPercentage).dividedBy(100)),
    currency: money.currency
  };
}

/**
 * Sum an array of monetary amounts (must be same currency)
 */
export function sumMoney(amounts: MoneyAmount[]): MoneyAmount {
  if (amounts.length === 0) {
    throw new Error('Cannot sum empty array of amounts');
  }
  
  const currency = amounts[0].currency;
  
  // Validate all amounts have same currency
  for (const amount of amounts) {
    if (amount.currency !== currency) {
      throw new Error(`Cannot sum amounts with different currencies: ${currency} and ${amount.currency}`);
    }
  }
  
  const total = amounts.reduce((sum, amount) => sum.plus(amount.amount), new Decimal(0));
  
  return {
    amount: roundToCurrency(total),
    currency
  };
}

/**
 * Check if a monetary amount is zero
 */
export function isZero(money: MoneyAmount): boolean {
  return money.amount.isZero();
}

/**
 * Check if a monetary amount is negative
 */
export function isNegative(money: MoneyAmount): boolean {
  return money.amount.isNegative();
}

/**
 * Check if a monetary amount is positive
 */
export function isPositive(money: MoneyAmount): boolean {
  return money.amount.isPositive();
}

/**
 * Compare two monetary amounts (must be same currency)
 */
export function compareMoney(a: MoneyAmount, b: MoneyAmount): number {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare amounts with different currencies: ${a.currency} and ${b.currency}`);
  }
  
  return a.amount.comparedTo(b.amount);
}

/**
 * Format a monetary amount as a string
 */
export function formatMoney(money: MoneyAmount): string {
  return `${money.currency} ${money.amount.toFixed(2)}`;
}

/**
 * Create a zero amount in the specified currency
 */
export function zeroMoney(currency: string): MoneyAmount {
  return {
    amount: new Decimal(0),
    currency
  };
}
