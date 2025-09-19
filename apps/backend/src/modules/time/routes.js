import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { timeEntries, timeEntryApprovals } from '../../lib/schema.js';
import { logger } from '../../lib/logger.js';
export const timeRoutes = async (fastify) => {
    const db = fastify.db;
    // List time entries
    fastify.get('/v1/time-entries', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    projectId: { type: 'string' },
                    status: { type: 'string', enum: ['draft', 'submitted', 'approved', 'rejected', 'invoiced'] },
                    billable: { type: 'boolean' },
                    userId: { type: 'string' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    organizationId: { type: 'string' },
                                    userId: { type: 'string' },
                                    projectId: { type: 'string', nullable: true },
                                    date: { type: 'string', format: 'date' },
                                    startTime: { type: 'string', format: 'date-time', nullable: true },
                                    endTime: { type: 'string', format: 'date-time', nullable: true },
                                    duration: { type: 'integer' },
                                    breakMinutes: { type: 'integer' },
                                    description: { type: 'string' },
                                    activityType: { type: 'string' },
                                    billable: { type: 'boolean' },
                                    hourlyRate: { type: 'number', nullable: true },
                                    billableAmount: { type: 'number', nullable: true },
                                    currency: { type: 'string' },
                                    status: { type: 'string' },
                                    submittedAt: { type: 'string', format: 'date-time', nullable: true },
                                    approvedAt: { type: 'string', format: 'date-time', nullable: true },
                                    approvedBy: { type: 'string', nullable: true },
                                    rejectedAt: { type: 'string', format: 'date-time', nullable: true },
                                    rejectedBy: { type: 'string', nullable: true },
                                    rejectionReason: { type: 'string', nullable: true },
                                    tags: { type: 'array', items: { type: 'string' }, nullable: true },
                                    notes: { type: 'string', nullable: true },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    updatedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                pages: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { startDate, endDate, projectId, status, billable, userId, page = 1, limit = 20 } = request.query;
            const { user } = request;
            // Build query conditions
            const conditions = [eq(timeEntries.organizationId, user.organizationId)];
            // Users can only see their own entries unless they have admin role
            if (!user.roles.includes('admin') && !user.roles.includes('manager')) {
                conditions.push(eq(timeEntries.userId, user.userId));
            }
            else if (userId) {
                conditions.push(eq(timeEntries.userId, userId));
            }
            if (startDate) {
                conditions.push(gte(timeEntries.date, startDate));
            }
            if (endDate) {
                conditions.push(lte(timeEntries.date, endDate));
            }
            if (projectId) {
                conditions.push(eq(timeEntries.projectId, projectId));
            }
            if (status) {
                conditions.push(eq(timeEntries.status, status));
            }
            if (typeof billable === 'boolean') {
                conditions.push(eq(timeEntries.billable, billable));
            }
            // Get total count
            const [{ count }] = await db
                .select({ count: sql `count(*)` })
                .from(timeEntries)
                .where(and(...conditions));
            // Get paginated results
            const entries = await db
                .select()
                .from(timeEntries)
                .where(and(...conditions))
                .orderBy(desc(timeEntries.date), desc(timeEntries.createdAt))
                .limit(limit)
                .offset((page - 1) * limit);
            const totalPages = Math.ceil(count / limit);
            reply.send({
                success: true,
                data: entries,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: totalPages
                }
            });
        }
        catch (error) {
            logger.error({ error, userId: request.user?.id }, 'Failed to list time entries');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Create time entry
    fastify.post('/v1/time-entries', {
        schema: {
            body: {
                type: 'object',
                required: ['date', 'duration', 'description'],
                properties: {
                    projectId: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                    duration: { type: 'integer', minimum: 1 },
                    breakMinutes: { type: 'integer', minimum: 0, default: 0 },
                    description: { type: 'string', minLength: 1, maxLength: 1000 },
                    activityType: { type: 'string', enum: ['development', 'meeting', 'admin', 'research', 'testing', 'documentation', 'support'], default: 'development' },
                    billable: { type: 'boolean', default: true },
                    hourlyRate: { type: 'number', minimum: 0 },
                    tags: { type: 'array', items: { type: 'string' } },
                    notes: { type: 'string', maxLength: 2000 }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                userId: { type: 'string' },
                                projectId: { type: 'string', nullable: true },
                                date: { type: 'string', format: 'date' },
                                duration: { type: 'integer' },
                                description: { type: 'string' },
                                status: { type: 'string' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { user } = request;
            const entryData = request.body;
            // Generate unique ID
            const entryId = `time-entry-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            // Calculate billable amount if hourly rate is provided
            let billableAmount = null;
            if (entryData.billable && entryData.hourlyRate && entryData.duration) {
                billableAmount = (entryData.hourlyRate * entryData.duration) / 60; // Convert minutes to hours
            }
            const newEntry = {
                id: entryId,
                organizationId: user.organizationId,
                userId: user.userId,
                projectId: entryData.projectId || null,
                date: entryData.date,
                startTime: entryData.startTime ? new Date(entryData.startTime) : null,
                endTime: entryData.endTime ? new Date(entryData.endTime) : null,
                duration: entryData.duration,
                breakMinutes: entryData.breakMinutes || 0,
                description: entryData.description,
                activityType: entryData.activityType || 'development',
                billable: entryData.billable !== false,
                hourlyRate: entryData.hourlyRate?.toString() || null,
                billableAmount: billableAmount?.toFixed(2) || null,
                currency: 'NZD',
                status: 'draft',
                tags: entryData.tags || [],
                notes: entryData.notes || null,
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const [createdEntry] = await db.insert(timeEntries).values(newEntry).returning();
            logger.info({
                entryId: createdEntry.id,
                userId: user.userId,
                organizationId: user.organizationId
            }, 'Time entry created');
            reply.status(201).send({
                success: true,
                data: createdEntry
            });
        }
        catch (error) {
            logger.error({ error, userId: request.user?.id }, 'Failed to create time entry');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Submit time entry for approval
    fastify.post('/v1/time-entries/:id/submit', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { user } = request;
            // Check if entry exists and belongs to user (or user is admin)
            const entry = await db
                .select()
                .from(timeEntries)
                .where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, user.organizationId), user.roles.includes('admin') ? undefined : eq(timeEntries.userId, user.userId)))
                .limit(1);
            if (!entry.length) {
                return reply.status(404).send({
                    success: false,
                    error: 'Time entry not found'
                });
            }
            if (entry[0].status !== 'draft') {
                return reply.status(400).send({
                    success: false,
                    error: 'Time entry is not in draft status'
                });
            }
            // Update status to submitted
            await db
                .update(timeEntries)
                .set({
                status: 'submitted',
                submittedAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(timeEntries.id, id));
            logger.info({ entryId: id, userId: user.userId }, 'Time entry submitted for approval');
            reply.send({
                success: true,
                message: 'Time entry submitted for approval'
            });
        }
        catch (error) {
            logger.error({ error, entryId: request.params.id, userId: request.user?.id }, 'Failed to submit time entry');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Approve time entry
    fastify.post('/v1/time-entries/:id/approve', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    comments: { type: 'string', maxLength: 1000 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { comments } = request.body;
            const { user } = request;
            // Check if user has approval permissions
            if (!user.roles.includes('admin') && !user.roles.includes('manager') && !user.roles.includes('approver')) {
                return reply.status(403).send({
                    success: false,
                    error: 'Insufficient permissions to approve time entries'
                });
            }
            // Check if entry exists and is in submitted status
            const entry = await db
                .select()
                .from(timeEntries)
                .where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, user.organizationId), eq(timeEntries.status, 'submitted')))
                .limit(1);
            if (!entry.length) {
                return reply.status(404).send({
                    success: false,
                    error: 'Time entry not found or not in submitted status'
                });
            }
            // Update status to approved
            await db
                .update(timeEntries)
                .set({
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: user.userId,
                updatedAt: new Date()
            })
                .where(eq(timeEntries.id, id));
            // Create approval record
            const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            await db.insert(timeEntryApprovals).values({
                id: approvalId,
                timeEntryId: id,
                approverId: user.userId,
                status: 'approved',
                comments: comments || null,
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            logger.info({ entryId: id, approverId: user.userId }, 'Time entry approved');
            reply.send({
                success: true,
                message: 'Time entry approved successfully'
            });
        }
        catch (error) {
            logger.error({ error, entryId: request.params.id, userId: request.user?.id }, 'Failed to approve time entry');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Reject time entry
    fastify.post('/v1/time-entries/:id/reject', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['reason'],
                properties: {
                    reason: { type: 'string', minLength: 1, maxLength: 1000 },
                    comments: { type: 'string', maxLength: 1000 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { reason, comments } = request.body;
            const { user } = request;
            // Check if user has approval permissions
            if (!user.roles.includes('admin') && !user.roles.includes('manager') && !user.roles.includes('approver')) {
                return reply.status(403).send({
                    success: false,
                    error: 'Insufficient permissions to reject time entries'
                });
            }
            // Check if entry exists and is in submitted status
            const entry = await db
                .select()
                .from(timeEntries)
                .where(and(eq(timeEntries.id, id), eq(timeEntries.organizationId, user.organizationId), eq(timeEntries.status, 'submitted')))
                .limit(1);
            if (!entry.length) {
                return reply.status(404).send({
                    success: false,
                    error: 'Time entry not found or not in submitted status'
                });
            }
            // Update status to rejected
            await db
                .update(timeEntries)
                .set({
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: user.userId,
                rejectionReason: reason,
                updatedAt: new Date()
            })
                .where(eq(timeEntries.id, id));
            // Create approval record
            const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            await db.insert(timeEntryApprovals).values({
                id: approvalId,
                timeEntryId: id,
                approverId: user.userId,
                status: 'rejected',
                comments: comments || null,
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            logger.info({ entryId: id, approverId: user.userId, reason }, 'Time entry rejected');
            reply.send({
                success: true,
                message: 'Time entry rejected'
            });
        }
        catch (error) {
            logger.error({ error, entryId: request.params.id, userId: request.user?.id }, 'Failed to reject time entry');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get pending approvals
    fastify.get('/v1/approvals/time', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    userId: { type: 'string' },
                                    userName: { type: 'string' },
                                    projectId: { type: 'string', nullable: true },
                                    date: { type: 'string', format: 'date' },
                                    duration: { type: 'integer' },
                                    description: { type: 'string' },
                                    activityType: { type: 'string' },
                                    billable: { type: 'boolean' },
                                    billableAmount: { type: 'number', nullable: true },
                                    submittedAt: { type: 'string', format: 'date-time' },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                pages: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { page = 1, limit = 20 } = request.query;
            const { user } = request;
            // Check if user has approval permissions
            if (!user.roles.includes('admin') && !user.roles.includes('manager') && !user.roles.includes('approver')) {
                return reply.status(403).send({
                    success: false,
                    error: 'Insufficient permissions to view pending approvals'
                });
            }
            // Get total count
            const [{ count }] = await db
                .select({ count: sql `count(*)` })
                .from(timeEntries)
                .where(and(eq(timeEntries.organizationId, user.organizationId), eq(timeEntries.status, 'submitted')));
            // Get paginated results with user information
            const pendingEntries = await db
                .select({
                id: timeEntries.id,
                userId: timeEntries.userId,
                projectId: timeEntries.projectId,
                date: timeEntries.date,
                duration: timeEntries.duration,
                description: timeEntries.description,
                activityType: timeEntries.activityType,
                billable: timeEntries.billable,
                billableAmount: timeEntries.billableAmount,
                submittedAt: timeEntries.submittedAt,
                createdAt: timeEntries.createdAt
            })
                .from(timeEntries)
                .where(and(eq(timeEntries.organizationId, user.organizationId), eq(timeEntries.status, 'submitted')))
                .orderBy(desc(timeEntries.submittedAt))
                .limit(limit)
                .offset((page - 1) * limit);
            const totalPages = Math.ceil(count / limit);
            reply.send({
                success: true,
                data: pendingEntries,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: totalPages
                }
            });
        }
        catch (error) {
            logger.error({ error, userId: request.user?.id }, 'Failed to get pending time approvals');
            reply.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
};
//# sourceMappingURL=routes.js.map