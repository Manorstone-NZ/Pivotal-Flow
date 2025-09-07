/**
 * Environment Configuration Module
 * Centralized environment variable validation and configuration
 */

import { randomBytes } from 'crypto';

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

// Type definitions for configuration
export interface Config {
  server: {
    PORT: number;
    HOST: string;
    CORS_ORIGIN: string;
    LOG_LEVEL: string;
    NODE_ENV: string;
    LOG_CLOUD_SHIPPING: boolean;
  };
  auth: {
    JWT_SECRET: string;
    ACCESS_TOKEN_TTL: string;
    REFRESH_TOKEN_TTL: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    COOKIE_SECRET: string;
    COOKIE_SECURE: boolean;
  };
  redis: {
    REDIS_URL: string;
  };
  db: {
    DATABASE_URL: string;
  };
  files: {
    tokenSecret: string;
  };
  metrics: {
    METRICS_ENABLED: boolean;
    METRICS_PORT: number;
    METRICS_PATH: string;
  };
  rateLimit: {
    RATE_LIMIT_ENABLED: boolean;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_WINDOW: number;
    RATE_LIMIT_UNAUTH_MAX: number;
    RATE_LIMIT_AUTH_MAX: number;
    RATE_LIMIT_ADMIN_MAX: number;
    RATE_LIMIT_LOGIN_MAX: number;
  };
  xero: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    tenantId?: string;
    webhookKey?: string;
  };
}

// Validation helpers
function validatePort(value: string): number {
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    throw new Error(`Invalid port: ${value}. Must be between 1024 and 65535`);
  }
  return port;
}

function validateBoolean(value: string): boolean {
  return value === 'true';
}

function validateCorsOrigin(value: string): string {
  if (value === '*') return value;
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error('CORS_ORIGIN must be a valid URL or wildcard (*)');
  }
  return value;
}

function validateRedisUrl(value: string): string {
  if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
    throw new Error('REDIS_URL must start with redis:// or rediss://');
  }
  return value;
}

function validateDatabaseUrl(value: string): string {
  if (!value.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must start with postgresql://');
  }
  return value;
}

function validateNodeEnv(value: string): string {
  const validEnvs = ['development', 'staging', 'production', 'test'];
  if (!validEnvs.includes(value)) {
    throw new Error(`Invalid NODE_ENV: ${value}. Must be one of: ${validEnvs.join(', ')}`);
  }
  return value;
}

function validateLogLevel(value: string): string {
  const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
  if (!validLevels.includes(value)) {
    throw new Error(`Invalid LOG_LEVEL: ${value}. Must be one of: ${validLevels.join(', ')}`);
  }
  return value;
}

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
    const config: Config = {
      server: {
        PORT: validatePort(env['PORT'] || '3000'),
        HOST: env['HOST'] || '0.0.0.0',
        CORS_ORIGIN: validateCorsOrigin(env['CORS_ORIGIN'] || 'http://localhost:3000'),
        LOG_LEVEL: validateLogLevel(env['LOG_LEVEL'] || 'info'),
        NODE_ENV: validateNodeEnv(nodeEnv),
        LOG_CLOUD_SHIPPING: validateBoolean(env['LOG_CLOUD_SHIPPING'] || 'false'),
      },
      auth: {
        JWT_SECRET: env['JWT_SECRET'] || (nodeEnv === 'development' ? 'dev-secret-key' : ''),
        ACCESS_TOKEN_TTL: env['ACCESS_TOKEN_TTL'] || '15m',
        REFRESH_TOKEN_TTL: env['REFRESH_TOKEN_TTL'] || '7d',
        JWT_ISSUER: env['JWT_ISSUER'] || 'pivotal-flow-auth',
        JWT_AUDIENCE: env['JWT_AUDIENCE'] || 'pivotal-flow-api',
        COOKIE_SECRET: env['COOKIE_SECRET'] || 'pivotal-flow-cookie-secret',
        COOKIE_SECURE: validateBoolean(env['COOKIE_SECURE'] || 'false'),
      },
      redis: {
        REDIS_URL: validateRedisUrl(env['REDIS_URL'] || 'redis://localhost:6379'),
      },
      db: {
        DATABASE_URL: validateDatabaseUrl(env['DATABASE_URL'] || 'postgresql://localhost:5432/pivotal'),
      },
      files: {
        tokenSecret: '', // Will be set below
      },
      metrics: {
        METRICS_ENABLED: validateBoolean(env['METRICS_ENABLED'] || 'false'),
        METRICS_PORT: validatePort(env['METRICS_PORT'] || '9091'),
        METRICS_PATH: env['METRICS_PATH'] || '/metrics',
      },
      rateLimit: {
        RATE_LIMIT_ENABLED: validateBoolean(env['RATE_LIMIT_ENABLED'] || 'true'),
        RATE_LIMIT_MAX: parseInt(env['RATE_LIMIT_MAX'] || '1000', 10),
        RATE_LIMIT_WINDOW: parseInt(env['RATE_LIMIT_WINDOW'] || '900000', 10),
        RATE_LIMIT_UNAUTH_MAX: parseInt(env['RATE_LIMIT_UNAUTH_MAX'] || '1000', 10),
        RATE_LIMIT_AUTH_MAX: parseInt(env['RATE_LIMIT_AUTH_MAX'] || '5000', 10),
        RATE_LIMIT_ADMIN_MAX: parseInt(env['RATE_LIMIT_ADMIN_MAX'] || '10000', 10),
        RATE_LIMIT_LOGIN_MAX: parseInt(env['RATE_LIMIT_LOGIN_MAX'] || '100', 10),
      },
      xero: {
        enabled: false, // Will be set below
        ...(env['XERO_CLIENT_ID'] && { clientId: env['XERO_CLIENT_ID'] }),
        ...(env['XERO_CLIENT_SECRET'] && { clientSecret: env['XERO_CLIENT_SECRET'] }),
        ...(env['XERO_REDIRECT_URI'] && { redirectUri: env['XERO_REDIRECT_URI'] }),
        ...(env['XERO_TENANT_ID'] && { tenantId: env['XERO_TENANT_ID'] }),
        ...(env['XERO_WEBHOOK_KEY'] && { webhookKey: env['XERO_WEBHOOK_KEY'] }),
      },
    };

    // Determine Xero enabled status
    config.xero.enabled = !!(
      config.xero.clientId &&
      config.xero.clientSecret &&
      config.xero.redirectUri &&
      config.xero.tenantId
    );

    // Handle file token secret
    let fileTokenSecret = env['FILE_TOKEN_SECRET'];
    
    if (!fileTokenSecret) {
      if (nodeEnv === 'development') {
        // Generate ephemeral secret for development
        fileTokenSecret = randomBytes(32).toString('hex');
      } else {
        // Required in staging/production
        throw new ConfigError(
          'FILE_TOKEN_SECRET is required in non-development environments',
          ['FILE_TOKEN_SECRET']
        );
      }
    }

    config.files.tokenSecret = fileTokenSecret;

    return Object.freeze(config) as Config;
  } catch (error) {
    if (error instanceof Error) {
      throw new ConfigError(
        `Configuration error: ${error.message}`,
        [],
        { error: error.message }
      );
    }
    throw error;
  }
}