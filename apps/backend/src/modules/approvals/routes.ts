import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ApprovalService } from './service.js';
import { 
  CreateApprovalRequestSchema,
  ApproveRequestSchema,
  RejectRequestSchema,
  CancelRequestSchema,
  ApprovalFiltersSchema,
  ApprovalRequestResponseSchema,
  ApprovalPolicyResponseSchema,
  ListApprovalsResponseSchema
} from './schemas.js';

// Type definition for authenticated user
interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  roles: string[];
}

// Use type assertion for authenticated requests
type AuthenticatedRequest = FastifyRequest & {
  user: AuthenticatedUser;
};

export async function approvalRoutes(fastify: FastifyInstance) {
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
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { body } = CreateApprovalRequestSchema.parse(request);
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const approvalRequest = await approvalService.createApprovalRequest(body);
      
      reply.send({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error creating approval request');
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
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    try {
      const { body } = ApproveRequestSchema.parse(request);
      const { id } = request.params;
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const approvalRequest = await approvalService.approveRequest(id, body);
      
      reply.send({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error approving request');
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
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    try {
      const { body } = RejectRequestSchema.parse(request);
      const { id } = request.params;
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const approvalRequest = await approvalService.rejectRequest(id, body);
      
      reply.send({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error rejecting request');
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
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    try {
      const { body } = CancelRequestSchema.parse(request);
      const { id } = request.params;
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const approvalRequest = await approvalService.cancelRequest(id, body);
      
      reply.send({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error cancelling request');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List approval requests
  fastify.get('/v1/approvals', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          entityType: { type: 'string', enum: ['quote', 'invoice', 'project'] },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
          approverId: { type: 'string', format: 'uuid' },
          requestedBy: { type: 'string', format: 'uuid' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 }
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
                approvals: {
                  type: 'array',
                  items: {
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
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const query = ApprovalFiltersSchema.parse(request.query);
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const approvals = await approvalService.getApprovalRequests(query);
      
      reply.send({
        success: true,
        data: {
          approvals,
          total: approvals.length,
          page: query.page || 1,
          limit: query.limit || 20
        }
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error listing approval requests');
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
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

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
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error getting approval request');
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const approvalService = new ApprovalService(
        fastify.db,
        { 
          organizationId: authenticatedRequest.user.organizationId, 
          userId: authenticatedRequest.user.userId 
        },
        fastify
      );

      const policy = await approvalService.getApprovalPolicy();
      
      reply.send({
        success: true,
        data: policy
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error getting approval policy');
      reply.status(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
