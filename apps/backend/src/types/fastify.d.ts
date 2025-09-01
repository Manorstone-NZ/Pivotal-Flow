import type { CacheService } from '../lib/cache.service.js';

declare module 'fastify' {
  interface FastifyInstance {
    tokenManager: {
      signAccessToken: (payload: any) => Promise<string>;
      signRefreshToken: (payload: any) => Promise<string>;
      verifyToken: (token: string) => Promise<any>;
      validateRefreshToken: (jti: string) => Promise<any>;
      revokeRefreshToken: (jti: string) => Promise<void>;
      rotateRefreshToken: (oldJti: string, payload: any) => Promise<string>;
    };
    cache: CacheService;
    jwt: any; // JWT plugin decoration
    db: any; // Database instance
  }

  interface FastifyRequest {
    user?: {
      userId: string;
      organizationId: string;
      roles: string[];
    };
  }
}
