/**
 * Jobs module routes
 * API endpoints for job management and status polling
 */

import { FastifyInstance } from 'fastify';
import { JobsService } from './service.js';
import { ExportJobProcessor } from './processors/export-job.processor.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../audit/logger.js';
import {
  CreateJobRequestSchema,
  JobStatusResponseSchema,
  JobListResponseSchema,
  JobQuerySchema,
} from './schemas.js';

/**
 * Register jobs routes
 */
export async function registerJobsRoutes(fastify: FastifyInstance): Promise<void> {
  // Create job
  fastify.post<{ Body: any }>('/v1/jobs', {
    schema: {
      tags: ['Jobs'],
      summary: 'Create a new background job',
      description: 'Creates a new background job and returns the job ID for polling',
      body: CreateJobRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    
    // Register processors
    jobsService.registerProcessor(new ExportJobProcessor());

    const jobId = await jobsService.createJob(request.body as any);

    return {
      jobId,
      message: 'Job created successfully',
    };
  });

  // Get job status
  fastify.get<{ Params: { jobId: string } }>('/v1/jobs/:jobId/status', {
    schema: {
      tags: ['Jobs'],
      summary: 'Get job status',
      description: 'Returns the current status and progress of a job',
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
        required: ['jobId'],
      },
      response: {
        200: JobStatusResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    const result = await jobsService.getJobStatus(jobId);

    return result;
  });

  // List jobs
  fastify.get<{ Querystring: any }>('/v1/jobs', {
    schema: {
      tags: ['Jobs'],
      summary: 'List user jobs',
      description: 'Returns a paginated list of jobs for the current user',
      querystring: JobQuerySchema,
      response: {
        200: JobListResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { organizationId, userId } = request.user as any;
    const { page, pageSize, status, jobType } = request.query;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    const result = await jobsService.listJobs(page, pageSize, status, jobType);

    return result;
  });

  // Cancel job
  fastify.post<{ Params: { jobId: string } }>('/v1/jobs/:jobId/cancel', {
    schema: {
      tags: ['Jobs'],
      summary: 'Cancel a job',
      description: 'Cancels a queued or running job',
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
        required: ['jobId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    await jobsService.cancelJob(jobId);

    return {
      message: 'Job cancelled successfully',
    };
  });

  // Retry job
  fastify.post<{ Params: { jobId: string } }>('/v1/jobs/:jobId/retry', {
    schema: {
      tags: ['Jobs'],
      summary: 'Retry a failed job',
      description: 'Retries a failed job if it has not exceeded maximum retry attempts',
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
        required: ['jobId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    await jobsService.retryJob(jobId);

    return {
      message: 'Job retry initiated successfully',
    };
  });
}
