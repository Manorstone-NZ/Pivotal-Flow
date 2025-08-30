// Audit repository for append events with non-blocking write pattern

import type { PrismaClient, Prisma } from '@prisma/client';
import { BaseRepository } from './repo.base.js';
import type { BaseRepositoryOptions } from './repo.base.js';
import { withTx, createTxOptions } from './withTx.js';

export interface AuditEventData {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AuditLogFilters {
  action?: string | undefined;
  entityType?: string | undefined;
  entityId?: string | undefined;
  userId?: string | undefined;
  createdFrom?: Date | undefined;
  createdTo?: Date | undefined;
  organizationId?: string | undefined;
}

export interface AuditLogOptions {
  page: number;
  pageSize: number;
  filters: AuditLogFilters;
  sort?: {
    field: 'createdAt' | 'action' | 'entityType';
    direction: 'asc' | 'desc';
  };
}

export class AuditRepository extends BaseRepository {
  constructor(
    prisma: PrismaClient,
    options: BaseRepositoryOptions
  ) {
    super(prisma, options);
  }

  /**
   * Append audit event with non-blocking write pattern
   */
  async appendEvent(eventData: AuditEventData): Promise<void> {
    try {
      // Use non-blocking write pattern - don't wait for completion
      this.appendEventAsync(eventData).catch(error => {
        console.error('Failed to append audit event:', {
          error: error instanceof Error ? error.message : String(error),
          eventData,
          organizationId: this.options.organizationId
        });
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.warn('Failed to queue audit event:', {
        error: error instanceof Error ? error.message : String(error),
        eventData,
        organizationId: this.options.organizationId
      });
    }
  }

  /**
   * Append audit event asynchronously
   */
  private async appendEventAsync(eventData: AuditEventData): Promise<void> {
    try {
      await withTx(this.prisma, createTxOptions({ timeout: 10000 }), async (tx) => {
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: eventData.action,
            entityType: eventData.entityType,
            entityId: eventData.entityId,
            oldValues: eventData.oldValues as any || undefined,
            newValues: eventData.newValues as any || undefined,
            metadata: eventData.metadata as any || undefined
          }
        });
      });
    } catch (error) {
      // If transaction fails, try direct insert as fallback
      try {
        await this.prisma.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: eventData.action,
            entityType: eventData.entityType,
            entityId: eventData.entityId,
                      oldValues: eventData.oldValues as any || undefined,
          newValues: eventData.newValues as any || undefined,
          metadata: eventData.metadata as any || undefined
          }
        });
      } catch (fallbackError) {
        console.error('Audit event fallback insert also failed:', {
          originalError: error instanceof Error ? error.message : String(error),
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          eventData,
          organizationId: this.options.organizationId
        });
      }
    }
  }

  /**
   * Append multiple audit events in a single transaction
   */
  async appendEvents(events: AuditEventData[]): Promise<void> {
    if (events.length === 0) return;

    try {
      await withTx(this.prisma, createTxOptions({ timeout: 15000 }), async (tx) => {
        const auditLogs = events.map(event => ({
          organizationId: this.options.organizationId,
          userId: this.options.userId || 'system',
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          oldValues: event.oldValues as any || undefined,
          newValues: event.newValues as any || undefined,
          metadata: event.metadata as any || undefined
        }));

        await tx.auditLog.createMany({
          data: auditLogs
        });
      });
    } catch (error) {
      // Fallback to individual inserts
      console.warn('Bulk audit insert failed, falling back to individual inserts:', {
        error: error instanceof Error ? error.message : String(error),
        eventCount: events.length,
        organizationId: this.options.organizationId
      });

      for (const event of events) {
        await this.appendEvent(event);
      }
    }
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(options: AuditLogOptions): Promise<{
    items: AuditLogEntry[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const { page, pageSize, filters, sort } = options;
      
      // Validate pagination
      if (page < 1) throw new Error('Page must be at least 1');
      if (pageSize < 1 || pageSize > 100) throw new Error('Page size must be between 1 and 100');

      // Build filters
      const whereClause: Prisma.AuditLogWhereInput = {
        organizationId: this.options.organizationId
      };

      if (filters.action) {
        whereClause.action = filters.action;
      }

      if (filters.entityType) {
        whereClause.entityType = filters.entityType;
      }

      if (filters.entityId) {
        whereClause.entityId = filters.entityId;
      }

      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      if (filters.createdFrom || filters.createdTo) {
        whereClause.createdAt = {};
        
        if (filters.createdFrom) {
          whereClause.createdAt.gte = filters.createdFrom;
        }
        
        if (filters.createdTo) {
          whereClause.createdAt.lte = filters.createdTo;
        }
      }

      // Build sort
      const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
      if (sort) {
        if (sort.field === 'action') {
          orderBy.action = sort.direction;
        } else if (sort.field === 'entityType') {
          orderBy.entityType = sort.direction;
        } else {
          orderBy.createdAt = sort.direction;
        }
      } else {
        orderBy.createdAt = 'desc';
      }

      // Calculate pagination
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      // Execute queries
      const [auditLogs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where: whereClause,
          orderBy,
          skip,
          take,
          select: {
            id: true,
            organizationId: true,
            userId: true,
            action: true,
            entityType: true,
            entityId: true,
            oldValues: true,
            newValues: true,
            metadata: true,
            createdAt: true
          }
        }),
        this.prisma.auditLog.count({
          where: whereClause
        })
      ]);

      // Transform results
      const items: AuditLogEntry[] = auditLogs.map(log => ({
        id: log.id,
        organizationId: log.organizationId,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        oldValues: log.oldValues as Record<string, unknown> | null,
        newValues: log.newValues as Record<string, unknown> | null,
        metadata: log.metadata as Record<string, unknown> | null,
        createdAt: log.createdAt
      }));

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        page,
        pageSize,
        total,
        totalPages
      };
    } catch (error) {
      this.handlePrismaError(error, 'getAuditLogs');
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    options: {
      page?: number;
      pageSize?: number;
      actions?: string[];
    } = {}
  ): Promise<{
    items: AuditLogEntry[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const { page = 1, pageSize = 20, actions } = options;

    const filters: AuditLogFilters = {
      entityType,
      entityId
    };

    if (actions && actions.length > 0) {
      // Get logs for specific actions
      const results = await Promise.all(
        actions.map(action => 
          this.getAuditLogs({
            page,
            pageSize,
            filters: { ...filters, action: action || undefined }
          })
        )
      );

      // Combine and deduplicate results
      const allItems = results.flatMap(result => result.items);
      const uniqueItems = this.deduplicateAuditLogs(allItems);
      
      return {
        items: uniqueItems.slice(0, pageSize),
        page,
        pageSize,
        total: uniqueItems.length,
        totalPages: Math.ceil(uniqueItems.length / pageSize)
      };
    }

    return this.getAuditLogs({
      page,
      pageSize,
      filters
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    options: {
      page?: number;
      pageSize?: number;
      actions?: string[];
      entityTypes?: string[];
    } = {}
  ): Promise<{
    items: AuditLogEntry[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const { page = 1, pageSize = 20, actions, entityTypes } = options;

    const filters: AuditLogFilters = { userId };

    if (actions && actions.length > 0) {
      filters.action = actions[0]; // For now, just use first action
    }

    if (entityTypes && entityTypes.length > 0) {
      filters.entityType = entityTypes[0] || undefined; // For now, just use first entity type
    }

    return this.getAuditLogs({
      page,
      pageSize,
      filters
    });
  }

  /**
   * Get audit summary for an organization
   */
  async getAuditSummary(): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByEntityType: Record<string, number>;
    recentActivity: AuditLogEntry[];
  }> {
    try {
      const [totalEvents, eventsByAction, eventsByEntityType, recentActivity] = await Promise.all([
        // Total events
        this.prisma.auditLog.count({
          where: { organizationId: this.options.organizationId }
        }),

        // Events by action
        this.prisma.auditLog.groupBy({
          by: ['action'],
          where: { organizationId: this.options.organizationId },
          _count: { action: true }
        }),

        // Events by entity type
        this.prisma.auditLog.groupBy({
          by: ['entityType'],
          where: { organizationId: this.options.organizationId },
          _count: { entityType: true }
        }),

        // Recent activity (last 10 events)
        this.prisma.auditLog.findMany({
          where: { organizationId: this.options.organizationId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            organizationId: true,
            userId: true,
            action: true,
            entityType: true,
            entityId: true,
            oldValues: true,
            newValues: true,
            metadata: true,
            createdAt: true
          }
        })
      ]);

      // Transform results
      const actionCounts: Record<string, number> = {};
      eventsByAction.forEach(item => {
        actionCounts[item.action] = item._count.action;
      });

      const entityTypeCounts: Record<string, number> = {};
      eventsByEntityType.forEach(item => {
        entityTypeCounts[item.entityType] = item._count.entityType;
      });

      const recentActivityTransformed: AuditLogEntry[] = recentActivity.map(log => ({
        id: log.id,
        organizationId: log.organizationId,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        oldValues: log.oldValues as Record<string, unknown> | null,
        newValues: log.newValues as Record<string, unknown> | null,
        metadata: log.metadata as Record<string, unknown> | null,
        createdAt: log.createdAt
      }));

      return {
        totalEvents,
        eventsByAction: actionCounts,
        eventsByEntityType: entityTypeCounts,
        recentActivity: recentActivityTransformed
      };
    } catch (error) {
      this.handlePrismaError(error, 'getAuditSummary');
    }
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          organizationId: this.options.organizationId,
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return { deletedCount: result.count };
    } catch (error) {
      this.handlePrismaError(error, 'cleanupOldLogs');
    }
  }

  /**
   * Deduplicate audit logs by ID
   */
  private deduplicateAuditLogs(logs: AuditLogEntry[]): AuditLogEntry[] {
    const seen = new Set<string>();
    return logs.filter(log => {
      if (seen.has(log.id)) {
        return false;
      }
      seen.add(log.id);
      return true;
    });
  }
}
