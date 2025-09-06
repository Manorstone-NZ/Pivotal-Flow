import { generateId } from '@pivotal-flow/shared';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';
export function createTokenManager(app) {
    const alg = 'HS256';
    /**
     * Sign an access token
     */
    async function signAccessToken(payload) {
        logger.debug({
            hasFastify: !!app,
            fastifyType: typeof app,
            hasJwt: !!(app?.jwt),
            payloadKeys: Object.keys(payload)
        }, 'signAccessToken called');
        const tokenPayload = {
            ...payload,
            jti: generateJTI(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + parseTTL(config.auth.ACCESS_TOKEN_TTL),
        };
        return app.jwt.sign(tokenPayload, { algorithm: alg, expiresIn: config.auth.ACCESS_TOKEN_TTL });
    }
    /**
     * Sign a refresh token
     */
    async function signRefreshToken(payload) {
        const jti = generateJTI();
        const tokenPayload = {
            ...payload,
            jti,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + parseTTL(config.auth.REFRESH_TOKEN_TTL),
        };
        // Store refresh token in cache (optional for now)
        try {
            await storeRefreshToken(jti, {
                userId: payload['sub'],
                organizationId: payload['org'],
                roles: payload['roles'] || [],
                jti,
                expiresAt: new Date((tokenPayload.exp ?? 0) * 1000),
                isRevoked: false,
            });
        }
        catch (error) {
            logger.warn({ err: error }, 'Failed to store refresh token, continuing without cache');
        }
        return app.jwt.sign(tokenPayload, { algorithm: alg, expiresIn: config.auth.REFRESH_TOKEN_TTL });
    }
    /**
     * Verify and decode a JWT token
     */
    async function verifyToken(token) {
        try {
            const decoded = await app.jwt.verify(token);
            return decoded;
        }
        catch (error) {
            logger.warn({ err: error }, 'Token verification failed');
            throw new Error('Invalid token');
        }
    }
    /**
     * Store refresh token in cache
     */
    async function storeRefreshToken(_jti, _data) {
        // Temporarily disable cache storage to fix login
        logger.warn('Cache storage temporarily disabled for login functionality');
        return;
        // Original code (commented out for now)
        /*
        const key = `pivotal:refresh_token:${jti}`;
        const ttl = parseTTL(config.auth.refreshTokenTTL);
        
        // Debug: Check if cache is available
        if (!app.cache) {
          logger.warn('Cache is not available in storeRefreshToken, skipping token storage');
          return;
        }
        
        try {
          await app.cache.set(key, data, ttl);
          logger.debug({ jti, userId: data.userId }, 'Refresh token stored in cache');
        } catch (error) {
          logger.warn({ err: error, jti }, 'Failed to store refresh token in cache');
        }
        */
    }
    /**
     * Validate refresh token from cache
     */
    async function validateRefreshToken(jti) {
        const key = `pivotal:refresh_token:${jti}`;
        // Debug: Check if cache is available
        if (!app.cache) {
            logger.warn('Cache is not available in validateRefreshToken, returning null');
            return null;
        }
        try {
            const data = await app.cache.get(key);
            if (!data) {
                return null;
            }
            const tokenData = data;
            if (tokenData.isRevoked || new Date() > tokenData.expiresAt) {
                return null;
            }
            return tokenData;
        }
        catch (error) {
            logger.warn({ err: error, jti }, 'Failed to validate refresh token from cache');
            return null;
        }
    }
    /**
     * Revoke refresh token
     */
    async function revokeRefreshToken(jti) {
        const key = `pivotal:refresh_token:${jti}`;
        // Debug: Check if cache is available
        if (!app.cache) {
            logger.warn('Cache is not available in revokeRefreshToken, skipping revocation');
            return;
        }
        try {
            await app.cache.delete(key);
            logger.info({ jti }, 'Refresh token revoked');
        }
        catch (error) {
            logger.warn({ err: error, jti }, 'Failed to revoke refresh token from cache');
        }
    }
    /**
     * Rotate refresh token (revoke old, create new)
     */
    async function rotateRefreshToken(oldJti, payload) {
        // Revoke old token
        await revokeRefreshToken(oldJti);
        // Generate new refresh token
        return signRefreshToken(payload);
    }
    /**
     * Parse TTL string to seconds
     */
    function parseTTL(ttl) {
        const match = ttl.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 900; // Default to 15 minutes
        }
        const value = parseInt(match[1] ?? '0', 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 900;
        }
    }
    /**
     * Generate a new JWT ID for refresh tokens
     */
    function generateJTI() {
        return generateId();
    }
    return {
        signAccessToken,
        signRefreshToken,
        verifyToken,
        validateRefreshToken,
        revokeRefreshToken,
        rotateRefreshToken,
    };
}
//# sourceMappingURL=tokens.js.map