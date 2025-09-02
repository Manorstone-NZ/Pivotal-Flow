import { describe, it, expect } from 'vitest';

// Test the JSONB guard functionality
describe('JSONB Guard - validateMetadataJSONB', () => {
  // Import the function from the service
  const { validateMetadataJSONB } = require('../service.js');

  describe('should allow valid metadata', () => {
    it('should allow benign metadata', () => {
      expect(() => {
        validateMetadataJSONB({ note: "ok", tags: ["x"] }, 'test context');
      }).not.toThrow();
    });

    it('should allow nested valid metadata', () => {
      expect(() => {
        validateMetadataJSONB({
          config: {
            display: {
              theme: "dark",
              layout: "compact"
            }
          }
        }, 'test context');
      }).not.toThrow();
    });

    it('should allow empty metadata', () => {
      expect(() => {
        validateMetadataJSONB({}, 'test context');
      }).not.toThrow();
    });
  });

  describe('should reject business values in metadata', () => {
    it('should reject totals in metadata', () => {
      expect(() => {
        validateMetadataJSONB({ subtotal: 10 }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject unitPrice in metadata', () => {
      expect(() => {
        validateMetadataJSONB({ unitPrice: 100 }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject taxAmount in metadata', () => {
      expect(() => {
        validateMetadataJSONB({ taxAmount: 15.50 }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject nested monetary fields', () => {
      expect(() => {
        validateMetadataJSONB({ 
          config: { 
            pricing: { unitPrice: 100 } 
          } 
        }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject array items with monetary fields', () => {
      expect(() => {
        validateMetadataJSONB([
          { metadata: { amount: 50 } },
          { metadata: { discount: 10 } }
        ], 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject quantity fields', () => {
      expect(() => {
        validateMetadataJSONB({ quantity: 5 }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject taxRate fields', () => {
      expect(() => {
        validateMetadataJSONB({ taxRate: 0.15 }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });

    it('should reject currency fields', () => {
      expect(() => {
        validateMetadataJSONB({ currency: "NZD" }, 'test context');
      }).toThrow('JSONB metadata cannot contain business values');
    });
  });

  describe('should provide clear error messages', () => {
    it('should include field path in error message', () => {
      try {
        validateMetadataJSONB({
          config: {
            pricing: {
              unitPrice: 100
            }
          }
        }, 'rate card metadata');
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('unitPrice');
        expect((error as Error).message).toContain('config.pricing.unitPrice');
        expect((error as Error).message).toContain('rate card metadata');
      }
    });

    it('should include context in error message', () => {
      try {
        validateMetadataJSONB({ subtotal: 1000         }, 'quote line item 1 metadata');
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('quote line item 1 metadata');
        expect((error as Error).message).toContain('Business values must be stored in typed columns');
      }
    });
  });
});
