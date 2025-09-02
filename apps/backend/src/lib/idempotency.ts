import { randomUUID, createHash } from 'crypto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, lt } from 'drizzle-orm';
import { idempotencyKeys } from './schema.js';

export interface IdempotencyContext {
  organizationId: string;
  userId: string;
  route: string;
  requestHash: string;
}

export interface IdempotencyResult {
  isDuplicate: boolean;
  responseStatus?: number;
  responseBody?: any;
}

export class IdempotencyService {
  constructor(
    private db: PostgresJsDatabase<typeof import('./schema.js')>,
    private ttlHours: number = 24
  ) {}

  /**
   * Generate a hash for the request body and headers
   */
  generateRequestHash(body: any, headers: Record<string, string>): string {
    const relevantHeaders = {
      'content-type': headers['content-type'],
      'accept': headers['accept'],
      // Add other relevant headers as needed
    };
    
    const data = {
      body,
      headers: relevantHeaders
    };
    
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Check if a request is a duplicate and return cached response if so
   */
  async checkIdempotency(context: IdempotencyContext): Promise<IdempotencyResult> {
    const existing = await this.db
      .select({
        responseStatus: idempotencyKeys.responseStatus,
        responseBody: idempotencyKeys.responseBody,
        expiresAt: idempotencyKeys.expiresAt
      })
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.organizationId, context.organizationId),
          eq(idempotencyKeys.userId, context.userId),
          eq(idempotencyKeys.route, context.route),
          eq(idempotencyKeys.requestHash, context.requestHash),
          lt(idempotencyKeys.expiresAt, new Date())
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      if (record) {
        return {
          isDuplicate: true,
          responseStatus: record.responseStatus,
          responseBody: record.responseBody
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Store the response for future idempotency checks
   */
  async storeResponse(
    context: IdempotencyContext,
    responseStatus: number,
    responseBody: any
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.ttlHours);

    await this.db
      .insert(idempotencyKeys)
      .values({
        id: randomUUID(),
        organizationId: context.organizationId,
        userId: context.userId,
        route: context.route,
        requestHash: context.requestHash,
        responseStatus,
        responseBody,
        createdAt: new Date(),
        expiresAt
      });
  }

  /**
   * Clean up expired idempotency keys
   */
  async cleanupExpired(): Promise<number> {
    await this.db
      .delete(idempotencyKeys)
      .where(lt(idempotencyKeys.expiresAt, new Date()));
    
    return 0; // Drizzle doesn't return rowCount, return 0 for now
  }
}
