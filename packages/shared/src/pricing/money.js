import { Decimal } from 'decimal.js';
/**
 * Create a Decimal from a number or string with proper precision
 */
export function createDecimal(value) {
    if (value instanceof Decimal) {
        return value;
    }
    return new Decimal(value);
}
/**
 * Round a Decimal to 2 decimal places using half-up rounding
 */
export function roundToCurrency(decimal) {
    return decimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
/**
 * Round a Decimal to specific decimal places for a currency
 * @param decimal - The decimal to round
 * @param decimals - Number of decimal places (e.g., 2 for USD, 0 for JPY)
 */
export function roundToCurrencyDecimals(decimal, decimals) {
    return decimal.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
}
/**
 * Convert money from one currency to another using exchange rate
 * @param money - Original money amount
 * @param targetCurrency - Target currency code
 * @param exchangeRate - Exchange rate (base -> target)
 * @param targetDecimals - Decimal places for target currency
 */
export function convertMoney(money, targetCurrency, exchangeRate, targetDecimals = 2) {
    const rate = createDecimal(exchangeRate);
    return {
        amount: roundToCurrencyDecimals(money.amount.times(rate), targetDecimals),
        currency: targetCurrency
    };
}
/**
 * Add two monetary amounts (must be same currency)
 */
export function addMoney(a, b) {
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
export function subtractMoney(a, b) {
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
export function multiplyMoney(money, factor) {
    const decimalFactor = createDecimal(factor);
    return {
        amount: roundToCurrency(money.amount.times(decimalFactor)),
        currency: money.currency
    };
}
/**
 * Divide a monetary amount by a factor
 */
export function divideMoney(money, factor) {
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
export function calculatePercentage(money, percentage) {
    const decimalPercentage = createDecimal(percentage);
    return {
        amount: roundToCurrency(money.amount.times(decimalPercentage).dividedBy(100)),
        currency: money.currency
    };
}
/**
 * Sum an array of monetary amounts (must be same currency)
 */
export function sumMoney(amounts) {
    const currency = amounts[0]?.currency;
    if (!currency) {
        throw new Error('Cannot sum empty array of amounts');
    }
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
export function isZero(money) {
    return money.amount.isZero();
}
/**
 * Check if a monetary amount is negative
 */
export function isNegative(money) {
    return money.amount.isNegative();
}
/**
 * Check if a monetary amount is positive
 */
export function isPositive(money) {
    return money.amount.isPositive();
}
/**
 * Compare two monetary amounts (must be same currency)
 */
export function compareMoney(a, b) {
    if (a.currency !== b.currency) {
        throw new Error(`Cannot compare amounts with different currencies: ${a.currency} and ${b.currency}`);
    }
    return a.amount.comparedTo(b.amount);
}
/**
 * Format a monetary amount as a string
 */
export function formatMoney(money) {
    return `${money.currency} ${money.amount.toFixed(2)}`;
}
/**
 * Create a zero amount in the specified currency
 */
export function zeroMoney(currency) {
    return {
        amount: new Decimal(0),
        currency
    };
}
//# sourceMappingURL=money.js.map