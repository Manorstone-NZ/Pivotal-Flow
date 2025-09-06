import { describe, it, expect } from 'vitest';
import { guardTypedFilters } from "./filterGuard.js";
describe("filter guard", () => {
    it("blocks metadata path for core fields", () => {
        const r = guardTypedFilters({ "metadata.subtotal": 100 });
        expect(r.ok).toBe(false);
        expect(r.reason).toContain("metadata.subtotal");
    });
    it("blocks metadata arrow syntax", () => {
        const r = guardTypedFilters({ "metadata->subtotal": 100 });
        expect(r.ok).toBe(false);
        expect(r.reason).toContain("metadata->subtotal");
    });
    it("passes normal typed filters", () => {
        const r = guardTypedFilters({ status: "draft", customerId: "abc" });
        expect(r.ok).toBe(true);
    });
    it("allows nested non-metadata paths", () => {
        const r = guardTypedFilters({
            "customer.name": "John",
            "project.code": "PRJ-001"
        });
        expect(r.ok).toBe(true);
    });
    it("blocks all forbidden core fields in metadata", () => {
        const forbiddenFields = [
            "metadata.status",
            "metadata.currency",
            "metadata.subtotal",
            "metadata.taxTotal",
            "metadata.grandTotal",
            "metadata.unitPrice",
            "metadata.discount",
            "metadata.quoteNumber",
            "metadata.customerId",
            "metadata.projectId",
            "metadata.createdAt"
        ];
        forbiddenFields.forEach(field => {
            const r = guardTypedFilters({ [field]: "value" });
            expect(r.ok).toBe(false);
            expect(r.reason).toContain(field);
        });
    });
});
//# sourceMappingURL=filterGuard.test.js.map