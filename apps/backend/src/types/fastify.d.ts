import type { FastifyInstance } from 'fastify';
import type { Redis } from 'ioredis';

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
    redis: Redis;
  }
}
