import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '../../lib/logger.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import { InvoiceService } from './service.js';
import { invoices } from '../../lib/schema.js';
import { generateId } from '@pivotal-flow/shared';
import {
  InvoiceListFiltersSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceStatusTransitionSchema,
  MarkInvoicePaidSchema,
  VoidInvoiceSchema,
  InvoiceResponseSchema,
  InvoiceListResponseSchema,
  InvoiceErrorSchema,
  type InvoiceListFilters,
  type CreateInvoice,
  type UpdateInvoice,
  type InvoiceStatusTransition,
  type MarkInvoicePaid,
  type VoidInvoice,
} from './typeboxSchemas.js';

// Request interfaces
interface ListInvoicesRequest {
  Querystring: InvoiceListFilters;
}

interface GetInvoiceRequest {
  Params: { id: string };
  Headers: { 'if-none-match'?: string };
}

interface CreateInvoiceRequest {
  Body: CreateInvoice;
}

interface UpdateInvoiceRequest {
  Params: { id: string };
  Body: UpdateInvoice;
}

interface StatusTransitionRequest {
  Params: { id: string };
  Body: InvoiceStatusTransition;
}

interface MarkPaidRequest {
  Params: { id: string };
  Body: MarkInvoicePaid;
}

interface VoidInvoiceRequest {
  Params: { id: string };
  Body: VoidInvoice;
}

/**
 * Register invoice list route
 */
export function registerListInvoicesRoute(fastify: FastifyInstance) {
  fastify.get('/v1/invoices', {
    schema: {
      tags: ['Invoices'],
      summary: 'List invoices',
      description: 'Get paginated list of invoices with filtering options',
      querystring: InvoiceListFiltersSchema,
      response: {
        200: InvoiceListResponseSchema,
        400: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<ListInvoicesRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Get invoices
      const result = await invoiceService.listInvoices(request.query);

      return reply.status(200).send(result);
    } catch (error) {
      logger.error('Error listing invoices:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list invoices',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register get invoice route with ETag support
 */
export function registerGetInvoiceRoute(fastify: FastifyInstance) {
  fastify.get('/v1/invoices/:id', {
    schema: {
      tags: ['Invoices'],
      summary: 'Get invoice by ID',
      description: 'Get detailed invoice information with ETag caching support',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      headers: {
        type: 'object',
        properties: {
          'if-none-match': { type: 'string' },
        },
      },
      response: {
        200: InvoiceResponseSchema,
        304: { description: 'Not Modified' },
        404: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<GetInvoiceRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      const { id } = request.params;

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Get invoice
      const invoice = await invoiceService.getInvoiceById(id);

      if (!invoice) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        });
      }

      // Check ETag for caching
      const clientETag = request.headers['if-none-match'];
      if (clientETag && clientETag === invoice.etag) {
        return reply.status(304).send();
      }

      // Set caching headers
      reply.header('ETag', invoice.etag!);
      reply.header('Cache-Control', 'private, max-age=300, must-revalidate');
      reply.header('Last-Modified', new Date(invoice.updatedAt).toUTCString());

      return reply.status(200).send(invoice);
    } catch (error) {
      logger.error('Error getting invoice:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get invoice',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register create invoice route
 */
export function registerCreateInvoiceRoute(fastify: FastifyInstance) {
  fastify.post('/v1/invoices', {
    schema: {
      tags: ['Invoices'],
      summary: 'Create invoice',
      description: 'Create a new invoice',
      body: CreateInvoiceSchema,
      response: {
        201: InvoiceResponseSchema,
        400: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<CreateInvoiceRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      // Create invoice service (without audit logger like quotes)
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      });

      // Create invoice using service
      const result = await invoiceService.createInvoice({
        ...request.body,
        metadata: request.body.metadata || {}
      });

      return reply.status(201).send(result);
    } catch (error) {
      logger.error('Error creating invoice:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create invoice',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register update invoice route
 */
export function registerUpdateInvoiceRoute(fastify: FastifyInstance) {
  fastify.patch('/v1/invoices/:id', {
    schema: {
      tags: ['Invoices'],
      summary: 'Update invoice',
      description: 'Update invoice details (draft invoices only)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: UpdateInvoiceSchema,
      response: {
        200: InvoiceResponseSchema,
        400: InvoiceErrorSchema,
        404: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<UpdateInvoiceRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      const { id } = request.params;

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Update invoice
      const invoice = await invoiceService.updateInvoice(id, request.body);

      if (!invoice) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        });
      }

      return reply.status(200).send(invoice);
    } catch (error) {
      logger.error('Error updating invoice:', error);
      
      if (error instanceof Error && error.message.includes('draft invoices')) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: error.message,
          code: 'INVALID_INVOICE_STATUS',
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update invoice',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register invoice status transition route
 */
export function registerInvoiceStatusRoute(fastify: FastifyInstance) {
  fastify.post('/v1/invoices/:id/status', {
    schema: {
      tags: ['Invoices'],
      summary: 'Update invoice status',
      description: 'Transition invoice to a new status',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: InvoiceStatusTransitionSchema,
      response: {
        200: InvoiceResponseSchema,
        400: InvoiceErrorSchema,
        404: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<StatusTransitionRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      const { id } = request.params;

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Update status
      const invoice = await invoiceService.updateInvoiceStatus(id, request.body);

      if (!invoice) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        });
      }

      return reply.status(200).send(invoice);
    } catch (error) {
      logger.error('Error updating invoice status:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update invoice status',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register mark invoice paid route
 */
export function registerMarkInvoicePaidRoute(fastify: FastifyInstance) {
  fastify.post('/v1/invoices/:id/mark-paid', {
    schema: {
      tags: ['Invoices'],
      summary: 'Mark invoice as paid',
      description: 'Record payment and update invoice status',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: MarkInvoicePaidSchema,
      response: {
        200: InvoiceResponseSchema,
        400: InvoiceErrorSchema,
        404: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<MarkPaidRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      const { id } = request.params;

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Mark as paid
      const invoice = await invoiceService.markInvoicePaid(id, request.body);

      if (!invoice) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        });
      }

      return reply.status(200).send(invoice);
    } catch (error) {
      logger.error('Error marking invoice as paid:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to mark invoice as paid',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}

/**
 * Register void invoice route
 */
export function registerVoidInvoiceRoute(fastify: FastifyInstance) {
  fastify.post('/v1/invoices/:id/void', {
    schema: {
      tags: ['Invoices'],
      summary: 'Void invoice',
      description: 'Mark invoice as void (cannot be undone)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: VoidInvoiceSchema,
      response: {
        200: InvoiceResponseSchema,
        400: InvoiceErrorSchema,
        404: InvoiceErrorSchema,
        401: InvoiceErrorSchema,
        403: InvoiceErrorSchema,
        500: InvoiceErrorSchema,
      },
    },
  }, async (request: FastifyRequest<VoidInvoiceRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED',
        });
      }

      const { id } = request.params;

      // Create invoice service
      const auditLogger = new AuditLogger(request.server);
      const invoiceService = new InvoiceService({
        organizationId: user.organizationId,
        userId: user.userId,
      }, auditLogger);

      // Void invoice
      const invoice = await invoiceService.voidInvoice(id, request.body);

      if (!invoice) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        });
      }

      return reply.status(200).send(invoice);
    } catch (error) {
      logger.error('Error voiding invoice:', error);
      
      if (error instanceof Error && error.message.includes('Cannot void')) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: error.message,
          code: 'INVALID_VOID_OPERATION',
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to void invoice',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}
