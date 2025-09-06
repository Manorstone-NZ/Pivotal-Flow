import { z } from 'zod';
export declare const loginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const loginResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        displayName: z.ZodString;
        roles: z.ZodArray<z.ZodString, "many">;
        organizationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        organizationId: string;
        email: string;
        roles: string[];
        displayName: string;
    }, {
        id: string;
        organizationId: string;
        email: string;
        roles: string[];
        displayName: string;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        organizationId: string;
        email: string;
        roles: string[];
        displayName: string;
    };
    accessToken: string;
}, {
    user: {
        id: string;
        organizationId: string;
        email: string;
        roles: string[];
        displayName: string;
    };
    accessToken: string;
}>;
export declare const refreshRequestSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    refreshToken?: string | undefined;
}, {
    refreshToken?: string | undefined;
}>;
export declare const refreshResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
}, {
    accessToken: string;
}>;
export declare const logoutResponseSchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const meResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodString;
    roles: z.ZodArray<z.ZodString, "many">;
    organizationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    organizationId: string;
    email: string;
    roles: string[];
    displayName: string;
}, {
    id: string;
    organizationId: string;
    email: string;
    roles: string[];
    displayName: string;
}>;
export declare const authErrorSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    error: string;
    message: string;
}, {
    code: string;
    error: string;
    message: string;
}>;
export declare const rateLimitErrorSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    code: z.ZodString;
    retryAfter: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    error: string;
    message: string;
    retryAfter: number;
}, {
    code: string;
    error: string;
    message: string;
    retryAfter: number;
}>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
export type RateLimitError = z.infer<typeof rateLimitErrorSchema>;
//# sourceMappingURL=schemas.d.ts.map