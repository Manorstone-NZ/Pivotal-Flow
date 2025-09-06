import { z } from 'zod';
// Login request schema
export const loginRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
});
// Login response schema
export const loginResponseSchema = z.object({
    accessToken: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string().email(),
        displayName: z.string(),
        roles: z.array(z.string()),
        organizationId: z.string(),
    }),
});
// Refresh request schema
export const refreshRequestSchema = z.object({
    refreshToken: z.string().optional(), // Optional for cookie-based refresh
});
// Refresh response schema
export const refreshResponseSchema = z.object({
    accessToken: z.string(),
});
// Logout response schema
export const logoutResponseSchema = z.object({
    message: z.string(),
});
// Me response schema
export const meResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    roles: z.array(z.string()),
    organizationId: z.string(),
});
// Error response schema
export const authErrorSchema = z.object({
    error: z.string(),
    message: z.string(),
    code: z.string(),
});
// Rate limit error schema
export const rateLimitErrorSchema = z.object({
    error: z.string(),
    message: z.string(),
    code: z.string(),
    retryAfter: z.number(),
});
//# sourceMappingURL=schemas.js.map