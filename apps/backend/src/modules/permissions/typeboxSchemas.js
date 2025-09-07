import { Type } from '@sinclair/typebox';
// Permission Response Schema
export const PermissionResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    resource: Type.String(),
    action: Type.String(),
    organizationId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
});
// Error response schema
export const PermissionErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=typeboxSchemas.js.map