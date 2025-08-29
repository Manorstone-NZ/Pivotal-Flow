// Validation schemas using Zod

import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain lowercase, uppercase, and number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .optional();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional();

// Pagination schemas
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const paginationResponseSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

// Health check schemas
export const healthCheckSchema = z.object({
  status: z.enum(['ok', 'error']),
  message: z.string().optional(),
  latency: z.number().optional(),
  timestamp: z.string(),
});

export const healthStatusSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  checks: z.object({
    database: healthCheckSchema,
    redis: healthCheckSchema,
    metrics: healthCheckSchema,
  }),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string(),
  requestId: z.string(),
});

export const paginatedApiResponseSchema = apiResponseSchema.extend({
  data: z.array(z.unknown()).optional(),
  pagination: paginationResponseSchema,
});

// Request context schemas
export const requestContextSchema = z.object({
  requestId: z.string(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  ip: z.string(),
  userAgent: z.string(),
  timestamp: z.date(),
});

// Log entry schemas
export const logEntrySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']),
  timestamp: z.string(),
  requestId: z.string(),
  route: z.string().optional(),
  latency: z.number().optional(),
  message: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// Database connection schemas
export const databaseConnectionSchema = z.object({
  host: z.string(),
  port: z.number().int().min(1).max(65535),
  database: z.string(),
  username: z.string(),
  ssl: z.boolean(),
});

// Redis connection schemas
export const redisConnectionSchema = z.object({
  host: z.string(),
  port: z.number().int().min(1).max(65535),
  password: z.string().optional(),
  db: z.number().int().min(0).max(15),
});

// Metrics config schemas
export const metricsConfigSchema = z.object({
  enabled: z.boolean(),
  port: z.number().int().min(1).max(65535),
  path: z.string(),
  collectDefaultMetrics: z.boolean(),
});

// Export types
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PaginatedApiResponse = z.infer<typeof paginatedApiResponseSchema>;
export type RequestContext = z.infer<typeof requestContextSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;
export type RedisConnection = z.infer<typeof redisConnectionSchema>;
export type MetricsConfig = z.infer<typeof metricsConfigSchema>;
