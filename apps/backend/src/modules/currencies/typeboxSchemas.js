import { Type } from '@sinclair/typebox';
// Currency Response Schema
export const CurrencyResponseSchema = Type.Object({
    code: Type.String(),
    name: Type.String(),
    symbol: Type.String(),
    isActive: Type.Boolean()
});
// Error response schema
export const CurrencyErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=typeboxSchemas.js.map