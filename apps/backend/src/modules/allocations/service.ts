import { eq, and, or, gte, lte, isNull, sql } from 'drizzle-orm';
import { getDatabase } from '../../lib/db.js';
import { resourceAllocations, projects, users } from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../../lib/audit/logger.js';
import { generateId } from '@pivotal-flow/shared';
import { ALLOCATION_PERMISSIONS } from './constants.js';
import type { 
  CreateAllocationRequest, 
  UpdateAllocationRequest, 
  AllocationFilters,
  WeeklyCapacitySummary,
  AllocationConflict 
} from './types.js';
import type { FastifyInstance } from 'fastify';

export class AllocationService {
  private db = getDatabase();
  private permissionService: PermissionService;
  private auditLogger: AuditLogger;

  constructor(
    private organizationId: string,
    private userId: string,
    fastify: FastifyInstance
  ) {
    this.permissionService = new PermissionService(getDatabase(), { organizationId, userId });
    this.auditLogger = new AuditLogger(fastify, { organizationId, userId });
  }

  async createAllocation(data: CreateAllocationRequest): Promise<any> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.CREATE);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to create allocations');
    }

    // Check for conflicts
    const conflicts = await this.checkAllocationConflicts(data.userId, data.startDate, data.endDate, data.allocationPercent);
    if (conflicts.length > 0) {
      throw new Error(`Allocation conflicts detected: ${JSON.stringify(conflicts)}`);
    }

    // Create allocation
    const allocation = await this.db.insert(resourceAllocations).values({
      id: generateId(),
      organizationId: this.organizationId,
      projectId: data.projectId,
      userId: data.userId,
      role: data.role,
      allocationPercent: data.allocationPercent,
      startDate: data.startDate,
      endDate: data.endDate,
      isBillable: data.isBillable ?? true,
      notes: data.notes ?? {}
    }).returning();

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'allocations.create',
      entityType: 'ResourceAllocation',
      entityId: allocation[0].id,
      organizationId: this.organizationId,
      userId: this.userId,
      oldValues: null,
      newValues: allocation[0]
    });

    return allocation[0];
  }

  async updateAllocation(id: string, data: UpdateAllocationRequest): Promise<any> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.UPDATE);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to update allocations');
    }

    // Get existing allocation
    const existing = await this.db.select().from(resourceAllocations)
      .where(and(
        eq(resourceAllocations.id, id),
        eq(resourceAllocations.organizationId, this.organizationId),
        isNull(resourceAllocations.deletedAt)
      )).limit(1);

    if (existing.length === 0) {
      throw new Error('Allocation not found');
    }

    // Check for conflicts if dates or allocation percent changed
    if (data.startDate || data.endDate || data.allocationPercent) {
      const startDate = data.startDate ?? existing[0].startDate;
      const endDate = data.endDate ?? existing[0].endDate;
      const allocationPercent = data.allocationPercent ?? existing[0].allocationPercent;
      
      const conflicts = await this.checkAllocationConflicts(
        existing[0].userId, 
        startDate, 
        endDate, 
        allocationPercent,
        id // Exclude current allocation from conflict check
      );
      
      if (conflicts.length > 0) {
        throw new Error(`Allocation conflicts detected: ${JSON.stringify(conflicts)}`);
      }
    }

    // Update allocation
    const updated = await this.db.update(resourceAllocations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(
        eq(resourceAllocations.id, id),
        eq(resourceAllocations.organizationId, this.organizationId)
      ))
      .returning();

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'allocations.update',
      entityType: 'ResourceAllocation',
      entityId: id,
      organizationId: this.organizationId,
      userId: this.userId,
      oldValues: existing[0],
      newValues: updated[0]
    });

    return updated[0];
  }

  async deleteAllocation(id: string): Promise<void> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.DELETE);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to delete allocations');
    }

    // Get existing allocation
    const existing = await this.db.select().from(resourceAllocations)
      .where(and(
        eq(resourceAllocations.id, id),
        eq(resourceAllocations.organizationId, this.organizationId),
        isNull(resourceAllocations.deletedAt)
      )).limit(1);

    if (existing.length === 0) {
      throw new Error('Allocation not found');
    }

    // Soft delete
    await this.db.update(resourceAllocations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(resourceAllocations.id, id),
        eq(resourceAllocations.organizationId, this.organizationId)
      ));

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'allocations.delete',
      entityType: 'ResourceAllocation',
      entityId: id,
      organizationId: this.organizationId,
      userId: this.userId,
      oldValues: existing[0],
      newValues: null
    });
  }

  async getAllocations(filters: AllocationFilters = {}, page = 1, limit = 20): Promise<{ allocations: any[]; total: number }> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.READ);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to view allocations');
    }

    const conditions = [
      eq(resourceAllocations.organizationId, this.organizationId),
      isNull(resourceAllocations.deletedAt)
    ];

    if (filters.projectId) {
      conditions.push(eq(resourceAllocations.projectId, filters.projectId));
    }
    if (filters.userId) {
      conditions.push(eq(resourceAllocations.userId, filters.userId));
    }
    if (filters.role) {
      conditions.push(eq(resourceAllocations.role, filters.role));
    }
    if (filters.startDate) {
      conditions.push(gte(resourceAllocations.startDate, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(resourceAllocations.endDate, filters.endDate));
    }
    if (filters.isBillable !== undefined) {
      conditions.push(eq(resourceAllocations.isBillable, filters.isBillable));
    }

    const offset = (page - 1) * limit;

    const [allocations, totalResult] = await Promise.all([
      this.db.select({
        id: resourceAllocations.id,
        organizationId: resourceAllocations.organizationId,
        projectId: resourceAllocations.projectId,
        userId: resourceAllocations.userId,
        role: resourceAllocations.role,
        allocationPercent: resourceAllocations.allocationPercent,
        startDate: resourceAllocations.startDate,
        endDate: resourceAllocations.endDate,
        isBillable: resourceAllocations.isBillable,
        notes: resourceAllocations.notes,
        createdAt: resourceAllocations.createdAt,
        updatedAt: resourceAllocations.updatedAt,
        deletedAt: resourceAllocations.deletedAt,
        projectName: projects.name,
        userName: users.displayName
      })
      .from(resourceAllocations)
      .leftJoin(projects, eq(resourceAllocations.projectId, projects.id))
      .leftJoin(users, eq(resourceAllocations.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(resourceAllocations.createdAt),

      this.db.select({ count: sql<number>`count(*)` })
        .from(resourceAllocations)
        .where(and(...conditions))
    ]);

    return {
      allocations,
      total: totalResult[0].count
    };
  }

  async getAllocation(id: string): Promise<any> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.READ);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to view allocations');
    }

    const allocation = await this.db.select({
      id: resourceAllocations.id,
      organizationId: resourceAllocations.organizationId,
      projectId: resourceAllocations.projectId,
      userId: resourceAllocations.userId,
      role: resourceAllocations.role,
      allocationPercent: resourceAllocations.allocationPercent,
      startDate: resourceAllocations.startDate,
      endDate: resourceAllocations.endDate,
      isBillable: resourceAllocations.isBillable,
      notes: resourceAllocations.notes,
      createdAt: resourceAllocations.createdAt,
      updatedAt: resourceAllocations.updatedAt,
      deletedAt: resourceAllocations.deletedAt,
      projectName: projects.name,
      userName: users.displayName
    })
    .from(resourceAllocations)
    .leftJoin(projects, eq(resourceAllocations.projectId, projects.id))
    .leftJoin(users, eq(resourceAllocations.userId, users.id))
    .where(and(
      eq(resourceAllocations.id, id),
      eq(resourceAllocations.organizationId, this.organizationId),
      isNull(resourceAllocations.deletedAt)
    ))
    .limit(1);

    if (allocation.length === 0) {
      throw new Error('Allocation not found');
    }

    return allocation[0];
  }

  async getProjectCapacity(projectId: string, weeks = 8): Promise<WeeklyCapacitySummary> {
    // Check permissions
    const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.VIEW_CAPACITY);
    if (!hasPermission.hasPermission) {
      throw new Error('User does not have permission to view capacity');
    }

    // Get project details
    const project = await this.db.select().from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.organizationId, this.organizationId)
      ))
      .limit(1);

    if (project.length === 0) {
      throw new Error('Project not found');
    }

    // Calculate date range for the last N weeks
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    // Get allocations for the project
    const allocations = await this.db.select({
      userId: resourceAllocations.userId,
      userName: users.displayName,
      role: resourceAllocations.role,
      allocationPercent: resourceAllocations.allocationPercent,
      startDate: resourceAllocations.startDate,
      endDate: resourceAllocations.endDate,
      isBillable: resourceAllocations.isBillable
    })
    .from(resourceAllocations)
    .leftJoin(users, eq(resourceAllocations.userId, users.id))
    .where(and(
      eq(resourceAllocations.projectId, projectId),
      eq(resourceAllocations.organizationId, this.organizationId),
      isNull(resourceAllocations.deletedAt),
      or(
        and(
          sql`${resourceAllocations.startDate} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${resourceAllocations.startDate} <= ${endDate.toISOString().split('T')[0]}`
        ),
        and(
          sql`${resourceAllocations.endDate} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${resourceAllocations.endDate} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
    ));

    // Group by week and calculate capacity
    const weeklyCapacity = this.calculateWeeklyCapacity(allocations, startDate, endDate);

    return {
      projectId,
      projectName: project[0]?.name || '',
      weekStart: startDate.toISOString().split('T')[0] || '',
      weekEnd: endDate.toISOString().split('T')[0] || '',
      allocations: weeklyCapacity,
      totalPlannedHours: weeklyCapacity.reduce((sum: number, cap: any) => sum + cap.plannedHours, 0),
      totalActualHours: weeklyCapacity.reduce((sum: number, cap: any) => sum + cap.actualHours, 0),
      totalPlannedPercent: weeklyCapacity.reduce((sum: number, cap: any) => sum + cap.plannedPercent, 0),
      totalActualPercent: weeklyCapacity.reduce((sum: number, cap: any) => sum + cap.actualPercent, 0),
      totalVariance: weeklyCapacity.reduce((sum: number, cap: any) => sum + cap.variance, 0)
    };
  }

  private async checkAllocationConflicts(
    userId: string, 
    startDate: string, 
    endDate: string, 
    allocationPercent: number,
    excludeId?: string
  ): Promise<AllocationConflict[]> {
    const startTime = Date.now();

    // Get overlapping allocations
    const overlapping = await this.db.select({
      id: resourceAllocations.id,
      projectId: resourceAllocations.projectId,
      role: resourceAllocations.role,
      allocationPercent: resourceAllocations.allocationPercent,
      startDate: resourceAllocations.startDate,
      endDate: resourceAllocations.endDate,
      projectName: projects.name
    })
    .from(resourceAllocations)
    .leftJoin(projects, eq(resourceAllocations.projectId, projects.id))
    .where(and(
      eq(resourceAllocations.userId, userId),
      eq(resourceAllocations.organizationId, this.organizationId),
      isNull(resourceAllocations.deletedAt),
      or(
        and(
          sql`${resourceAllocations.startDate} >= ${startDate}`,
          sql`${resourceAllocations.startDate} <= ${endDate}`
        ),
        and(
          sql`${resourceAllocations.endDate} >= ${startDate}`,
          sql`${resourceAllocations.endDate} <= ${endDate}`
        ),
        and(
          sql`${resourceAllocations.startDate} <= ${startDate}`,
          sql`${resourceAllocations.endDate} >= ${endDate}`
        )
      ),
      ...(excludeId ? [sql`${resourceAllocations.id} != ${excludeId}`] : [])
    ));

    const conflicts: AllocationConflict[] = [];

    if (overlapping.length > 0) {
      // Calculate total allocation for overlapping period
      const totalAllocation = overlapping.reduce((sum: number, alloc: any) => sum + Number(alloc.allocationPercent), 0) + allocationPercent;

      if (totalAllocation > 100) {
        conflicts.push({
          userId,
          userName: '', // Would need to join with users table
          conflictingAllocations: overlapping.map((alloc: any) => ({
            id: alloc.id,
            projectId: alloc.projectId,
            projectName: alloc.projectName || '',
            role: alloc.role,
            allocationPercent: Number(alloc.allocationPercent),
            startDate: alloc.startDate,
            endDate: alloc.endDate,
            overlapStart: startDate,
            overlapEnd: endDate,
            totalAllocation: totalAllocation
          })),
          totalAllocation,
          requestedAllocation: allocationPercent,
          conflictType: 'exceeds_100_percent'
        });
      }
    }

    // Log performance metric
    const duration = Date.now() - startTime;
    console.log(`Allocation conflict check took ${duration}ms`);

    return conflicts;
  }

  private calculateWeeklyCapacity(allocations: any[], startDate: Date, endDate: Date): any[] {
    const weeklyCapacity: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekAllocations = allocations.filter(alloc => {
        const allocStart = new Date(alloc.startDate);
        const allocEnd = new Date(alloc.endDate);
        return allocStart <= weekEnd && allocEnd >= weekStart;
      });

      // Group by user
      const userCapacity = new Map();
      weekAllocations.forEach(alloc => {
        if (!userCapacity.has(alloc.userId)) {
          userCapacity.set(alloc.userId, {
            userId: alloc.userId,
            userName: alloc.userName,
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            plannedHours: 0,
            actualHours: 0,
            plannedPercent: 0,
            actualPercent: 0,
            variance: 0
          });
        }

        const user = userCapacity.get(alloc.userId);
        user.plannedPercent += Number(alloc.allocationPercent);
        user.plannedHours += (Number(alloc.allocationPercent) / 100) * 40; // Assuming 40-hour week
      });

      weeklyCapacity.push(...Array.from(userCapacity.values()));
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeklyCapacity;
  }
}
