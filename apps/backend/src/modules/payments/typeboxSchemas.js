import { Type } from '@sinclair/typebox';
// Payment Response Schema
export const PaymentResponseSchema = Type.Object({
    id: Type.String(),
    amount: Type.Number(),
    currency: Type.String(),
    status: Type.String(),
    method: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
});
// Error response schema
export const PaymentErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=typeboxSchemas.js.map