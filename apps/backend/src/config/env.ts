/**
 * Environment Configuration Module
 * Centralized environment variable validation and configuration
 */

import { randomBytes } from 'crypto';

import { z } from 'zod';

// Custom error for configuration issues
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly missingKeys: string[] = [],
    public readonly invalidValues: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

// Environment validation schemas
const NodeEnvSchema = z.enum(['development', 'staging', 'production', 'test']);

const ServerConfigSchema = z.object({
  PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1024).max(65535)),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().refine(
    (val) => {
      if (val === '*') return true;
      return val.startsWith('http://') || val.startsWith('https://');
    },
    { message: 'CORS_ORIGIN must be a valid URL or wildcard (*)' }
  ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: NodeEnvSchema,
  LOG_CLOUD_SHIPPING: z.string().transform(val => val === 'true').default('false'),
});

const AuthConfigSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET must not be empty'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  JWT_ISSUER: z.string().default('pivotal-flow-auth'),
  JWT_AUDIENCE: z.string().default('pivotal-flow-api'),
  COOKIE_SECRET: z.string().default('pivotal-flow-cookie-secret'),
  COOKIE_SECURE: z.string().transform(val => val === 'true').default('false'),
});

const RedisConfigSchema = z.object({
  REDIS_URL: z.string().refine(
    (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
    { message: 'REDIS_URL must start with redis:// or rediss://' }
  ),
});

const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().refine(
    (val) => val.startsWith('postgresql://'),
    { message: 'DATABASE_URL must start with postgresql://' }
  ),
});

const FilesConfigSchema = z.object({
  FILE_TOKEN_SECRET: z.string().optional(),
});

const MetricsConfigSchema = z.object({
  METRICS_ENABLED: z.string().transform(val => val === 'true').default('false'),
  METRICS_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1024).max(65535)).default('9091'),
  METRICS_PATH: z.string().default('/metrics'),
});

const RateLimitConfigSchema = z.object({
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('true'),
  RATE_LIMIT_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('1000'),
  RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1000)).default('900000'),
  RATE_LIMIT_UNAUTH_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('1000'),
  RATE_LIMIT_AUTH_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('5000'),
  RATE_LIMIT_ADMIN_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('10000'),
  RATE_LIMIT_LOGIN_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('100'),
});

const XeroConfigSchema = z.object({
  XERO_CLIENT_ID: z.string().optional(),
  XERO_CLIENT_SECRET: z.string().optional(),
  XERO_REDIRECT_URI: z.string().optional(),
  XERO_TENANT_ID: z.string().optional(),
  XERO_WEBHOOK_KEY: z.string().optional(),
});

// Main configuration schema
const ConfigSchema = z.object({
  server: ServerConfigSchema,
  auth: AuthConfigSchema,
  redis: RedisConfigSchema,
  db: DatabaseConfigSchema,
  files: FilesConfigSchema,
  metrics: MetricsConfigSchema,
  rateLimit: RateLimitConfigSchema,
  xero: XeroConfigSchema,
});

export type Config = z.infer<typeof ConfigSchema> & {
  xero: {
    enabled: boolean;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    redirectUri?: string | undefined;
    tenantId?: string | undefined;
    webhookKey?: string | undefined;
  };
  files: {
    tokenSecret: string;
  };
};

/**
 * Load and validate environment configuration
 */
