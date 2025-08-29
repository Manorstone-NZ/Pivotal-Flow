// Application constants

export const APP_NAME = 'Pivotal Flow';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Business Management Platform';

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Environment
export const NODE_ENV = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// Log Levels
export const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// Database
export const DATABASE = {
  DEFAULT_PORT: 5432,
  DEFAULT_HOST: 'localhost',
  DEFAULT_DATABASE: 'pivotal',
  DEFAULT_USER: 'pivotal',
  CONNECTION_TIMEOUT: 30000,
  IDLE_TIMEOUT: 10000,
  MAX_CONNECTIONS: 20,
} as const;

// Redis
export const REDIS = {
  DEFAULT_PORT: 6379,
  DEFAULT_HOST: 'localhost',
  DEFAULT_DB: 0,
  CONNECTION_TIMEOUT: 10000,
  KEY_PREFIX: 'pivotal:',
  SESSION_TTL: 86400, // 24 hours
  CACHE_TTL: 3600, // 1 hour
} as const;

// Metrics
export const METRICS = {
  DEFAULT_PORT: 9090,
  DEFAULT_PATH: '/metrics',
  COLLECT_INTERVAL: 15000, // 15 seconds
} as const;

// API
export const API = {
  DEFAULT_PORT: 3000,
  DEFAULT_HOST: 'localhost',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window
  REQUEST_TIMEOUT: 30000, // 30 seconds
  CORS_ORIGIN: ['http://localhost:3000', 'http://localhost:3001'],
} as const;

// Security
export const SECURITY = {
  JWT_EXPIRES_IN: '8h',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_SECRET_LENGTH: 32,
  RATE_LIMIT_ENABLED: true,
} as const;
