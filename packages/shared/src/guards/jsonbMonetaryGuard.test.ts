import { assertNoMonetaryInMetadata } from "./jsonbMonetaryGuard";

describe("jsonb monetary guard", () => {
  it("allows benign metadata", () => {
    const v = assertNoMonetaryInMetadata({ note: "ok", tags: ["x"] });
    expect(v).toHaveLength(0);
  });

  it("rejects totals in metadata", () => {
    const v = assertNoMonetaryInMetadata({ subtotal: 10 });
    expect(v.length).toBeGreaterThan(0);
    expect(v[0].key).toBe("subtotal");
  });

  it("rejects nested monetary fields", () => {
    const v = assertNoMonetaryInMetadata({ 
      config: { 
        pricing: { unitPrice: 100 } 
      } 
    });
    expect(v.length).toBeGreaterThan(0);
    expect(v[0].key).toBe("unitPrice");
  });

  it("rejects array items with monetary fields", () => {
    const v = assertNoMonetaryInMetadata([
      { metadata: { amount: 50 } },
      { metadata: { discount: 10 } }
    ]);
    expect(v.length).toBe(2);
    expect(v[0].key).toBe("amount");
    expect(v[1].key).toBe("discount");
  });

  it("allows valid metadata structures", () => {
    const v = assertNoMonetaryInMetadata({
      tags: ["urgent", "review"],
      notes: "Customer requested expedited processing",
      customFields: {
        priority: "high",
        department: "sales"
      }
    });
    expect(v).toHaveLength(0);
  });
});
