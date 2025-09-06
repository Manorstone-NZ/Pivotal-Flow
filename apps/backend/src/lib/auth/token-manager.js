import { config } from '../../config/index.js';
export class TokenManager {
    secret;
    issuer;
    audience;
    constructor(secret, issuer = 'pivotal-flow-auth', audience = 'pivotal-flow-api') {
        if (!secret || secret.trim() === '') {
            throw new Error('JWT_SECRET must not be empty');
        }
        this.secret = secret;
        this.issuer = issuer;
        this.audience = audience;
    }
    async signAccessToken(payload) {
        // This is a placeholder implementation
        // In production, you would use a proper JWT library like jsonwebtoken or jose
        const tokenPayload = {
            sub: payload.sub || 'user_123',
            org: payload.org || 'org_456',
            aud: this.audience,
            iss: this.issuer,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            nbf: Math.floor(Date.now() / 1000),
            jti: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roles: payload.roles || ['user'],
            permissions: payload.permissions || ['users.view_users'],
            mfa: payload.mfa || false,
            scope: payload.scope || ['read', 'write']
        };
        // Simulate JWT signing
        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
        // Ensure secret is defined before using in Buffer.from
        if (!this.secret) {
            throw new Error('JWT secret is not defined');
        }
        const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${this.secret}`).toString('base64url');
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
    async signRefreshToken(payload) {
        // Similar to access token but with longer expiration
        const refreshPayload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
            jti: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        return this.signAccessToken(refreshPayload);
    }
    async verifyToken(token) {
        // This is a placeholder implementation
        // In production, you would verify the signature
        try {
            const parts = token.split('.');
            if (parts.length !== 3 || !parts[1]) {
                throw new Error('Invalid token format');
            }
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            // Check expiration
            if (payload.exp < Math.floor(Date.now() / 1000)) {
                throw new Error('Token expired');
            }
            return payload;
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3 || !parts[1]) {
                return null;
            }
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            return payload;
        }
        catch (error) {
            return null;
        }
    }
}
// Export a default instance
export const tokenManager = new TokenManager(config.auth.JWT_SECRET, config.auth.JWT_ISSUER, config.auth.JWT_AUDIENCE);
//# sourceMappingURL=token-manager.js.map