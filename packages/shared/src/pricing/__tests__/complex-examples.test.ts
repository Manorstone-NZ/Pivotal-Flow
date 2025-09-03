import { describe, it, expect } from 'vitest';
import { Decimal } from 'decimal.js';
import { calculateQuoteDebug } from '../index.js';

describe('Complex Quote Examples - Snapshot Tests', () => {
  describe('Example 1: Tax Inclusive with Compound Discounts', () => {
    it('should match expected calculation steps', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('172.50'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 15,
            percentageDiscount: 10,
            fixedDiscount: { amount: new Decimal('100.00'), currency: 'NZD' },
            unit: 'hour'
          },
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal('138.00'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 15,
            percentageDiscount: 5,
            unit: 'hour'
          }
        ],
        quoteDiscount: {
          type: 'percentage' as const,
          value: 3,
          description: 'Quote-level discount'
        },
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      // Verify line 1 calculations
      expect(debug.lineCalculations[0].steps.calculations.subtotal.amount.toFixed(2)).toBe('6000.00');
      expect(debug.lineCalculations[0].steps.calculations.percentageDiscount?.amount.toFixed(2)).toBe('700.00');
      expect(debug.lineCalculations[0].steps.calculations.fixedDiscount?.amount.toFixed(2)).toBe('100.00');
      expect(debug.lineCalculations[0].steps.calculations.taxableAmount.amount.toFixed(2)).toBe('5300.00');
      expect(debug.lineCalculations[0].steps.calculations.taxAmount.amount.toFixed(2)).toBe('795.00');
      expect(debug.lineCalculations[0].steps.calculations.totalAmount.amount.toFixed(2)).toBe('6095.00');
      
      // Verify line 2 calculations
      expect(debug.lineCalculations[1].steps.calculations.subtotal.amount.toFixed(2)).toBe('2400.00');
      expect(debug.lineCalculations[1].steps.calculations.percentageDiscount?.amount.toFixed(2)).toBe('120.00');
      expect(debug.lineCalculations[1].steps.calculations.taxableAmount.amount.toFixed(2)).toBe('2280.00');
      expect(debug.lineCalculations[1].steps.calculations.taxAmount.amount.toFixed(2)).toBe('342.00');
      expect(debug.lineCalculations[1].steps.calculations.totalAmount.amount.toFixed(2)).toBe('2622.00');
      
      // Verify quote-level calculations
      expect(debug.quoteCalculations.calculations.subtotal.amount.toFixed(2)).toBe('8400.00');
      expect(debug.quoteCalculations.calculations.grandTotal.amount.toFixed(2)).toBe('8455.49');
      
      // Verify tax breakdown
      expect(debug.taxBreakdown).toHaveLength(1);
      expect(debug.taxBreakdown[0].rate).toBe(15);
      expect(debug.taxBreakdown[0].taxAmount.amount.toFixed(2)).toBe('1137.00');
    });
  });

  describe('Example 2: Mixed Tax Rates with Complex Discounts', () => {
    it('should handle multiple tax rates correctly', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            percentageDiscount: 10,
            unit: 'hour'
          },
          {
            description: 'Travel Expenses',
            quantity: 100,
            unitPrice: { amount: new Decimal('0.85'), currency: 'NZD' },
            taxRate: 0, // Tax exempt
            unit: 'km'
          },
          {
            description: 'Consulting',
            quantity: 20,
            unitPrice: { amount: new Decimal('200.00'), currency: 'NZD' },
            taxRate: 10, // Reduced rate
            fixedDiscount: { amount: new Decimal('200.00'), currency: 'NZD' },
            unit: 'hour'
          },
          {
            description: 'Software License',
            quantity: 1,
            unitPrice: { amount: new Decimal('500.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'license'
          }
        ],
        quoteDiscount: {
          type: 'fixed_amount' as const,
          value: 500,
          description: 'Fixed quote discount'
        },
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      // Verify line calculations
      expect(debug.lineCalculations[0].steps.calculations.taxAmount.amount.toFixed(2)).toBe('810.00'); // 15%
      expect(debug.lineCalculations[1].steps.calculations.taxAmount.amount.toFixed(2)).toBe('0.00'); // 0%
      expect(debug.lineCalculations[2].steps.calculations.taxAmount.amount.toFixed(2)).toBe('380.00'); // 10%
      expect(debug.lineCalculations[3].steps.calculations.taxAmount.amount.toFixed(2)).toBe('75.00'); // 15%
      
      // Verify tax breakdown
      expect(debug.taxBreakdown).toHaveLength(3);
      
      const exemptTax = debug.taxBreakdown.find(t => t.rate === 0);
      expect(exemptTax?.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      const reducedTax = debug.taxBreakdown.find(t => t.rate === 10);
      expect(reducedTax?.taxAmount.amount.toFixed(2)).toBe('380.00');
      
      const gstTax = debug.taxBreakdown.find(t => t.rate === 15);
      expect(gstTax?.taxAmount.amount.toFixed(2)).toBe('885.00'); // 810 + 75
      
      // Verify quote-level discount
      expect(debug.quoteCalculations.calculations.quoteFixedDiscount?.amount.toFixed(2)).toBe('500.00');
    });
  });

  describe('Example 3: Edge Cases and Rounding', () => {
    it('should handle edge cases correctly', () => {
      const input = {
        lineItems: [
          {
            description: 'Very Small Amount',
            quantity: 1,
            unitPrice: { amount: new Decimal('0.01'), currency: 'NZD' },
            taxRate: 15,
            unit: 'item'
          },
          {
            description: 'Large Amount',
            quantity: 1000,
            unitPrice: { amount: new Decimal('1000.00'), currency: 'NZD' },
            taxRate: 15,
            percentageDiscount: 1, // 1% discount
            unit: 'item'
          },
          {
            description: 'Tax Exempt Service',
            quantity: 10,
            unitPrice: { amount: new Decimal('100.00'), currency: 'NZD' },
            isTaxExempt: true,
            taxRate: 15,
            unit: 'hour'
          }
        ],
        quoteDiscount: {
          type: 'percentage' as const,
          value: 0.5, // 0.5% discount
          description: 'Small quote discount'
        },
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      // Verify very small amount handling
      expect(debug.lineCalculations[0].steps.calculations.subtotal.amount.toFixed(2)).toBe('0.01');
      expect(debug.lineCalculations[0].steps.calculations.taxAmount.amount.toFixed(2)).toBe('0.00'); // Rounded down
      
      // Verify large amount with small discount
      expect(debug.lineCalculations[1].steps.calculations.subtotal.amount.toFixed(2)).toBe('1000000.00');
      expect(debug.lineCalculations[1].steps.calculations.percentageDiscount?.amount.toFixed(2)).toBe('10000.00');
      expect(debug.lineCalculations[1].steps.calculations.taxAmount.amount.toFixed(2)).toBe('148500.00');
      
      // Verify tax exempt handling
      expect(debug.lineCalculations[2].steps.calculations.subtotal.amount.toFixed(2)).toBe('1000.00');
      expect(debug.lineCalculations[2].steps.calculations.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      // Verify tax breakdown includes exempt items
      const exemptTax = debug.taxBreakdown.find(t => t.rate === 0);
      expect(exemptTax?.taxableAmount.amount.toFixed(2)).toBe('1000.00');
      expect(exemptTax?.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      // Verify small quote discount
      expect(debug.quoteCalculations.calculations.quotePercentageDiscount?.amount.toFixed(2)).toBe('5697.50');
    });
  });

  describe('Example 4: Tax Inclusive with Mixed Rates', () => {
    it('should handle tax inclusive prices with different tax rates', () => {
      const input = {
        lineItems: [
          {
            description: 'GST Service',
            quantity: 10,
            unitPrice: { amount: new Decimal('115.00'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 15,
            unit: 'hour'
          },
          {
            description: 'Reduced Rate Service',
            quantity: 5,
            unitPrice: { amount: new Decimal('110.00'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 10,
            unit: 'hour'
          },
          {
            description: 'Tax Exempt Service',
            quantity: 2,
            unitPrice: { amount: new Decimal('100.00'), currency: 'NZD' }, // No tax
            taxInclusive: true,
            taxRate: 0,
            unit: 'item'
          }
        ],
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      // Verify GST service (115.00 / 1.15 = 100.00)
      expect(debug.lineCalculations[0].steps.calculations.subtotal.amount.toFixed(2)).toBe('1000.00');
      expect(debug.lineCalculations[0].steps.calculations.taxAmount.amount.toFixed(2)).toBe('150.00');
      
      // Verify reduced rate service (110.00 / 1.10 = 100.00)
      expect(debug.lineCalculations[1].steps.calculations.subtotal.amount.toFixed(2)).toBe('500.00');
      expect(debug.lineCalculations[1].steps.calculations.taxAmount.amount.toFixed(2)).toBe('50.00');
      
      // Verify tax exempt service (100.00 / 1.00 = 100.00)
      expect(debug.lineCalculations[2].steps.calculations.subtotal.amount.toFixed(2)).toBe('200.00');
      expect(debug.lineCalculations[2].steps.calculations.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      // Verify tax breakdown
      expect(debug.taxBreakdown).toHaveLength(3);
      
      const exemptTax = debug.taxBreakdown.find(t => t.rate === 0);
      expect(exemptTax?.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      const reducedTax = debug.taxBreakdown.find(t => t.rate === 10);
      expect(reducedTax?.taxAmount.amount.toFixed(2)).toBe('50.00');
      
      const gstTax = debug.taxBreakdown.find(t => t.rate === 15);
      expect(gstTax?.taxAmount.amount.toFixed(2)).toBe('150.00');
    });
  });
});
