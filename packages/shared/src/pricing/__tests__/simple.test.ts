import { Decimal } from 'decimal.js';
import { calculateQuote } from '../index.js';

describe('Simple Pricing Test', () => {
  it('should calculate basic quote correctly', () => {
    const input = {
      lineItems: [{
        description: 'Web Development',
        quantity: 40,
        unitPrice: { amount: new Decimal(150), currency: 'NZD' },
        unit: 'hours'
      }],
      currency: 'NZD'
    };

    const result = calculateQuote(input);

    expect(result.lineCalculations).toHaveLength(1);
    expect(result.lineCalculations[0].subtotal.amount.toNumber()).toBe(6000);
    expect(result.lineCalculations[0].taxAmount.amount.toNumber()).toBe(900);
    expect(result.lineCalculations[0].totalAmount.amount.toNumber()).toBe(6900);
    expect(result.totals.grandTotal.amount.toNumber()).toBe(6900);
  });
});
