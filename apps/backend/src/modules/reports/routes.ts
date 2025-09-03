/**
 * Reporting module routes
 * API endpoints for reports and exports
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../../lib/db.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../audit/logger.js';
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

/**
 * Register reporting routes
 */
export async function reportsRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /v1/reports/export - Create export job
  fastify.post('/export', {
    schema: {
      tags: ['Reports'],
      summary: 'Create export job',
      description: 'Start an async export job for reports',
      security: [{ bearerAuth: [] }],
      body: ExportJobRequestSchema,
      response: {
        200: CreateExportJobResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, auditLogger);

      const jobId = await exportJobService.createExportJob(request.body as any);

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
  fastify.get('/export/:jobId', {
    schema: {
      tags: ['Reports'],
      summary: 'Get export job status',
      description: 'Get the status and progress of an export job',
      security: [{ bearerAuth: [] }],
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const { jobId } = request.params as { jobId: string };
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, auditLogger);

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
  fastify.get('/export/:jobId/download', {
    schema: {
      tags: ['Reports'],
      summary: 'Download export file',
      description: 'Download the completed export file',
      security: [{ bearerAuth: [] }],
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
          content: {
            'text/csv': { schema: { type: 'string' } },
            'application/json': { schema: { type: 'string' } },
          },
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const { jobId } = request.params as { jobId: string };
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const exportJobService = new ExportJobService(organizationId, userId, permissionService, auditLogger);

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
  fastify.get('/summary/quote-cycle-time', {
    schema: {
      tags: ['Reports'],
      summary: 'Quote cycle time summary',
      description: 'Get summary statistics for quote cycle times',
      security: [{ bearerAuth: [] }],
      querystring: QuoteCycleTimeFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService, auditLogger);

      const summary = await reportingService.generateQuoteCycleTimeSummary(request.query as any);

      return reply.status(200).send({
        reportType: 'quote_cycle_time',
        filters: request.query,
        summary,
        generatedAt: new Date().toISOString(),
      });
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
  fastify.get('/summary/invoice-settlement-time', {
    schema: {
      tags: ['Reports'],
      summary: 'Invoice settlement time summary',
      description: 'Get summary statistics for invoice settlement times',
      security: [{ bearerAuth: [] }],
      querystring: InvoiceSettlementTimeFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService, auditLogger);

      const summary = await reportingService.generateInvoiceSettlementTimeSummary(request.query as any);

      return reply.status(200).send({
        reportType: 'invoice_settlement_time',
        filters: request.query,
        summary,
        generatedAt: new Date().toISOString(),
      });
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
  fastify.get('/summary/time-approvals', {
    schema: {
      tags: ['Reports'],
      summary: 'Time approvals summary',
      description: 'Get summary statistics for time entry approvals',
      security: [{ bearerAuth: [] }],
      querystring: TimeApprovalsFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService, auditLogger);

      const summary = await reportingService.generateTimeApprovalsSummary(request.query as any);

      return reply.status(200).send({
        reportType: 'time_approvals',
        filters: request.query,
        summary,
        generatedAt: new Date().toISOString(),
      });
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
  fastify.get('/summary/payments-received', {
    schema: {
      tags: ['Reports'],
      summary: 'Payments received summary',
      description: 'Get summary statistics for payments received',
      security: [{ bearerAuth: [] }],
      querystring: PaymentsReceivedFiltersSchema,
      response: {
        200: ReportSummaryResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, userId } = (request as any).user;
      const db = getDatabase();
      
      const permissionService = new PermissionService(db, { organizationId });
      const auditLogger = new AuditLogger(db, { organizationId, userId });
      const reportingService = new ReportingService(organizationId, userId, permissionService, auditLogger);

      const summary = await reportingService.generatePaymentsReceivedSummary(request.query as any);

      return reply.status(200).send({
        reportType: 'payments_received',
        filters: request.query,
        summary,
        generatedAt: new Date().toISOString(),
      });
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
