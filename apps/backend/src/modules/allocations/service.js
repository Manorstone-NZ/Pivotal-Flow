import { generateId } from '@pivotal-flow/shared';
import { eq, and, or, gte, lte, isNull, sql } from 'drizzle-orm';
import { AuditLogger } from '../../lib/audit/logger.js';
import { getDatabase } from '../../lib/db.js';
import { resourceAllocations, projects, users } from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';
import { ALLOCATION_PERMISSIONS } from './constants.js';
export class AllocationService {
    organizationId;
    userId;
    db = getDatabase();
    permissionService;
    auditLogger;
    constructor(organizationId, userId, fastify) {
        this.organizationId = organizationId;
        this.userId = userId;
        this.permissionService = new PermissionService(getDatabase(), { organizationId, userId });
        this.auditLogger = new AuditLogger(fastify, { organizationId, userId });
    }
    async createAllocation(data) {
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
        const allocationData = {
            id: generateId(),
            organizationId: this.organizationId,
            projectId: data.projectId,
            userId: data.userId,
            role: data.role,
            allocationPercent: data.allocationPercent.toString(),
            startDate: new Date(data.startDate).toISOString().split('T')[0],
            endDate: new Date(data.endDate).toISOString().split('T')[0],
            isBillable: data.isBillable ?? true,
            notes: data.notes ?? {},
        };
        const allocation = await this.db.insert(resourceAllocations).values(allocationData).returning();
        // Log audit event
        await this.auditLogger.logEvent({
            action: 'allocations.create',
            entityType: 'ResourceAllocation',
            entityId: allocation[0]?.id || '',
            organizationId: this.organizationId,
            userId: this.userId,
            oldValues: null,
            newValues: allocation[0] ?? null
        });
        return allocation[0];
    }
    async updateAllocation(id, data) {
        // Check permissions
        const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.UPDATE);
        if (!hasPermission.hasPermission) {
            throw new Error('User does not have permission to update allocations');
        }
        // Get existing allocation
        const existing = await this.db.select().from(resourceAllocations)
            .where(and(eq(resourceAllocations.id, id), eq(resourceAllocations.organizationId, this.organizationId), isNull(resourceAllocations.deletedAt))).limit(1);
        if (existing.length === 0) {
            throw new Error('Allocation not found');
        }
        // Check for conflicts if dates or allocation percent changed
        if (data.startDate || data.endDate || data.allocationPercent) {
            const startDate = data.startDate ?? existing[0]?.startDate;
            const endDate = data.endDate ?? existing[0]?.endDate;
            const allocationPercent = data.allocationPercent ?? existing[0]?.allocationPercent;
            const conflicts = await this.checkAllocationConflicts(existing[0]?.userId ?? '', startDate ?? existing[0]?.startDate ?? '', endDate ?? existing[0]?.endDate ?? '', Number(allocationPercent), id // Exclude current allocation from conflict check
            );
            if (conflicts.length > 0) {
                throw new Error(`Allocation conflicts detected: ${JSON.stringify(conflicts)}`);
            }
        }
        // Update allocation
        const updateData = {
            updatedAt: new Date()
        };
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.allocationPercent !== undefined)
            updateData.allocationPercent = data.allocationPercent;
        if (data.startDate !== undefined)
            updateData.startDate = data.startDate;
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate;
        if (data.isBillable !== undefined)
            updateData.isBillable = data.isBillable;
        if (data.notes !== undefined)
            updateData.notes = JSON.stringify(data.notes);
        const updated = await this.db.update(resourceAllocations)
            .set(updateData)
            .where(and(eq(resourceAllocations.id, id), eq(resourceAllocations.organizationId, this.organizationId)))
            .returning();
        // Log audit event
        await this.auditLogger.logEvent({
            action: 'allocations.update',
            entityType: 'ResourceAllocation',
            entityId: id,
            organizationId: this.organizationId,
            userId: this.userId,
            oldValues: existing[0] ?? null,
            newValues: updated[0] ?? null
        });
        return updated[0];
    }
    async deleteAllocation(id) {
        // Check permissions
        const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.DELETE);
        if (!hasPermission.hasPermission) {
            throw new Error('User does not have permission to delete allocations');
        }
        // Get existing allocation
        const existing = await this.db.select().from(resourceAllocations)
            .where(and(eq(resourceAllocations.id, id), eq(resourceAllocations.organizationId, this.organizationId), isNull(resourceAllocations.deletedAt))).limit(1);
        if (existing.length === 0) {
            throw new Error('Allocation not found');
        }
        // Soft delete
        await this.db.update(resourceAllocations)
            .set({
            deletedAt: new Date(),
            updatedAt: new Date()
        })
            .where(and(eq(resourceAllocations.id, id), eq(resourceAllocations.organizationId, this.organizationId)));
        // Log audit event
        await this.auditLogger.logEvent({
            action: 'allocations.delete',
            entityType: 'ResourceAllocation',
            entityId: id,
            organizationId: this.organizationId,
            userId: this.userId,
            oldValues: existing[0] ?? null,
            newValues: null
        });
    }
    async getAllocations(filters = {}, page = 1, limit = 20) {
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
            this.db.select({ count: sql `count(*)` })
                .from(resourceAllocations)
                .where(and(...conditions))
        ]);
        return {
            allocations: allocations,
            total: totalResult[0]?.count || 0
        };
    }
    async getAllocation(id) {
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
            .where(and(eq(resourceAllocations.id, id), eq(resourceAllocations.organizationId, this.organizationId), isNull(resourceAllocations.deletedAt)))
            .limit(1);
        if (allocation.length === 0) {
            throw new Error('Allocation not found');
        }
        return allocation[0];
    }
    async getProjectCapacity(projectId, weeks = 8) {
        // Check permissions
        const hasPermission = await this.permissionService.hasPermission(this.userId, ALLOCATION_PERMISSIONS.VIEW_CAPACITY);
        if (!hasPermission.hasPermission) {
            throw new Error('User does not have permission to view capacity');
        }
        // Get project details
        const project = await this.db.select().from(projects)
            .where(and(eq(projects.id, projectId), eq(projects.organizationId, this.organizationId)))
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
            .where(and(eq(resourceAllocations.projectId, projectId), eq(resourceAllocations.organizationId, this.organizationId), isNull(resourceAllocations.deletedAt), or(and(sql `${resourceAllocations.startDate} >= ${startDate.toISOString().split('T')[0]}`, sql `${resourceAllocations.startDate} <= ${endDate.toISOString().split('T')[0]}`), and(sql `${resourceAllocations.endDate} >= ${startDate.toISOString().split('T')[0]}`, sql `${resourceAllocations.endDate} <= ${endDate.toISOString().split('T')[0]}`))));
        // Transform query result to AllocationQueryResult format
        const transformedAllocations = allocations.map(allocation => ({
            id: '', // Not selected in query, but required by interface
            userId: allocation.userId,
            projectId: projectId,
            role: allocation.role,
            allocationPercent: Number(allocation.allocationPercent),
            startDate: new Date(allocation.startDate),
            endDate: new Date(allocation.endDate),
            isBillable: allocation.isBillable,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            userName: allocation.userName,
            projectName: project[0]?.name || null
        }));
        // Group by week and calculate capacity
        const weeklyCapacity = this.calculateWeeklyCapacity(transformedAllocations, startDate, endDate);
        return {
            projectId,
            projectName: project[0]?.name || '',
            weekStart: startDate.toISOString().split('T')[0] || '',
            weekEnd: endDate.toISOString().split('T')[0] || '',
            allocations: weeklyCapacity,
            totalPlannedHours: weeklyCapacity.reduce((sum, cap) => sum + cap.plannedHours, 0),
            totalActualHours: weeklyCapacity.reduce((sum, cap) => sum + cap.actualHours, 0),
            totalPlannedPercent: weeklyCapacity.reduce((sum, cap) => sum + cap.plannedPercent, 0),
            totalActualPercent: weeklyCapacity.reduce((sum, cap) => sum + cap.actualPercent, 0),
            totalVariance: weeklyCapacity.reduce((sum, cap) => sum + cap.variance, 0)
        };
    }
    async checkAllocationConflicts(userId, startDate, endDate, allocationPercent, excludeId) {
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
            .where(and(eq(resourceAllocations.userId, userId), eq(resourceAllocations.organizationId, this.organizationId), isNull(resourceAllocations.deletedAt), or(and(sql `${resourceAllocations.startDate} >= ${startDate}`, sql `${resourceAllocations.startDate} <= ${endDate}`), and(sql `${resourceAllocations.endDate} >= ${startDate}`, sql `${resourceAllocations.endDate} <= ${endDate}`), and(sql `${resourceAllocations.startDate} <= ${startDate}`, sql `${resourceAllocations.endDate} >= ${endDate}`)), ...(excludeId ? [sql `${resourceAllocations.id} != ${excludeId}`] : [])));
        const conflicts = [];
        if (overlapping.length > 0) {
            // Calculate total allocation for overlapping period
            const totalAllocation = overlapping.reduce((sum, alloc) => sum + Number(alloc.allocationPercent), 0) + allocationPercent;
            if (totalAllocation > 100) {
                conflicts.push({
                    userId,
                    userName: '', // Would need to join with users table
                    conflictingAllocations: overlapping.map((alloc) => ({
                        id: alloc.id,
                        projectId: alloc.projectId,
                        projectName: alloc.projectName || '',
                        role: alloc.role,
                        allocationPercent: Number(alloc.allocationPercent),
                        startDate: alloc.startDate.toISOString().split('T')[0],
                        endDate: alloc.endDate.toISOString().split('T')[0],
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
    calculateWeeklyCapacity(allocations, startDate, endDate) {
        const weeklyCapacity = [];
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
//# sourceMappingURL=service.js.map