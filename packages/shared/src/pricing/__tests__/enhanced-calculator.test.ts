import { Decimal } from 'decimal.js';
import { describe, it, expect } from 'vitest';

import { validateMetadataJSONB, FORBIDDEN_JSONB_FIELDS } from '../../guards/jsonb.js';
import { calculateQuote, calculateQuoteDebug } from '../index.js';

describe('Enhanced Quote Calculator', () => {
  describe('Tax Inclusive Calculations', () => {
    it('should convert tax inclusive price to exclusive and calculate correctly', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('172.50'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Tax exclusive price should be 172.50 / 1.15 = 150.00
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('6000.00');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('900.00');
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('6900.00');
    });

    it('should handle tax inclusive with discounts', () => {
      const input = {
        lineItems: [
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal('138.00'), currency: 'NZD' }, // Tax inclusive
            taxInclusive: true,
            taxRate: 15,
            percentageDiscount: 10,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Tax exclusive price: 138.00 / 1.15 = 120.00
      // Subtotal: 20 * 120.00 = 2400.00
      // Percentage discount: 2400.00 * 10% = 240.00
      // Taxable: 2400.00 - 240.00 = 2160.00
      // Tax: 2160.00 * 15% = 324.00
      // Total: 2160.00 + 324.00 = 2484.00
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('2400.00');
      expect(result.lineCalculations[0]?.discountAmount.amount.toFixed(2)).toBe('240.00');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('324.00');
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('2484.00');
    });
  });

  describe('Mixed Tax Rates', () => {
    it('should handle different tax rates per line item', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
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
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Line 1: 40 * 150 = 6000, tax = 6000 * 15% = 900
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('900.00');
      
      // Line 2: 100 * 0.85 = 85, tax = 0 (exempt)
      expect(result.lineCalculations[1]?.taxAmount.amount.toFixed(2)).toBe('0.00');
      
      // Line 3: 20 * 200 = 4000, tax = 4000 * 10% = 400
      expect(result.lineCalculations[2]?.taxAmount.amount.toFixed(2)).toBe('400.00');
      
      // Total tax should be 900 + 0 + 400 = 1300
      expect(result.totals.taxAmount.amount.toFixed(2)).toBe('1300.00');
    });
  });

  describe('Compound Discounts', () => {
    it('should apply percentage then fixed discounts in correct order', () => {
      const input = {
        lineItems: [
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal('120.00'), currency: 'NZD' },
            percentageDiscount: 10,
            fixedDiscount: { amount: new Decimal('50.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Subtotal: 20 * 120 = 2400
      // Percentage discount: 2400 * 10% = 240
      // Fixed discount: 50
      // Total discount: 240 + 50 = 290
      // Taxable: 2400 - 290 = 2110
      // Tax: 2110 * 15% = 316.50
      // Total: 2110 + 316.50 = 2426.50
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('2400.00');
      expect(result.lineCalculations[0]?.discountAmount.amount.toFixed(2)).toBe('290.00');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('316.50');
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('2426.50');
    });
  });

  describe('Quote Level Discounts', () => {
    it('should apply quote-level discount after line totals', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          },
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal('120.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        quoteDiscount: {
          type: 'percentage' as const,
          value: 5,
          description: 'Quote-level discount'
        },
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Line 1: 40 * 150 = 6000, tax = 6000 * 15% = 900, total = 6900
      // Line 2: 20 * 120 = 2400, tax = 2400 * 15% = 360, total = 2760
      // Line totals: 6900 + 2760 = 9660
      // Quote discount: 9660 * 5% = 483
      // Grand total: 9660 - 483 = 9177
      expect(result.totals.subtotal.amount.toFixed(2)).toBe('8400.00');
      expect(result.totals.taxAmount.amount.toFixed(2)).toBe('1260.00');
      expect(result.totals.discountAmount.amount.toFixed(2)).toBe('483.00');
      expect(result.totals.grandTotal.amount.toFixed(2)).toBe('9177.00');
    });
  });

  describe('Debug Output', () => {
    it('should provide detailed debug information', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            percentageDiscount: 10,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      expect(debug.lineCalculations).toHaveLength(1);
      expect(debug.lineCalculations[0]?.lineNumber).toBe(1);
      expect(debug.lineCalculations[0]?.description).toBe('Web Development');
      expect(debug.lineCalculations[0]?.steps.input.quantity).toBe(40);
      expect(debug.lineCalculations[0]?.steps.input.taxInclusive).toBe(false);
      expect(debug.lineCalculations[0]?.steps.calculations.subtotal.amount.toFixed(2)).toBe('6000.00');
      expect(debug.lineCalculations[0]?.steps.calculations.percentageDiscount?.amount.toFixed(2)).toBe('600.00');
      expect(debug.taxBreakdown).toHaveLength(1);
      expect(debug.taxBreakdown[0]?.rate).toBe(15);
      expect(debug.taxBreakdown[0]?.description).toBe('GST (15%)');
    });

    it('should show tax breakdown for mixed rates', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          },
          {
            description: 'Travel Expenses',
            quantity: 100,
            unitPrice: { amount: new Decimal('0.85'), currency: 'NZD' },
            taxRate: 0,
            unit: 'km'
          }
        ],
        currency: 'NZD'
      };

      const debug = calculateQuoteDebug(input);
      
      expect(debug.taxBreakdown).toHaveLength(2);
      expect(debug.taxBreakdown[0]?.rate).toBe(0);
      expect(debug.taxBreakdown[0]?.description).toBe('Exempt (0%)');
      expect(debug.taxBreakdown[1]?.rate).toBe(15);
      expect(debug.taxBreakdown[1]?.description).toBe('GST (15%)');
    });
  });

  describe('Property Tests', () => {
    it('should maintain non-negative invariants', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // All monetary amounts must be non-negative
      expect(result.totals.grandTotal.amount.isNegative()).toBe(false);
      expect(result.totals.subtotal.amount.isNegative()).toBe(false);
      expect(result.totals.taxAmount.amount.isNegative()).toBe(false);
      expect(result.lineCalculations[0]?.subtotal.amount.isNegative()).toBe(false);
      expect(result.lineCalculations[0]?.taxAmount.amount.isNegative()).toBe(false);
    });

    it('should maintain tax consistency', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          },
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: { amount: new Decimal('120.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Tax amount must equal sum of line item taxes
      const totalTaxFromLines = result.lineCalculations.reduce(
        (sum, line) => sum.add(line.taxAmount.amount), 
        new Decimal(0)
      );
      expect(result.totals.taxAmount.amount.equals(totalTaxFromLines)).toBe(true);
    });

    it('should maintain total consistency', () => {
      const input = {
        lineItems: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: { amount: new Decimal('150.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      // Grand total must equal sum of line item totals (without quote discount)
      const totalFromLines = result.lineCalculations.reduce(
        (sum, line) => sum.add(line.totalAmount.amount), 
        new Decimal(0)
      );
      expect(result.totals.grandTotal.amount.equals(totalFromLines)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amounts correctly', () => {
      const input = {
        lineItems: [
          {
            description: 'Free Service',
            quantity: 1,
            unitPrice: { amount: new Decimal('0.00'), currency: 'NZD' },
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('0.00');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('0.00');
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('0.00');
    });

    it('should handle tax exempt items', () => {
      const input = {
        lineItems: [
          {
            description: 'Tax Exempt Service',
            quantity: 10,
            unitPrice: { amount: new Decimal('100.00'), currency: 'NZD' },
            isTaxExempt: true,
            taxRate: 15,
            unit: 'hour'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('1000.00');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('0.00');
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('1000.00');
    });

    it('should handle very small amounts', () => {
      const input = {
        lineItems: [
          {
            description: 'Small Amount',
            quantity: 1,
            unitPrice: { amount: new Decimal('0.01'), currency: 'NZD' },
            taxRate: 15,
            unit: 'item'
          }
        ],
        currency: 'NZD'
      };

      const result = calculateQuote(input);
      
      expect(result.lineCalculations[0]?.subtotal.amount.toFixed(2)).toBe('0.01');
      expect(result.lineCalculations[0]?.taxAmount.amount.toFixed(2)).toBe('0.00'); // Rounded down
      expect(result.lineCalculations[0]?.totalAmount.amount.toFixed(2)).toBe('0.01');
    });
  });
});

describe('JSONB Guard', () => {
  describe('validateMetadataJSONB', () => {
    it('should allow valid metadata', () => {
      const validMetadata = {
        tags: ['urgent', 'review'],
        notes: 'Customer requested expedited processing',
        customFields: {
          priority: 'high',
          department: 'sales'
        }
      };

      expect(() => validateMetadataJSONB(validMetadata, 'test')).not.toThrow();
    });

    it('should reject monetary fields', () => {
      const invalidMetadata = {
        subtotal: 1000,
        unitPrice: 150,
        taxAmount: 150
      };

      expect(() => validateMetadataJSONB(invalidMetadata, 'test')).toThrow(
        'JSONB metadata cannot contain business values'
      );
    });

    it('should reject nested monetary fields', () => {
      const invalidMetadata = {
        calculations: {
          discount: 100,
          totals: {
            grandTotal: 5000
          }
        }
      };

      expect(() => validateMetadataJSONB(invalidMetadata, 'test')).toThrow(
        'JSONB metadata cannot contain business values'
      );
    });

    it('should reject business calculation fields', () => {
      const invalidMetadata = {
        quantity: 10,
        taxRate: 15,
        currency: 'NZD'
      };

      expect(() => validateMetadataJSONB(invalidMetadata, 'test')).toThrow(
        'JSONB metadata cannot contain business values'
      );
    });

    it('should handle null and undefined', () => {
      expect(() => validateMetadataJSONB(null, 'test')).not.toThrow();
      expect(() => validateMetadataJSONB(undefined, 'test')).not.toThrow();
    });

    it('should handle empty objects', () => {
      expect(() => validateMetadataJSONB({}, 'test')).not.toThrow();
    });

    it('should provide clear error messages with field paths', () => {
      const invalidMetadata = {
        nested: {
          deep: {
            subtotal: 1000
          }
        }
      };

      expect(() => validateMetadataJSONB(invalidMetadata, 'quote metadata')).toThrow(
        'Field \'subtotal\' at path \'nested.deep.subtotal\' in quote metadata is forbidden'
      );
    });
  });

  describe('FORBIDDEN_JSONB_FIELDS', () => {
    it('should contain all required forbidden fields', () => {
      const requiredFields = [
        'subtotal', 'taxTotal', 'grandTotal', 'totalAmount',
        'unitPrice', 'price', 'amount', 'cost',
        'discountAmount', 'taxAmount', 'discountValue',
        'quantity', 'qty', 'unit', 'taxRate', 'taxClass',
        'currency', 'exchangeRate', 'rate',
        'status', 'totals', 'calculations', 'breakdown'
      ];

      requiredFields.forEach(field => {
        expect(FORBIDDEN_JSONB_FIELDS).toContain(field);
      });
    });
  });
});
