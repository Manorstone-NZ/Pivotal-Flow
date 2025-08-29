import Redis from 'ioredis';

// Global Redis client instance
let redis: Redis | null = null;

/**
 * Redis connection configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string | undefined;
  db: number;
  keyPrefix?: string | undefined;
  maxRetriesPerRequest?: number | undefined;
  lazyConnect?: boolean | undefined;
}

/**
 * Default Redis configuration
 */
export const defaultRedisConfig: RedisConfig = {
  host: process.env['REDIS_HOST'] || 'localhost',
  port: parseInt(process.env['REDIS_PORT'] || '6379'),
  password: undefined,
  db: parseInt(process.env['REDIS_DB'] || '0'),
  keyPrefix: process.env['REDIS_KEY_PREFIX'] || 'pivotal:',
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

/**
 * Get or create the Redis client instance
 * Ensures only one instance exists across the application
 */
export function getRedisClient(config?: Partial<RedisConfig>): Redis {
  if (!redis) {
    const finalConfig = { ...defaultRedisConfig, ...config };
    
    const redisOptions: any = {
      host: finalConfig.host,
      port: finalConfig.port,
      db: finalConfig.db,
      maxRetriesPerRequest: finalConfig.maxRetriesPerRequest,
      lazyConnect: finalConfig.lazyConnect,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Only add optional properties if they have values
    if (finalConfig.password !== undefined) {
      redisOptions.password = finalConfig.password;
    }
    if (finalConfig.keyPrefix !== undefined) {
      redisOptions.keyPrefix = finalConfig.keyPrefix;
    }

    redis = new Redis(redisOptions);

    // Handle connection events
    redis.on('connect', () => {
      console.log('Redis client connected');
    });

    redis.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    redis.on('close', () => {
      console.log('Redis client connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }
  
  return redis;
}

/**
 * Close the Redis client connection
 * Should be called during application shutdown
 */
export async function closeRedisClient(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

/**
 * Test Redis connectivity
 * Returns true if connection is successful, false otherwise
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

/**
 * Get Redis connection info for health checks
 */
export async function getRedisHealth(): Promise<{
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  latency: number;
}> {
  const startTime = Date.now();
  
  try {
    const client = getRedisClient();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
    });
    
    const pingPromise = client.ping();
    
    const result = await Promise.race([pingPromise, timeoutPromise]);
    
    if (result !== 'PONG') {
      throw new Error(`Unexpected Redis response: ${result}`);
    }
    
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'ok',
      message: 'Redis connection successful',
      timestamp,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Redis connection failed',
      timestamp,
      latency,
    };
  }
}

/**
 * Cache utility functions
 */
export const cache = {
  /**
   * Set a key with TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = getRedisClient();
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  },

  /**
   * Get a key value
   */
  async get(key: string): Promise<string | null> {
    const client = getRedisClient();
    return await client.get(key);
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    const client = getRedisClient();
    return await client.del(key);
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * Set key expiration
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.expire(key, seconds);
    return result === 1;
  },
};

// Export Redis types for use in other packages
export { Redis };
