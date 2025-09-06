import { getDatabase } from '../../lib/db.js';
import { CreateApprovalRequestSchema, ApproveRequestSchema, RejectRequestSchema, CancelRequestSchema, ApprovalFiltersSchema, ListApprovalsResponseSchema, createApprovalsPagingResponse } from './schemas.js';
import { ApprovalService } from './service.js';
export async function approvalRoutes(fastify) {
    // Create approval request
    fastify.post('/v1/approvals', {
        schema: {
            body: {
                type: 'object',
                required: ['entityType', 'entityId', 'approverId'],
                properties: {
                    entityType: { type: 'string', enum: ['quote', 'invoice', 'project'] },
                    entityId: { type: 'string', format: 'uuid' },
                    approverId: { type: 'string', format: 'uuid' },
                    reason: { type: 'string', maxLength: 1000 },
                    notes: { type: 'object' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                entityType: { type: 'string' },
                                entityId: { type: 'string' },
                                requestedBy: { type: 'string' },
                                approverId: { type: 'string' },
                                status: { type: 'string' },
                                requestedAt: { type: 'string', format: 'date-time' },
                                reason: { type: 'string' },
                                notes: { type: 'object' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const body = CreateApprovalRequestSchema.parse(request.body);
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvalRequest = await approvalService.createApprovalRequest(body);
            reply.send({
                success: true,
                data: approvalRequest
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error creating approval request');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Approve request
    fastify.post('/v1/approvals/:id/approve', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    reason: { type: 'string', maxLength: 1000 },
                    notes: { type: 'object' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                entityType: { type: 'string' },
                                entityId: { type: 'string' },
                                requestedBy: { type: 'string' },
                                approverId: { type: 'string' },
                                status: { type: 'string' },
                                requestedAt: { type: 'string', format: 'date-time' },
                                decidedAt: { type: 'string', format: 'date-time' },
                                reason: { type: 'string' },
                                notes: { type: 'object' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const body = ApproveRequestSchema.parse(request.body);
            const { id } = request.params;
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvalRequest = await approvalService.approveRequest(id, body);
            reply.send({
                success: true,
                data: approvalRequest
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error approving request');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Reject request
    fastify.post('/v1/approvals/:id/reject', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['reason'],
                properties: {
                    reason: { type: 'string', minLength: 1, maxLength: 1000 },
                    notes: { type: 'object' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                entityType: { type: 'string' },
                                entityId: { type: 'string' },
                                requestedBy: { type: 'string' },
                                approverId: { type: 'string' },
                                status: { type: 'string' },
                                requestedAt: { type: 'string', format: 'date-time' },
                                decidedAt: { type: 'string', format: 'date-time' },
                                reason: { type: 'string' },
                                notes: { type: 'object' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const body = RejectRequestSchema.parse(request.body);
            const { id } = request.params;
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvalRequest = await approvalService.rejectRequest(id, body);
            reply.send({
                success: true,
                data: approvalRequest
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error rejecting request');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Cancel request
    fastify.post('/v1/approvals/:id/cancel', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    reason: { type: 'string', maxLength: 1000 },
                    notes: { type: 'object' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                entityType: { type: 'string' },
                                entityId: { type: 'string' },
                                requestedBy: { type: 'string' },
                                approverId: { type: 'string' },
                                status: { type: 'string' },
                                requestedAt: { type: 'string', format: 'date-time' },
                                decidedAt: { type: 'string', format: 'date-time' },
                                reason: { type: 'string' },
                                notes: { type: 'object' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const body = CancelRequestSchema.parse(request.body);
            const { id } = request.params;
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvalRequest = await approvalService.cancelRequest(id, body);
            reply.send({
                success: true,
                data: approvalRequest
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error cancelling request');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // List approval requests
    fastify.get('/v1/approvals', {
        schema: {
            querystring: ApprovalFiltersSchema,
            response: {
                200: ListApprovalsResponseSchema,
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const query = ApprovalFiltersSchema.parse(request.query);
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvals = await approvalService.getApprovalRequests(query);
            const pagingResponse = createApprovalsPagingResponse(approvals, query.page || 1, query.pageSize || 20, approvals.length // In a real implementation, this would be the total count
            );
            reply.send(pagingResponse);
        }
        catch (error) {
            fastify.log.error(error, 'Error listing approval requests');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get approval request by ID
    fastify.get('/v1/approvals/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                organizationId: { type: 'string' },
                                entityType: { type: 'string' },
                                entityId: { type: 'string' },
                                requestedBy: { type: 'string' },
                                approverId: { type: 'string' },
                                status: { type: 'string' },
                                requestedAt: { type: 'string', format: 'date-time' },
                                decidedAt: { type: 'string', format: 'date-time' },
                                reason: { type: 'string' },
                                notes: { type: 'object' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const approvalRequest = await approvalService.getApprovalRequest(id);
            if (!approvalRequest) {
                reply.status(404).send({
                    error: 'Not found',
                    message: 'Approval request not found'
                });
                return;
            }
            reply.send({
                success: true,
                data: approvalRequest
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error getting approval request');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get approval policy
    fastify.get('/v1/approvals/policy', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                quoteSendRequiresApproval: { type: 'boolean' },
                                invoiceIssueRequiresApproval: { type: 'boolean' },
                                projectCloseRequiresApproval: { type: 'boolean' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const authenticatedRequest = request;
            const approvalService = new ApprovalService(getDatabase(), {
                organizationId: authenticatedRequest.user.organizationId,
                userId: authenticatedRequest.user.userId
            }, fastify);
            const policy = await approvalService.getApprovalPolicy();
            reply.send({
                success: true,
                data: policy
            });
        }
        catch (error) {
            fastify.log.error(error, 'Error getting approval policy');
            reply.status(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map