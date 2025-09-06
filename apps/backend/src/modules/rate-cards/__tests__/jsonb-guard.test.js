import { throwIfMonetaryInMetadata } from '@pivotal-flow/shared/guards/jsonbMonetaryGuard.js';
import { describe, it, expect } from 'vitest';
describe('JSONB Guard - throwIfMonetaryInMetadata', () => {
    describe('should allow valid metadata', () => {
        it('allows benign metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ note: "ok", tags: ["x"] })).not.toThrow();
        });
        it('allows empty metadata', () => {
            expect(() => throwIfMonetaryInMetadata({})).not.toThrow();
        });
        it('allows null metadata', () => {
            expect(() => throwIfMonetaryInMetadata(null)).not.toThrow();
        });
    });
    describe('should reject forbidden fields', () => {
        it('rejects subtotal in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ subtotal: 10 })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects unitPrice in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ unitPrice: 100 })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects taxAmount in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ taxAmount: 15.50 })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects nested forbidden fields', () => {
            expect(() => throwIfMonetaryInMetadata({
                config: {
                    pricing: {
                        unitPrice: 100,
                        discount: 10
                    }
                }
            })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects array items with forbidden fields', () => {
            expect(() => throwIfMonetaryInMetadata([
                { metadata: { amount: 50 } },
                { metadata: { discount: 10 } }
            ])).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects quantity in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ quantity: 5 })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects taxRate in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ taxRate: 0.15 })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
        it('rejects currency in metadata', () => {
            expect(() => throwIfMonetaryInMetadata({ currency: "NZD" })).toThrow('JSONB_MONETARY_FORBIDDEN');
        });
    });
    describe('should allow valid metadata structures', () => {
        it('allows tags and notes', () => {
            expect(() => throwIfMonetaryInMetadata({
                tags: ["urgent", "review"],
                notes: "Customer requested expedited processing"
            })).not.toThrow();
        });
        it('allows custom fields', () => {
            expect(() => throwIfMonetaryInMetadata({
                customFields: {
                    priority: "high",
                    department: "sales"
                }
            })).not.toThrow();
        });
        it('allows complex valid metadata', () => {
            expect(() => throwIfMonetaryInMetadata({
                tags: ["urgent"],
                notes: "Customer requested expedited processing",
                customFields: {
                    priority: "high",
                    department: "sales"
                },
                metadata: {
                    source: "web",
                    version: "1.0"
                }
            })).not.toThrow();
        });
    });
});
//# sourceMappingURL=jsonb-guard.test.js.map