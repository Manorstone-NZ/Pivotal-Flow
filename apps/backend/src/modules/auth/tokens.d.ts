import type { FastifyInstance } from 'fastify';
interface JWTPayload {
    sub: string;
    org: string;
    roles: string[];
    jti: string;
    iat: number;
    exp: number;
}
interface RefreshTokenData {
    userId: string;
    organizationId: string;
    roles: string[];
    jti: string;
    expiresAt: Date;
    isRevoked: boolean;
}
export declare function createTokenManager(app: FastifyInstance): {
    signAccessToken: (payload: Omit<JWTPayload, "jti" | "iat" | "exp">) => Promise<string>;
    signRefreshToken: (payload: Omit<JWTPayload, "jti" | "iat" | "exp">) => Promise<string>;
    verifyToken: (token: string) => Promise<JWTPayload>;
    validateRefreshToken: (jti: string) => Promise<RefreshTokenData | null>;
    revokeRefreshToken: (jti: string) => Promise<void>;
    rotateRefreshToken: (oldJti: string, payload: Omit<JWTPayload, "jti" | "iat" | "exp">) => Promise<string>;
};
export {};
//# sourceMappingURL=tokens.d.ts.map