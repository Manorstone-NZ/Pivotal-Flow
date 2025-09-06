import type { TokenPayload } from '../../types/auth.js';
export declare class TokenManager {
    private secret;
    private issuer;
    private audience;
    constructor(secret: string, issuer?: string, audience?: string);
    signAccessToken(payload: Partial<TokenPayload>): Promise<string>;
    signRefreshToken(payload: Partial<TokenPayload>): Promise<string>;
    verifyToken(token: string): Promise<TokenPayload>;
    decodeToken(token: string): TokenPayload | null;
}
export declare const tokenManager: TokenManager;
//# sourceMappingURL=token-manager.d.ts.map