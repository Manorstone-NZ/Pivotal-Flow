import { type Static } from '@sinclair/typebox';
export declare const CurrencyResponseSchema: import("@sinclair/typebox").TObject<{
    code: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    symbol: import("@sinclair/typebox").TString;
    isActive: import("@sinclair/typebox").TBoolean;
}>;
export type CurrencyResponse = Static<typeof CurrencyResponseSchema>;
export declare const CurrencyErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type CurrencyError = Static<typeof CurrencyErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map