import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { config } from '../../lib/config.js';
import { logger } from '../../lib/logger.js';
import type { JWTPayload, RefreshTokenData } from '@pivotal-flow/shared/security/jwt-types.js';

export function createTokenManager(app: FastifyInstance) {
  const alg = 'HS256';



  /**
   * Sign an access token
   */
  async function signAccessToken(payload: Omit<JWTPayload, 'jti' | 'iat' | 'exp'>): Promise<string> {
    logger.debug({ 
      hasFastify: !!app, 
      fastifyType: typeof app,
      hasJwt: !!(app?.jwt),
      payloadKeys: Object.keys(payload)
    }, 'signAccessToken called');
    
    const tokenPayload: JWTPayload = {
      ...payload,
      jti: generateJTI(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseTTL(config.auth.accessTokenTTL),
    };

    return app.jwt.sign(tokenPayload, { algorithm: alg, expiresIn: config.auth.accessTokenTTL });
  }

  /**
   * Sign a refresh token
   */
  async function signRefreshToken(payload: Omit<JWTPayload, 'jti' | 'iat' | 'exp'>): Promise<string> {
    const jti = generateJTI();
    const tokenPayload: JWTPayload = {
      ...payload,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseTTL(config.auth.refreshTokenTTL),
    };

    // Store refresh token in Redis
    await storeRefreshToken(jti, {
      userId: payload['sub'],
      organizationId: payload['org'],
      jti,
      expiresAt: new Date((tokenPayload.exp ?? 0) * 1000),
      isRevoked: false,
    });

    return app.jwt.sign(tokenPayload, { algorithm: alg, expiresIn: config.auth.refreshTokenTTL });
  }

  /**
   * Verify and decode a JWT token
   */
  async function verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = await app.jwt.verify(token);
      return decoded as JWTPayload;
    } catch (error) {
      logger.warn({ err: error }, 'Token verification failed');
      throw new Error('Invalid token');
    }
  }

  /**
   * Store refresh token in Redis
   */
  async function storeRefreshToken(jti: string, data: RefreshTokenData): Promise<void> {
    const key = `pivotal:refresh_token:${jti}`;
    const ttl = parseTTL(config.auth.refreshTokenTTL);
    
    await app.redis.setex(key, ttl, JSON.stringify(data));
    logger.debug({ jti, userId: data.userId }, 'Refresh token stored in Redis');
  }

  /**
   * Validate refresh token from Redis
   */
  async function validateRefreshToken(jti: string): Promise<RefreshTokenData | null> {
    const key = `pivotal:refresh_token:${jti}`;
    const data = await app.redis.get(key);
    
    if (!data) {
      return null;
    }

    try {
      const tokenData: RefreshTokenData = JSON.parse(data);
      
      if (tokenData.isRevoked || new Date() > tokenData.expiresAt) {
        return null;
      }

      return tokenData;
    } catch (error) {
      logger.warn({ err: error, jti }, 'Failed to parse refresh token data');
      return null;
    }
  }

  /**
   * Revoke refresh token
   */
  async function revokeRefreshToken(jti: string): Promise<void> {
    const key = `pivotal:refresh_token:${jti}`;
    await app.redis.del(key);
    logger.info({ jti }, 'Refresh token revoked');
  }

  /**
   * Rotate refresh token (revoke old, create new)
   */
  async function rotateRefreshToken(oldJti: string, payload: Omit<JWTPayload, 'jti' | 'iat' | 'exp'>): Promise<string> {
    // Revoke old token
    await revokeRefreshToken(oldJti);
    
    // Generate new refresh token
    return signRefreshToken(payload);
  }

  /**
   * Parse TTL string to seconds
   */
  function parseTTL(ttl: string): number {
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
  function generateJTI(): string {
    return randomUUID();
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
