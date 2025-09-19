import { eq, and, desc, asc, like, sql, isNull } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { projects, users, serviceCategories } from '../../lib/schema.js';
export class ProjectService {
    context;
    auditLogger;
    constructor(context, auditLogger) {
        this.context = context;
        this.auditLogger = auditLogger;
    }
    async listProjects(filters) {
        try {
            const db = getDatabase();
            const page = filters?.page || 1;
            const pageSize = filters?.size || 25;
            const offset = (page - 1) * pageSize;
            // Build where conditions
            const whereConditions = [
                eq(projects.organizationId, this.context.organizationId),
                isNull(projects.deletedAt)
            ];
            if (filters?.status) {
                whereConditions.push(eq(projects.status, filters.status));
            }
            if (filters?.ownerId) {
                whereConditions.push(eq(projects.ownerId, filters.ownerId));
            }
            if (filters?.search) {
                whereConditions.push(sql `(${projects.name} ILIKE ${`%${filters.search}%`} OR ${projects.code} ILIKE ${`%${filters.search}%`})`);
            }
            // Build order by
            const sortField = filters?.sort || 'createdAt';
            const sortOrder = filters?.sortOrder || 'desc';
            // Map sort field to actual column
            const sortColumnMap = {
                'createdAt': projects.createdAt,
                'updatedAt': projects.updatedAt,
                'name': projects.name,
                'status': projects.status,
                'startDate': projects.startDate,
                'endDate': projects.endDate
            };
            const sortColumn = sortColumnMap[sortField] || projects.createdAt;
            const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
            // Get total count
            const totalResult = await db
                .select({ count: sql `count(*)` })
                .from(projects)
                .where(and(...whereConditions));
            const total = totalResult[0]?.count || 0;
            const totalPages = Math.ceil(total / pageSize);
            // Get projects
            const projectsList = await db
                .select()
                .from(projects)
                .where(and(...whereConditions))
                .orderBy(orderBy)
                .limit(pageSize)
                .offset(offset);
            // Transform to response format
            const data = projectsList.map(project => ({
                id: project.id,
                organizationId: project.organizationId,
                name: project.name,
                code: project.code,
                description: project.description,
                status: project.status,
                ownerId: project.ownerId,
                startDate: project.startDate || null, // startDate is already a string from date column
                endDate: project.endDate || null, // endDate is already a string from date column
                metadata: project.metadata || {},
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
                deletedAt: project.deletedAt?.toISOString() || null
            }));
            const meta = {
                page,
                size: pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return { data, meta };
        }
        catch (error) {
            console.error('ProjectService.listProjects error:', error);
            throw error;
        }
    }
    async getProjectById(id) {
        const db = getDatabase();
        const projectResult = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.organizationId, this.context.organizationId), isNull(projects.deletedAt)))
            .limit(1);
        if (!projectResult.length) {
            return null;
        }
        const project = projectResult[0];
        // Get owner details if ownerId exists
        let owner = null;
        if (project.ownerId) {
            const ownerResult = await db
                .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
            })
                .from(users)
                .where(eq(users.id, project.ownerId))
                .limit(1);
            if (ownerResult.length) {
                owner = ownerResult[0];
            }
        }
        // Get service categories (this would need a junction table in real implementation)
        // For now, we'll return empty array
        const serviceCategoriesList = [];
        const response = {
            id: project.id,
            organizationId: project.organizationId,
            name: project.name,
            code: project.code,
            description: project.description,
            status: project.status,
            ownerId: project.ownerId,
            startDate: project.startDate || null,
            endDate: project.endDate || null,
            metadata: project.metadata || {},
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            deletedAt: project.deletedAt?.toISOString() || null,
            owner: owner || undefined,
            serviceCategories: serviceCategoriesList
        };
        return response;
    }
    async createProject(data) {
        const db = getDatabase();
        const projectId = generateId('proj');
        const now = new Date();
        const projectData = {
            id: projectId,
            organizationId: this.context.organizationId,
            name: data.name,
            code: data.code || null,
            description: data.description || null,
            status: data.status || 'active',
            ownerId: data.ownerId || null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            metadata: data.metadata || {},
            createdAt: now,
            updatedAt: now,
            deletedAt: null
        };
        await db.insert(projects).values(projectData);
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'project.created',
                entityType: 'project',
                entityId: projectId,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: {
                    name: data.name,
                    status: data.status || 'active'
                }
            });
        }
        return {
            id: projectData.id,
            organizationId: projectData.organizationId,
            name: projectData.name,
            code: projectData.code,
            description: projectData.description,
            status: projectData.status,
            ownerId: projectData.ownerId,
            startDate: projectData.startDate || null,
            endDate: projectData.endDate || null,
            metadata: projectData.metadata,
            createdAt: projectData.createdAt.toISOString(),
            updatedAt: projectData.updatedAt.toISOString(),
            deletedAt: projectData.deletedAt?.toISOString() || null
        };
    }
    async updateProject(id, data) {
        const db = getDatabase();
        const existingProject = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.organizationId, this.context.organizationId), isNull(projects.deletedAt)))
            .limit(1);
        if (!existingProject.length) {
            return null;
        }
        const updateData = {
            updatedAt: new Date()
        };
        // Only update provided fields
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.code !== undefined)
            updateData.code = data.code;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.ownerId !== undefined)
            updateData.ownerId = data.ownerId;
        if (data.startDate !== undefined)
            updateData.startDate = data.startDate || null;
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate || null;
        if (data.metadata !== undefined)
            updateData.metadata = data.metadata;
        await db
            .update(projects)
            .set(updateData)
            .where(eq(projects.id, id));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'project.updated',
                entityType: 'project',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                newValues: updateData
            });
        }
        // Return updated project
        const updatedProject = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        if (!updatedProject.length) {
            return null;
        }
        const project = updatedProject[0];
        return {
            id: project.id,
            organizationId: project.organizationId,
            name: project.name,
            code: project.code,
            description: project.description,
            status: project.status,
            ownerId: project.ownerId,
            startDate: project.startDate || null,
            endDate: project.endDate || null,
            metadata: project.metadata || {},
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            deletedAt: project.deletedAt?.toISOString() || null
        };
    }
    async deleteProject(id) {
        const db = getDatabase();
        const existingProject = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.organizationId, this.context.organizationId), isNull(projects.deletedAt)))
            .limit(1);
        if (!existingProject.length) {
            return false;
        }
        // Soft delete
        await db
            .update(projects)
            .set({
            deletedAt: new Date(),
            updatedAt: new Date()
        })
            .where(eq(projects.id, id));
        // Log audit event
        if (this.auditLogger) {
            await this.auditLogger.logEvent({
                action: 'project.deleted',
                entityType: 'project',
                entityId: id,
                organizationId: this.context.organizationId,
                userId: this.context.userId,
                oldValues: {
                    name: existingProject[0].name
                }
            });
        }
        return true;
    }
}
//# sourceMappingURL=service.js.map