export function loadConfig(): Config {
  const env = process.env;
  const nodeEnv = env['NODE_ENV'] || 'development';
  
  // Check for missing required fields in non-development environments
  if (nodeEnv !== 'development') {
    const requiredFields = [
      'PORT', 'HOST', 'CORS_ORIGIN', 'LOG_LEVEL', 'NODE_ENV',
      'JWT_SECRET', 'ACCESS_TOKEN_TTL', 'REFRESH_TOKEN_TTL',
      'REDIS_URL', 'DATABASE_URL'
    ];
    
    const missingKeys = requiredFields.filter(key => !env[key]);
    
    if (missingKeys.length > 0) {
      throw new ConfigError(
        `Missing required environment variables in ${nodeEnv} environment`,
        missingKeys
      );
    }
  }

  // Validate CORS_ORIGIN for non-development environments
  if (nodeEnv !== 'development' && env['CORS_ORIGIN'] === '*') {
    throw new ConfigError(
      'CORS_ORIGIN cannot be wildcard (*) in non-development environments'
    );
  }

  try {
    const rawConfig = {
      server: {
        PORT: env['PORT'] || '3000',
        HOST: env['HOST'],
        CORS_ORIGIN: env['CORS_ORIGIN'],
        LOG_LEVEL: env['LOG_LEVEL'],
        NODE_ENV: nodeEnv,
        LOG_CLOUD_SHIPPING: env['LOG_CLOUD_SHIPPING'],
      },
      auth: {
        JWT_SECRET: env['JWT_SECRET'],
        ACCESS_TOKEN_TTL: env['ACCESS_TOKEN_TTL'],
        REFRESH_TOKEN_TTL: env['REFRESH_TOKEN_TTL'],
        JWT_ISSUER: env['JWT_ISSUER'],
        JWT_AUDIENCE: env['JWT_AUDIENCE'],
        COOKIE_SECRET: env['COOKIE_SECRET'],
        COOKIE_SECURE: env['COOKIE_SECURE'],
      },
      redis: {
        REDIS_URL: env['REDIS_URL'],
      },
      db: {
        DATABASE_URL: env['DATABASE_URL'],
      },
      files: {
        FILE_TOKEN_SECRET: env['FILE_TOKEN_SECRET'],
      },
      metrics: {
        METRICS_ENABLED: env['METRICS_ENABLED'],
        METRICS_PORT: env['METRICS_PORT'],
        METRICS_PATH: env['METRICS_PATH'],
      },
      rateLimit: {
        RATE_LIMIT_ENABLED: env['RATE_LIMIT_ENABLED'],
        RATE_LIMIT_MAX: env['RATE_LIMIT_MAX'],
        RATE_LIMIT_WINDOW: env['RATE_LIMIT_WINDOW'],
        RATE_LIMIT_UNAUTH_MAX: env['RATE_LIMIT_UNAUTH_MAX'],
        RATE_LIMIT_AUTH_MAX: env['RATE_LIMIT_AUTH_MAX'],
        RATE_LIMIT_ADMIN_MAX: env['RATE_LIMIT_ADMIN_MAX'],
        RATE_LIMIT_LOGIN_MAX: env['RATE_LIMIT_LOGIN_MAX'],
      },
      xero: {
        XERO_CLIENT_ID: env['XERO_CLIENT_ID'],
        XERO_CLIENT_SECRET: env['XERO_CLIENT_SECRET'],
        XERO_REDIRECT_URI: env['XERO_REDIRECT_URI'],
        XERO_TENANT_ID: env['XERO_TENANT_ID'],
        XERO_WEBHOOK_KEY: env['XERO_WEBHOOK_KEY'],
      },
    };

    const validatedConfig = ConfigSchema.parse(rawConfig);

    // Determine Xero enabled status
    const xeroEnabled = !!(
      validatedConfig.xero.XERO_CLIENT_ID &&
      validatedConfig.xero.XERO_CLIENT_SECRET &&
      validatedConfig.xero.XERO_REDIRECT_URI &&
      validatedConfig.xero.XERO_TENANT_ID
    );

    // Handle file token secret
    let fileTokenSecret = validatedConfig.files.FILE_TOKEN_SECRET;
    
    if (!fileTokenSecret) {
      if (nodeEnv === 'development') {
        // Generate ephemeral secret for development
        fileTokenSecret = randomBytes(32).toString('hex');
        // Log warning about ephemeral secret (will be logged by caller)
      } else {
        // Required in staging/production
        throw new ConfigError(
          'FILE_TOKEN_SECRET is required in non-development environments',
          ['FILE_TOKEN_SECRET']
        );
      }
    }

    const config: Config = {
      ...validatedConfig,
      xero: {
        enabled: xeroEnabled,
        clientId: validatedConfig.xero.XERO_CLIENT_ID || undefined,
        clientSecret: validatedConfig.xero.XERO_CLIENT_SECRET || undefined,
        redirectUri: validatedConfig.xero.XERO_REDIRECT_URI || undefined,
        tenantId: validatedConfig.xero.XERO_TENANT_ID || undefined,
        webhookKey: validatedConfig.xero.XERO_WEBHOOK_KEY || undefined,
      },
      files: {
        tokenSecret: fileTokenSecret,
      },
    };

    return Object.freeze(config) as Config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const invalidValues: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          invalidValues[err.path.join('.')] = err.message;
        }
      });
      throw new ConfigError(
        'Invalid environment variable values',
        [],
        invalidValues
      );
    }
    throw error;
  }
}
