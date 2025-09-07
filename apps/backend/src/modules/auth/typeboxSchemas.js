// apps/backend/src/modules/auth/typeboxSchemas.ts
import { Type } from '@sinclair/typebox';
// Login request schema
export const LoginRequestSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 12 })
});
// Login response schema
export const LoginResponseSchema = Type.Object({
    accessToken: Type.String(),
    user: Type.Object({
        id: Type.String(),
        email: Type.String({ format: 'email' }),
        displayName: Type.String(),
        roles: Type.Array(Type.String()),
        organizationId: Type.String()
    })
});
// Refresh request schema
export const RefreshRequestSchema = Type.Object({
    refreshToken: Type.Optional(Type.String())
});
// Refresh response schema
export const RefreshResponseSchema = Type.Object({
    accessToken: Type.String()
});
// Logout response schema
export const LogoutResponseSchema = Type.Object({
    message: Type.String()
});
// Me response schema
export const MeResponseSchema = Type.Object({
    id: Type.String(),
    email: Type.String({ format: 'email' }),
    displayName: Type.String(),
    roles: Type.Array(Type.String()),
    organizationId: Type.String()
});
// Error response schema
export const AuthErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
//# sourceMappingURL=typeboxSchemas.js.map