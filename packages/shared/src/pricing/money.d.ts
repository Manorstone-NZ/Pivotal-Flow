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
export declare function createDecimal(value: number | string | Decimal): Decimal;
/**
 * Round a Decimal to 2 decimal places using half-up rounding
 */
export declare function roundToCurrency(decimal: Decimal): Decimal;
/**
 * Round a Decimal to specific decimal places for a currency
 * @param decimal - The decimal to round
 * @param decimals - Number of decimal places (e.g., 2 for USD, 0 for JPY)
 */
export declare function roundToCurrencyDecimals(decimal: Decimal, decimals: number): Decimal;
/**
 * Convert money from one currency to another using exchange rate
 * @param money - Original money amount
 * @param targetCurrency - Target currency code
 * @param exchangeRate - Exchange rate (base -> target)
 * @param targetDecimals - Decimal places for target currency
 */
export declare function convertMoney(money: MoneyAmount, targetCurrency: string, exchangeRate: number | Decimal, targetDecimals?: number): MoneyAmount;
/**
 * Add two monetary amounts (must be same currency)
 */
export declare function addMoney(a: MoneyAmount, b: MoneyAmount): MoneyAmount;
/**
 * Subtract two monetary amounts (must be same currency)
 */
export declare function subtractMoney(a: MoneyAmount, b: MoneyAmount): MoneyAmount;
/**
 * Multiply a monetary amount by a factor
 */
export declare function multiplyMoney(money: MoneyAmount, factor: number | Decimal): MoneyAmount;
/**
 * Divide a monetary amount by a factor
 */
export declare function divideMoney(money: MoneyAmount, factor: number | Decimal): MoneyAmount;
/**
 * Calculate percentage of a monetary amount
 */
export declare function calculatePercentage(money: MoneyAmount, percentage: number | Decimal): MoneyAmount;
/**
 * Sum an array of monetary amounts (must be same currency)
 */
export declare function sumMoney(amounts: MoneyAmount[]): MoneyAmount;
/**
 * Check if a monetary amount is zero
 */
export declare function isZero(money: MoneyAmount): boolean;
/**
 * Check if a monetary amount is negative
 */
export declare function isNegative(money: MoneyAmount): boolean;
/**
 * Check if a monetary amount is positive
 */
export declare function isPositive(money: MoneyAmount): boolean;
/**
 * Compare two monetary amounts (must be same currency)
 */
export declare function compareMoney(a: MoneyAmount, b: MoneyAmount): number;
/**
 * Format a monetary amount as a string
 */
export declare function formatMoney(money: MoneyAmount): string;
/**
 * Create a zero amount in the specified currency
 */
export declare function zeroMoney(currency: string): MoneyAmount;
//# sourceMappingURL=money.d.ts.map