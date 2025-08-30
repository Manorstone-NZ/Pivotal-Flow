// Transaction helper using Prisma $transaction with timeout and retry on serialization error

import { PrismaClient, Prisma } from '@prisma/client';

export interface TransactionOptions {
  timeout?: number; // milliseconds
  maxRetries?: number;
  retryDelay?: number; // milliseconds
}

export interface TransactionContext {
  prisma: PrismaClient;
  organizationId: string;
  userId?: string;
}

export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retries: number,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

/**
 * Execute a function within a database transaction with timeout and retry logic
 */
export async function withTx<T>(
  prisma: PrismaClient,
  options: TransactionOptions,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const {
    timeout = 30000, // 30 seconds default
    maxRetries = 3,
    retryDelay = 1000 // 1 second default
  } = options;

  let lastError: unknown;
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TransactionError(
            `Transaction timed out after ${timeout}ms`,
            'TIMEOUT',
            retries
          ));
        }, timeout);
      });

      // Execute the transaction
      const transactionPromise = prisma.$transaction(fn as any, {
        timeout: timeout - 1000, // Leave 1 second buffer
        maxWait: timeout - 2000, // Leave 2 second buffer for connection
        isolationLevel: 'ReadCommitted' // Default isolation level
      });

      // Race between transaction and timeout
      return await Promise.race([transactionPromise, timeoutPromise]) as T;
    } catch (error) {
      lastError = error;

      // Check if this is a retryable error
      if (isRetryableError(error) && retries < maxRetries) {
        retries++;
        
        // Log retry attempt
        console.warn(`Transaction retry ${retries}/${maxRetries} due to:`, {
          error: error instanceof Error ? error.message : String(error),
          retryDelay,
          operation: 'withTx'
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Not retryable or max retries reached
      break;
    }
  }

  // All retries exhausted or non-retryable error
  throw new TransactionError(
    `Transaction failed after ${retries} retries`,
    'MAX_RETRIES_EXCEEDED',
    retries,
    lastError
  );
}

/**
 * Execute a function within a transaction context (for repository operations)
 */
export async function withTxContext<T>(
  context: TransactionContext,
  options: TransactionOptions,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return withTx(context.prisma, options, fn);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Retry on serialization failures and deadlocks
    return ['P2034', 'P2035', 'P2036', 'P2037'].includes(error.code);
  }

  // Retry on connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  // Retry on Prisma client errors that might be transient
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return true;
  }

  return false;
}

/**
 * Execute multiple operations in a single transaction
 */
export async function withMultiTx<T>(
  prisma: PrismaClient,
  options: TransactionOptions,
  operations: Array<(tx: PrismaClient) => Promise<unknown>>
): Promise<T[]> {
  return withTx(prisma, options, async (tx) => {
    const results: unknown[] = [];
    
    for (const operation of operations) {
      const result = await operation(tx);
      results.push(result);
    }
    
    return results as T[];
  });
}

/**
 * Execute a transaction with rollback on error
 */
export async function withTxRollback<T>(
  prisma: PrismaClient,
  options: TransactionOptions,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await withTx(prisma, options, fn);
  } catch (error) {
    // Log the error for debugging
    console.error('Transaction failed, rolling back:', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'withTxRollback'
    });
    
    throw error;
  }
}

/**
 * Utility for creating transaction options
 */
export function createTxOptions(options: Partial<TransactionOptions> = {}): TransactionOptions {
  return {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    ...options
  };
}

/**
 * Example usage patterns for multi-step updates
 */
export const TransactionPatterns = {
  /**
   * Pattern: Update user and create audit log atomically
   */
  async updateUserWithAudit(
    prisma: PrismaClient,
    organizationId: string,
    userId: string,
    updates: Record<string, unknown>,
    auditData: Record<string, unknown>
  ) {
    return withTx(prisma, createTxOptions(), async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId, organizationId },
        data: updates,
        select: { id: true, email: true, displayName: true, status: true }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'users.update',
          entityType: 'User',
          entityId: userId,
          newValues: updates as any,
          metadata: auditData as any
        }
      });

      return updatedUser;
    });
  },

  /**
   * Pattern: Assign role and update audit atomically
   */
  async assignRoleWithAudit(
    prisma: PrismaClient,
    organizationId: string,
    userId: string,
    roleId: string,
    assignedBy: string
  ) {
    return withTx(prisma, createTxOptions(), async (tx) => {
      // Check if role exists
      const role = await tx.role.findFirst({
        where: { id: roleId, organizationId, isActive: true }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      // Assign role (idempotent)
      await tx.userRole.upsert({
        where: {
          userId_roleId_organizationId: { userId, roleId, organizationId }
        },
        update: { isActive: true, assignedBy, assignedAt: new Date() },
        create: {
          userId,
          roleId,
          organizationId,
          assignedBy,
          assignedAt: new Date()
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          organizationId,
          userId: assignedBy,
          action: 'users.role_added',
          entityType: 'User',
          entityId: userId,
          newValues: { roleId },
          metadata: { assignedBy, roleName: role.name }
        }
      });

      return { success: true, roleName: role.name };
    });
  }
};
