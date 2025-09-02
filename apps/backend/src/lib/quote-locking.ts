import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import { quotes, userRoles, roles, permissions } from './schema.js';

export interface QuoteLockContext {
  quoteId: string;
  organizationId: string;
  userId: string;
  newData: any;
}

export interface QuoteLockResult {
  isLocked: boolean;
  canForceEdit: boolean;
  requiresVersioning: boolean;
  reason?: string;
}

export class QuoteLockingService {
  constructor(
    private db: PostgresJsDatabase<typeof import('./schema.js')>
  ) {}

  /**
   * Check if a quote is locked and determine edit permissions
   */
  async checkQuoteLock(context: QuoteLockContext): Promise<QuoteLockResult> {
    const quote = await this.db
      .select({
        status: quotes.status,
        organizationId: quotes.organizationId
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.id, context.quoteId),
          eq(quotes.organizationId, context.organizationId)
        )
      )
      .limit(1);

    if (quote.length === 0) {
      return {
        isLocked: false,
        canForceEdit: false,
        requiresVersioning: false,
        reason: 'Quote not found'
      };
    }

    const quoteStatus = quote[0]?.status;
    if (!quoteStatus) {
      return {
        isLocked: false,
        canForceEdit: false,
        requiresVersioning: false,
        reason: 'Quote status not found'
      };
    }
    
    // Check if quote is in a locked state
    const lockedStatuses = ['approved', 'accepted'];
    const isLocked = lockedStatuses.includes(quoteStatus);

    if (!isLocked) {
      return {
        isLocked: false,
        canForceEdit: false,
        requiresVersioning: false
      };
    }

    // Check if user has force_edit permission
    const canForceEdit = await this.hasForceEditPermission(context.userId, context.organizationId);

    if (canForceEdit) {
      return {
        isLocked: true,
        canForceEdit: true,
        requiresVersioning: true,
        reason: `Quote is ${quoteStatus} but user has force_edit permission`
      };
    }

    return {
      isLocked: true,
      canForceEdit: false,
      requiresVersioning: false,
      reason: `Quote is ${quoteStatus} and user lacks force_edit permission`
    };
  }

  /**
   * Check if user has force_edit permission for quotes
   */
  private async hasForceEditPermission(userId: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: permissions.id })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(permissions, eq(roles.id, permissions.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.organizationId, organizationId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true),
          eq(permissions.action, 'force_edit'),
          eq(permissions.resource, 'quotes')
        )
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Validate that the user can edit the quote based on its status
   */
  async validateEditPermission(quoteId: string, organizationId: string, userId: string): Promise<void> {
    const result = await this.checkQuoteLock({
      quoteId,
      organizationId,
      userId,
      newData: {}
    });

    if (result.isLocked && !result.canForceEdit) {
      throw new Error(result.reason ?? 'Quote is locked and cannot be edited');
    }
  }

  /**
   * Determine if a quote edit requires versioning
   */
  async requiresVersioning(quoteId: string, organizationId: string, userId: string): Promise<boolean> {
    const result = await this.checkQuoteLock({
      quoteId,
      organizationId,
      userId,
      newData: {}
    });

    return result.requiresVersioning;
  }
}
