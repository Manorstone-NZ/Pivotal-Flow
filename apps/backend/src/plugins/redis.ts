/**
 * Redis Plugin for Auth Hardening
 * Provides Redis client for opaque session storage
 */

import fp from "fastify-plugin";
import { createClient } from "redis";
import { logger } from "../lib/logger.js";

declare module "fastify" {
  interface FastifyInstance { 
    cache: ReturnType<typeof createClient>;
  }
}

export default fp(async (fastify) => {
  const redisUrl = process.env.AUTH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
  
  logger.info({ redisUrl: redisUrl.replace(/\/\/.*@/, '//***@') }, 'Connecting to Redis for auth sessions');
  
  const client = createClient({ url: redisUrl });
  
  // Handle Redis connection events
  client.on('error', (err) => {
    logger.error({ err }, 'Redis client error');
  });
  
  client.on('connect', () => {
    logger.info('Redis client connected for auth sessions');
  });
  
  client.on('ready', () => {
    logger.info('Redis client ready for auth sessions');
  });
  
  client.on('end', () => {
    logger.info('Redis client disconnected');
  });
  
  // Connect to Redis
  await client.connect();
  
  // Test Redis connection
  const pingResult = await client.ping();
  if (pingResult !== 'PONG') {
    throw new Error('Redis ping failed');
  }
  
  // Decorate fastify with Redis client
  fastify.decorate("cache", client);
  
  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    logger.info('Disconnecting Redis client...');
    await client.quit();
    logger.info('Redis client disconnected');
  });
  
  logger.info('Redis plugin registered successfully for auth hardening');
}, {
  name: 'redis-auth',
  dependencies: []
});
