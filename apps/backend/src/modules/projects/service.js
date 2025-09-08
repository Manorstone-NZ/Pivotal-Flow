import { eq, and, desc, asc, like, sql, isNull } from 'drizzle-orm';
import { generateId } from '@pivotal-flow/shared';
import { getDatabase } from '../../lib/db.js';
import { projects, users, serviceCategories } from '../../lib/schema.js';
export class ProjectService {
    context;
    auditLogger;
    db = getDatabase();
    constructor(context, auditLogger) {
        this.context = context;
        this.auditLogger = auditLogger;
    }
    async listProjects(filters) {
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
        const orderBy = sortOrder === 'asc'
            ? asc(projects[sortField])
            : desc(projects[sortField]);
        // Get total count
        const totalResult = await this.db
            .select({ count: sql `count(*)` })
            .from(projects)
            .where(and(...whereConditions));
        const total = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(total / pageSize);
        // Get projects
        const projectsList = await this.db
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
            startDate: project.startDate?.toISOString().split('T')[0] || null,
            endDate: project.endDate?.toISOString().split('T')[0] || null,
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
    async getProjectById(id) {
        const projectResult = await this.db
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
            const ownerResult = await this.db
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
            startDate: project.startDate?.toISOString().split('T')[0] || null,
            endDate: project.endDate?.toISOString().split('T')[0] || null,
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
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            metadata: data.metadata || {},
            createdAt: now,
            updatedAt: now,
            deletedAt: null
        };
        await this.db.insert(projects).values(projectData);
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
            startDate: projectData.startDate?.toISOString().split('T')[0] || null,
            endDate: projectData.endDate?.toISOString().split('T')[0] || null,
            metadata: projectData.metadata,
            createdAt: projectData.createdAt.toISOString(),
            updatedAt: projectData.updatedAt.toISOString(),
            deletedAt: projectData.deletedAt?.toISOString() || null
        };
    }
    async updateProject(id, data) {
        const existingProject = await this.db
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
            updateData.startDate = data.startDate ? new Date(data.startDate) : null;
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        if (data.metadata !== undefined)
            updateData.metadata = data.metadata;
        await this.db
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
        const updatedProject = await this.db
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
            startDate: project.startDate?.toISOString().split('T')[0] || null,
            endDate: project.endDate?.toISOString().split('T')[0] || null,
            metadata: project.metadata || {},
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            deletedAt: project.deletedAt?.toISOString() || null
        };
    }
    async deleteProject(id) {
        const existingProject = await this.db
            .select()
            .from(projects)
            .where(and(eq(projects.id, id), eq(projects.organizationId, this.context.organizationId), isNull(projects.deletedAt)))
            .limit(1);
        if (!existingProject.length) {
            return false;
        }
        // Soft delete
        await this.db
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