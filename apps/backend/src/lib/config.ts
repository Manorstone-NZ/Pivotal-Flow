import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('localhost'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  
  // Cookies
  COOKIE_SECRET: z.string().min(32, 'Cookie secret must be at least 32 characters'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().int().min(1000).default(15 * 60 * 1000), // 15 minutes
  
  // Rate Limiting Tiers
  RATE_LIMIT_UNAUTH_MAX: z.coerce.number().int().min(1).default(100), // Unauthenticated users
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().min(1).default(1000), // Authenticated users
  RATE_LIMIT_ADMIN_MAX: z.coerce.number().int().min(1).default(5000), // Admin users
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().min(1).default(10), // Login attempts per window
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),
  
  // Metrics
  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_PORT: z.coerce.number().int().min(1).max(65535).default(9090),
  METRICS_PATH: z.string().default('/metrics'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Configuration object
export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    enabled: true, // Always enable Redis for development
  },
  
  auth: {
    jwtSecret: env.JWT_SECRET,
    accessTokenTTL: env.JWT_ACCESS_TTL,
    refreshTokenTTL: env.JWT_REFRESH_TTL,
    cookieSecret: env.COOKIE_SECRET,
    cookieSecure: env.COOKIE_SECURE,
  },
  
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED,
    max: env.RATE_LIMIT_MAX,
    window: env.RATE_LIMIT_WINDOW,
    unauth: env.RATE_LIMIT_UNAUTH_MAX,
    auth: env.RATE_LIMIT_AUTH_MAX,
    admin: env.RATE_LIMIT_ADMIN_MAX,
    login: env.RATE_LIMIT_LOGIN_MAX,
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
  },
  
  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  },
  
  metrics: {
    enabled: env.METRICS_ENABLED,
    port: env.METRICS_PORT,
    path: env.METRICS_PATH,
  },
} as const;

// Type for the config object
export type Config = typeof config;
