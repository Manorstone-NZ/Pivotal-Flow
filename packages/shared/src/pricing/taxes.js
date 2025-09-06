import { Decimal } from 'decimal.js';
import { createDecimal, roundToCurrency, calculatePercentage } from './money.js';
/**
 * Default NZ GST rate (15%)
 */
export const DEFAULT_GST_RATE = 15;
/**
 * Default tax rule for NZ GST
 */
export const DEFAULT_TAX_RULE = {
    rate: DEFAULT_GST_RATE,
    name: 'GST',
    description: 'New Zealand Goods and Services Tax',
    isActive: true
};
/**
 * Calculate tax amount for a given taxable amount and tax rate
 */
export function calculateTax(taxableAmount, taxRate) {
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
 * Calculate tax breakdown for multiple line items with different tax rates
 */
export function calculateTaxBreakdown(lineItems) {
    const currency = lineItems[0]?.amount.currency;
    if (!currency) {
        return [];
    }
    // Validate all items have same currency
    for (const item of lineItems) {
        if (item.amount.currency !== currency) {
            throw new Error(`Cannot calculate tax for items with different currencies: ${currency} and ${item.amount.currency}`);
        }
    }
    // Group by tax rate
    const taxRateGroups = new Map();
    for (const item of lineItems) {
        if (item.isTaxExempt) {
            // Handle tax exempt items
            const exemptRate = 0;
            const currentAmount = taxRateGroups.get(exemptRate) || { amount: new Decimal(0), currency };
            taxRateGroups.set(exemptRate, {
                amount: currentAmount.amount.plus(item.amount.amount),
                currency
            });
        }
        else {
            // Handle taxable items
            const currentAmount = taxRateGroups.get(item.taxRate) || { amount: new Decimal(0), currency };
            taxRateGroups.set(item.taxRate, {
                amount: currentAmount.amount.plus(item.amount.amount),
                currency
            });
        }
    }
    // Calculate tax for each rate group
    const breakdown = [];
    for (const [rate, amount] of taxRateGroups) {
        if (amount.amount.greaterThan(0)) {
            const taxCalculation = calculateTax(amount, rate);
            breakdown.push({
                rate,
                taxableAmount: amount,
                taxAmount: taxCalculation.taxAmount,
                description: rate === 0 ? 'Exempt (0%)' : rate === 15 ? 'GST (15%)' : `Tax (${rate}%)`
            });
        }
    }
    // Sort by rate (exempt first, then ascending)
    breakdown.sort((a, b) => {
        if (a.rate === 0)
            return -1;
        if (b.rate === 0)
            return 1;
        return a.rate - b.rate;
    });
    return breakdown;
}
/**
 * Calculate total tax amount from tax breakdown
 */
export function calculateTotalTaxFromBreakdown(breakdown) {
    const currency = breakdown[0]?.taxAmount.currency;
    if (!currency) {
        return { amount: new Decimal(0), currency: 'NZD' };
    }
    const totalTax = breakdown.reduce((sum, item) => {
        if (item.taxAmount.currency !== currency) {
            throw new Error(`Cannot sum tax amounts with different currencies: ${currency} and ${item.taxAmount.currency}`);
        }
        return sum.add(item.taxAmount.amount);
    }, new Decimal(0));
    return {
        amount: roundToCurrency(totalTax),
        currency
    };
}
/**
 * Extract tax amount from tax-inclusive total
 */
export function extractTaxFromInclusive(totalAmount, taxRate) {
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
export function validateTaxRate(rate) {
    const decimalRate = createDecimal(rate);
    return !decimalRate.isNegative() && decimalRate.lessThanOrEqualTo(100);
}
/**
 * Get tax rate for a specific service type (future extensibility)
 */
export function getTaxRateForService(_serviceType, defaultRate = DEFAULT_GST_RATE) {
    // Future implementation: lookup tax rates by service type
    // For now, return default GST rate
    return defaultRate;
}
/**
 * Check if a service type is tax exempt
 */
export function isTaxExempt(serviceType) {
    // Future implementation: lookup tax exemption rules
    // For now, only travel expenses are exempt
    const exemptServices = ['travel', 'mileage', 'expenses'];
    return exemptServices.includes(serviceType.toLowerCase());
}
//# sourceMappingURL=taxes.js.map