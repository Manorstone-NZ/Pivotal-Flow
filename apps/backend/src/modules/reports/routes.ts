/**
 * Reporting module routes
 * API endpoints for reports and exports
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../../lib/db.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../../lib/audit/logger.js';
import { ExportJobService } from './export-job.service.js';
import { ReportingService } from './service.js';
import {
  ExportJobRequestSchema,
  QuoteCycleTimeFiltersSchema,
  InvoiceSettlementTimeFiltersSchema,
  TimeApprovalsFiltersSchema,
  PaymentsReceivedFiltersSchema,
  CreateExportJobResponseSchema,
  ExportJobStatusResponseSchema,
  ReportSummaryResponseSchema,
  ErrorResponseSchema,
} from './schemas.js';
import type { ReportType, ExportFormat } from './constants.js';
import type { 
  QuoteCycleTimeFilters, 
  InvoiceSettlementTimeFilters, 
  TimeApprovalsFilters, 
  PaymentsReceivedFilters 
} from './types.js';

// Request types for proper type safety
interface AuthenticatedRequest extends FastifyRequest {
  user: {
    organizationId: string;
    userId: string;
  };
}

interface ExportJobRequest extends FastifyRequest {
  body: {
    reportType: ReportType;
    format: ExportFormat;
    filters: QuoteCycleTimeFilters | InvoiceSettlementTimeFilters | TimeApprovalsFilters | PaymentsReceivedFilters;
    fileName?: string;
  };
}

interface ReportSummaryRequest extends FastifyRequest {
  query: Record<string, unknown>;
}

/**
 * Register reporting routes
 */
export async function reportsRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /v1/reports/export - Create export job
  fastify.post<{ Body: ExportJobRequest['body'] }>('/export', {
    schema: {
      body: ExportJobRequestSchema,
      response: {
        200: CreateExportJobResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: ExportJobRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const _auditLogger = new AuditLogger(fastify, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, _auditLogger);

      const jobId = await exportJobService.createExportJob(request.body);

      return reply.status(200).send({
        jobId,
        status: 'pending',
        message: 'Export job created successfully',
      });
    } catch (error) {
      fastify.log.error(error, 'Error creating export job');
      
      if (error instanceof Error && error.message.includes('Permission denied')) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: error.message,
          statusCode: 403,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create export job',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/export/:jobId - Get export job status
  fastify.get<{ Params: { jobId: string } }>('/export/:jobId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string', format: 'uuid' },
        },
        required: ['jobId'],
      },
      response: {
        200: ExportJobStatusResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const { jobId } = request.params;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const _auditLogger = new AuditLogger(fastify, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, _auditLogger);

      const result = await exportJobService.getExportJobStatus(jobId);

      return reply.status(200).send(result);
    } catch (error) {
      fastify.log.error(error, 'Error getting export job status');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: error.message,
          statusCode: 404,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get export job status',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/export/:jobId/download - Download export file
  fastify.get<{ Params: { jobId: string } }>('/export/:jobId/download', {
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string', format: 'uuid' },
        },
        required: ['jobId'],
      },
      response: {
        200: {
          description: 'Export file',
          type: 'string'
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const { jobId } = request.params;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const _auditLogger = new AuditLogger(fastify, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, _auditLogger);

      const jobStatus = await exportJobService.getExportJobStatus(jobId);
      
      if (jobStatus.job.status !== 'completed') {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Export job is not completed',
          statusCode: 400,
        });
      }

      // In production, this would serve the actual file from storage
      // For now, return a placeholder response
      const contentType = jobStatus.job.format === 'csv' ? 'text/csv' : 'application/json';
      reply.header('Content-Type', contentType);
      reply.header('Content-Disposition', `attachment; filename="${jobStatus.job.fileName}"`);
      
      return reply.status(200).send('Export data placeholder');
    } catch (error) {
      fastify.log.error(error, 'Error downloading export file');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: error.message,
          statusCode: 404,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to download export file',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/summary/quote-cycle-time - Quote cycle time summary
  fastify.get<{ Querystring: Record<string, unknown> }>('/summary/quote-cycle-time', {
    schema: {
      querystring: QuoteCycleTimeFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: ReportSummaryRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService);

      const filters = { ...request.query, organizationId };
      const summary = await reportingService.generateQuoteCycleTimeSummary(filters);

      return reply.status(200).send(summary);
    } catch (error) {
      fastify.log.error(error, 'Error generating quote cycle time summary');
      
      if (error instanceof Error && error.message.includes('Permission denied')) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: error.message,
          statusCode: 403,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate quote cycle time summary',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/summary/invoice-settlement-time - Invoice settlement time summary
  fastify.get<{ Querystring: Record<string, unknown> }>('/summary/invoice-settlement-time', {
    schema: {
      querystring: InvoiceSettlementTimeFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: ReportSummaryRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService);

      const filters = { ...request.query, organizationId };
      const summary = await reportingService.generateInvoiceSettlementTimeSummary(filters);

      return reply.status(200).send(summary);
    } catch (error) {
      fastify.log.error(error, 'Error generating invoice settlement time summary');
      
      if (error instanceof Error && error.message.includes('Permission denied')) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: error.message,
          statusCode: 403,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate invoice settlement time summary',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/summary/time-approvals - Time approvals summary
  fastify.get<{ Querystring: Record<string, unknown> }>('/summary/time-approvals', {
    schema: {
      querystring: TimeApprovalsFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: ReportSummaryRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService);

      const filters = { ...request.query, organizationId };
      const summary = await reportingService.generateTimeApprovalsSummary(filters);

      return reply.status(200).send(summary);
    } catch (error) {
      fastify.log.error(error, 'Error generating time approvals summary');
      
      if (error instanceof Error && error.message.includes('Permission denied')) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: error.message,
          statusCode: 403,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate time approvals summary',
        statusCode: 500,
      });
    }
  });

  // GET /v1/reports/summary/payments-received - Payments received summary
  fastify.get<{ Querystring: Record<string, unknown> }>('/summary/payments-received', {
    schema: {
      querystring: PaymentsReceivedFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: ReportSummaryRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as AuthenticatedRequest).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService);

      const filters = { ...request.query, organizationId };
      const summary = await reportingService.generatePaymentsReceivedSummary(filters);

      return reply.status(200).send(summary);
    } catch (error) {
      fastify.log.error(error, 'Error generating payments received summary');
      
      if (error instanceof Error && error.message.includes('Permission denied')) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: error.message,
          statusCode: 403,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate payments received summary',
        statusCode: 500,
      });
    }
  });
}
