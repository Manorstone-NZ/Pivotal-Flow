/**
 * Idempotency Service for C0 Backend Readiness
 * Supports Idempotency-Key header on create and update routes
 */

import { ConflictError } from '../lib/error-handler.js';
import { createHash } from 'crypto';

// Idempotency key storage interface
interface IdempotencyRecord {
  id: string;
  organizationId: string;
  userId: string;
  route: string;
  method: string;
  requestHash: string;
  responseData: any;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

// Idempotency configuration
export interface IdempotencyConfig {
  ttlHours: number;
  maxKeyLength: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: IdempotencyConfig = {
  ttlHours: 24,
  maxKeyLength: 128,
  enabled: true
};

/**
 * Idempotency Service
 */
export class IdempotencyService {
  private config: IdempotencyConfig;
  private cache: Map<string, IdempotencyRecord>;

  constructor(config: Partial<IdempotencyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Generate request hash for idempotency
   */
  private generateRequestHash(
    method: string,
    route: string,
    body: any,
    query: any = {},
    params: any = {}
  ): string {
    const data = {
      method: method.toUpperCase(),
      route,
      body: body || {},
      query,
      params
    };
    
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Check if idempotency key exists and return cached response
   */
  async checkIdempotency(
    idempotencyKey: string,
    organizationId: string,
    _userId: string,
    method: string,
    route: string,
    body: any,
    query: any = {},
    params: any = {}
  ): Promise<{ exists: boolean; response?: any; statusCode?: number }> {
    if (!this.config.enabled) {
      return { exists: false };
    }

    // Validate idempotency key
    if (!idempotencyKey || idempotencyKey.length > this.config.maxKeyLength) {
      throw new Error(`Invalid idempotency key. Must be 1-${this.config.maxKeyLength} characters.`);
    }

    // Generate request hash
    const requestHash = this.generateRequestHash(method, route, body, query, params);

    try {
      // Check for existing idempotency record in cache
      const cacheKey = `${idempotencyKey}_${organizationId}_${requestHash}`;
      const existingRecord = this.cache.get(cacheKey);

      if (existingRecord && existingRecord.expiresAt > new Date()) {
        // Return cached response
        return {
          exists: true,
          response: existingRecord.responseData,
          statusCode: existingRecord.statusCode
        };
      }

      return { exists: false };
    } catch (error) {
      // If cache error, log and continue
      console.warn('Idempotency check failed:', error);
      return { exists: false };
    }
  }

  /**
   * Store idempotency record with response
   */
  async storeIdempotency(
    idempotencyKey: string,
    organizationId: string,
    _userId: string,
    method: string,
    route: string,
    body: any,
    query: any = {},
    params: any = {},
    response: any,
    statusCode: number
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const requestHash = this.generateRequestHash(method, route, body, query, params);
    const expiresAt = new Date(Date.now() + this.config.ttlHours * 60 * 60 * 1000);

    try {
      // Store idempotency record in cache
      const cacheKey = `${idempotencyKey}_${organizationId}_${requestHash}`;
      const record: IdempotencyRecord = {
        id: cacheKey,
        organizationId,
        userId: _userId,
        route,
        method: method.toUpperCase(),
        requestHash,
        responseData: response,
        statusCode,
        createdAt: new Date(),
        expiresAt
      };
      
      this.cache.set(cacheKey, record);
    } catch (error) {
      // If cache error, log and continue
      console.warn('Idempotency storage failed:', error);
    }
  }

  /**
   * Clean up expired idempotency records
   */
  async cleanupExpiredRecords(): Promise<number> {
    if (!this.config.enabled) {
      return 0;
    }

    try {
      const now = new Date();
      let deletedCount = 0;
      
      for (const [key, record] of this.cache.entries()) {
        if (record.expiresAt < now) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.warn('Idempotency cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get idempotency statistics
   */
  async getStats(_organizationId: string): Promise<{
    totalRecords: number;
    expiredRecords: number;
    activeRecords: number;
  }> {
    if (!this.config.enabled) {
      return { totalRecords: 0, expiredRecords: 0, activeRecords: 0 };
    }

    try {
      const now = new Date();
      let totalRecords = 0;
      let expiredRecords = 0;
      
      for (const record of this.cache.values()) {
        totalRecords++;
        if (record.expiresAt < now) {
          expiredRecords++;
        }
      }
      
      return {
        totalRecords,
        expiredRecords,
        activeRecords: totalRecords - expiredRecords
      };
    } catch (error) {
      console.warn('Idempotency stats failed:', error);
      return { totalRecords: 0, expiredRecords: 0, activeRecords: 0 };
    }
  }
}

/**
 * Idempotency middleware for Fastify
 */
export function createIdempotencyMiddleware(config: Partial<IdempotencyConfig> = {}) {
  const idempotencyService = new IdempotencyService(config);

  return async function idempotencyMiddleware(request: any, reply: any) {
    // Only apply to POST, PUT, PATCH methods
    if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return;
    }

    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey) {
      return;
    }

    const user = (request as any).user;
    if (!user?.org || !user?.sub) {
      return;
    }

    try {
      // Check for existing idempotency record
      const checkResult = await idempotencyService.checkIdempotency(
        idempotencyKey,
        user.org,
        user.sub,
        request.method,
        request.url,
        request.body,
        request.query,
        request.params
      );

      if (checkResult.exists) {
        // Return cached response
        reply.status(checkResult.statusCode || 200).send(checkResult.response);
        return reply;
      }

      // Store original send method
      const originalSend = reply.send.bind(reply);
      let responseSent = false;

      // Override send method to capture response
      reply.send = function(data: any) {
        if (!responseSent) {
          responseSent = true;
          
          // Store idempotency record
          idempotencyService.storeIdempotency(
            idempotencyKey,
            user.org,
            user.sub,
            request.method,
            request.url,
            request.body,
            request.query,
            request.params,
            data,
            reply.statusCode
          );
        }
        
        return originalSend(data);
      };

    } catch (error) {
      if ((error as any).message?.includes('Invalid idempotency key')) {
        throw new ConflictError((error as any).message);
      }
      // Log error but don't fail the request
      console.warn('Idempotency middleware error:', error);
    }
  };
}

/**
 * Idempotency key validation schema
 */
export const IdempotencyKeySchema = {
  type: 'object',
  properties: {
    'idempotency-key': {
      type: 'string',
      minLength: 1,
      maxLength: 128,
      description: 'Idempotency key for safe retries'
    }
  }
};

/**
 * Routes that support idempotency
 */
export const IDEMPOTENCY_ENABLED_ROUTES = [
  'POST /users',
  'PUT /users/:id',
  'POST /quotes',
  'PUT /quotes/:id',
  'POST /projects',
  'PUT /projects/:id',
  'POST /time-entries',
  'PUT /time-entries/:id',
  'POST /payments',
  'PUT /payments/:id',
  'POST /reports/export'
];

/**
 * Check if route supports idempotency
 */
export function isIdempotencyEnabled(method: string, route: string): boolean {
  const routeKey = `${method.toUpperCase()} ${route}`;
  return IDEMPOTENCY_ENABLED_ROUTES.includes(routeKey);
}
