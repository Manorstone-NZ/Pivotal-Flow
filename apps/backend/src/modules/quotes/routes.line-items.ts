import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';
import { QuotePDFService } from './pdfService.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';

interface AddLineItemRequest {
  Params: {
    quoteId: string;
  };
  Body: {
    description: string;
    quantity: number;
    unitPrice: number;
    metadata?: Record<string, any>;
  };
}

interface UpdateLineItemRequest {
  Params: {
    quoteId: string;
    lineItemId: string;
  };
  Body: {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    metadata?: Record<string, any>;
  };
}

interface DeleteLineItemRequest {
  Params: {
    quoteId: string;
    lineItemId: string;
  };
}

// Schemas
const LineItemSchema = Type.Object({
  description: Type.String({ minLength: 1 }),
  quantity: Type.Number({ minimum: 0.01 }),
  unitPrice: Type.Number({ minimum: 0 }),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

const UpdateLineItemSchema = Type.Partial(LineItemSchema);

/**
 * Register line item routes for quotes
 */
export function registerQuoteLineItemRoutes(fastify: FastifyInstance) {
  // Add line item to quote
  fastify.post('/v1/quotes/:quoteId/line-items', {
    schema: {
      body: LineItemSchema
    }
  }, async (request: FastifyRequest<AddLineItemRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId } = request.params;
      const lineItemData = request.body;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Add line item (this will return the updated quote)
      const updatedQuote = await quoteService.addLineItem(quoteId, lineItemData);

      if (!updatedQuote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }

      return reply.status(200).send(updatedQuote);
    } catch (error) {
      logger.error('Error adding line item:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to add line item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Update line item
  fastify.put('/v1/quotes/:quoteId/line-items/:lineItemId', {
    schema: {
      body: UpdateLineItemSchema
    }
  }, async (request: FastifyRequest<UpdateLineItemRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId, lineItemId } = request.params;
      const updateData = request.body;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Update line item (this will return the updated quote)
      const updatedQuote = await quoteService.updateLineItem(quoteId, lineItemId, updateData);

      if (!updatedQuote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote or line item not found',
          code: 'QUOTE_OR_LINE_ITEM_NOT_FOUND'
        });
      }

      return reply.status(200).send(updatedQuote);
    } catch (error) {
      logger.error('Error updating line item:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update line item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Delete line item
  fastify.delete('/v1/quotes/:quoteId/line-items/:lineItemId', async (request: FastifyRequest<DeleteLineItemRequest>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId, lineItemId } = request.params;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Delete line item (this will return the updated quote)
      const updatedQuote = await quoteService.deleteLineItem(quoteId, lineItemId);

      if (!updatedQuote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote or line item not found',
          code: 'QUOTE_OR_LINE_ITEM_NOT_FOUND'
        });
      }

      return reply.status(200).send(updatedQuote);
    } catch (error) {
      logger.error('Error deleting line item:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete line item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Set discount on quote
  fastify.put('/v1/quotes/:quoteId/discount', {
    schema: {
      body: Type.Object({
        type: Type.Union([Type.Literal('percentage'), Type.Literal('fixed')]),
        value: Type.Number({ minimum: 0 })
      })
    }
  }, async (request: FastifyRequest<{
    Params: { quoteId: string };
    Body: { type: 'percentage' | 'fixed'; value: number };
  }>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId } = request.params;
      const { type, value } = request.body;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Set discount (this will return the updated quote)
      const updatedQuote = await quoteService.setDiscount(quoteId, { type, value });

      if (!updatedQuote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }

      return reply.status(200).send(updatedQuote);
    } catch (error) {
      logger.error('Error setting discount:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to set discount',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Generate PDF for quote
  fastify.post('/v1/quotes/:quoteId/pdf', async (request: FastifyRequest<{
    Params: { quoteId: string };
  }>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId } = request.params;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Get the quote
      const quote = await quoteService.getQuoteById(quoteId);
      if (!quote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }

      // Generate PDF using the PDF service
      const pdfService = new QuotePDFService();
      const pdfData = {
        quote,
        organization: {
          name: 'Pivotal Flow Ltd', // TODO: Get from organization settings
          address: 'New Zealand', // TODO: Get from organization settings
          email: 'admin@pivotalflow.com', // TODO: Get from organization settings
          website: 'https://pivotalflow.com', // TODO: Get from organization settings
        },
      };

      const pdfBuffer = await pdfService.generatePDF(pdfData);

      // Set response headers for PDF download
      reply.type('application/pdf');
      reply.header('Content-Disposition', `attachment; filename="quote-${quote.quoteNumber}.pdf"`);
      reply.header('Content-Length', pdfBuffer.length.toString());

      return reply.send(pdfBuffer);
    } catch (error) {
      logger.error('Error generating quote PDF:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate quote PDF',
        code: 'PDF_GENERATION_FAILED'
      });
    }
  });
}


// Submit quote route
export function registerSubmitQuoteRoute(fastify: FastifyInstance) {
  fastify.post('/v1/quotes/:quoteId/submit', async (request: FastifyRequest<{
    Params: { quoteId: string };
  }>, reply: FastifyReply) => {
    try {
      // Get user context
      const user = (request as any).user;
      if (!user) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Authentication required',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      const { quoteId } = request.params;

      // Create quote service
      const auditLogger = new AuditLogger(request.server, user.organizationId, user.userId);
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      }, auditLogger);

      // Get the quote to verify it exists
      const quote = await quoteService.getQuoteById(quoteId);
      if (!quote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }

      // Update quote status to submitted
      const updatedQuote = await quoteService.updateQuoteStatus(quoteId, 'submitted');

      return reply.status(200).send(updatedQuote);
    } catch (error) {
      logger.error('Error submitting quote:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to submit quote',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
