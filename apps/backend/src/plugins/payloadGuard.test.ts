// TODO: Re-enable when shared guards module is available
// import { describe, it, expect } from 'vitest';
// import { assertNoMonetaryInMetadata } from "@pivotal-flow/shared/guards/jsonbMonetaryGuard";

// describe("payload guard plugin unit helper", () => {
//   it("finds line level violations", () => {
//     const md = { lines: [{ metadata: { unitPrice: 1 } }] };
//     const v = assertNoMonetaryInMetadata(md.lines[0].metadata);
//     expect(v.length).toBe(1);
//     expect(v[0].key).toBe("unitPrice");
//   });

//   it("finds quote level violations", () => {
//     const md = { metadata: { subtotal: 1000, taxTotal: 150 } };
//     const v = assertNoMonetaryInMetadata(md.metadata);
//     expect(v.length).toBe(2);
//     expect(v[0].key).toBe("subtotal");
//     expect(v[1].key).toBe("taxTotal");
//   });

//   it("allows valid metadata", () => {
//     const md = { 
//       metadata: { 
//         tags: ["urgent"],
//         notes: "Customer requested expedited processing"
//       }
//     };
//     const v = assertNoMonetaryInMetadata(md.metadata);
//     expect(v).toHaveLength(0);
//   });

//   it("handles nested violations", () => {
//     const md = {
//       metadata: {
//         config: {
//           pricing: {
//             unitPrice: 100,
//             discount: 10
//           }
//         }
//       }
//     };
//     const v = assertNoMonetaryInMetadata(md.metadata);
//     expect(v.length).toBe(2);
//     expect(v.some(v => v.key === "unitPrice")).toBe(true);
//     expect(v.some(v => v.key === "discount")).toBe(true);
//   });
// });
