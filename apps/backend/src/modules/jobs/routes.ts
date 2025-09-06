/**
 * Jobs module routes
 * API endpoints for job management and status polling
 */

import type { FastifyInstance } from 'fastify';

import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { getDatabase } from '../../lib/db.js';
import { PermissionService } from '../permissions/service.js';

import { ExportJobProcessor } from './processors/export-job.processor.js';
import {
  CreateJobRequestSchema,
  JobStatusResponseSchema,
  JobListResponseSchema,
  JobQuerySchema,
} from './schemas.js';
import { JobsService } from './service.js';

/**
 * Register jobs routes
 */
export async function registerJobsRoutes(fastify: FastifyInstance): Promise<void> {
  // Create job
  fastify.post<{ Body: any }>('/v1/jobs', {
    schema: {
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
  }, async (request) => {
    const { organizationId, userId } = request.user as any;
    const db = getDatabase();
    const permissionService = new PermissionService(db, { organizationId, userId });
    const auditLogger = new AuditLogger(fastify);

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
  }, async (request) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const db = getDatabase();
    const permissionService = new PermissionService(db, { organizationId, userId });
    const auditLogger = new AuditLogger(fastify);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    const result = await jobsService.getJobStatus(jobId);

    return result;
  });

  // List jobs
  fastify.get<{ Querystring: any }>('/v1/jobs', {
    schema: {
      querystring: JobQuerySchema,
      response: {
        200: JobListResponseSchema,
      },
    },
  }, async (request) => {
    const { organizationId, userId } = request.user as any;
    const { page, pageSize, status, jobType } = request.query as any;
    const db = getDatabase();
    const permissionService = new PermissionService(db, { organizationId, userId });
    const auditLogger = new AuditLogger(fastify);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    const result = await jobsService.listJobs(page, pageSize, status, jobType);

    return result;
  });

  // Cancel job
  fastify.post<{ Params: { jobId: string } }>('/v1/jobs/:jobId/cancel', {
    schema: {
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
  }, async (request) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const db = getDatabase();
    const permissionService = new PermissionService(db, { organizationId, userId });
    const auditLogger = new AuditLogger(fastify);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    await jobsService.cancelJob(jobId);

    return {
      message: 'Job cancelled successfully',
    };
  });

  // Retry job
  fastify.post<{ Params: { jobId: string } }>('/v1/jobs/:jobId/retry', {
    schema: {
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
  }, async (request) => {
    const { organizationId, userId } = request.user as any;
    const { jobId } = request.params;
    const db = getDatabase();
    const permissionService = new PermissionService(db, { organizationId, userId });
    const auditLogger = new AuditLogger(fastify);

    const jobsService = new JobsService(organizationId, userId, permissionService, auditLogger);
    await jobsService.retryJob(jobId);

    return {
      message: 'Job retry initiated successfully',
    };
  });
}
