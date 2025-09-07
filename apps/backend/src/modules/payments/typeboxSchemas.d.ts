import { type Static } from '@sinclair/typebox';
export declare const PaymentResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    amount: import("@sinclair/typebox").TNumber;
    currency: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TString;
    method: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type PaymentResponse = Static<typeof PaymentResponseSchema>;
export declare const PaymentErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type PaymentError = Static<typeof PaymentErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map