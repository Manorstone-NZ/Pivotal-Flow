import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';

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
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      });

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
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      });

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
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      });

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
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      });

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
      const quoteService = new QuoteService({
        organizationId: user.organizationId,
        userId: user.userId
      });

      // Get the quote
      const quote = await quoteService.getQuoteById(quoteId);
      if (!quote) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }

      // Generate PDF content (HTML template)
      const pdfContent = generateQuotePdfTemplate(quote);

      // For now, return the HTML content that can be printed to PDF
      // In a production environment, you would use a library like puppeteer to generate actual PDF
      return reply
        .header('Content-Type', 'text/html')
        .header('Content-Disposition', `attachment; filename="quote-${quote.quoteNumber}.html"`)
        .send(pdfContent);
    } catch (error) {
      logger.error('Error generating quote PDF:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate PDF',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}

/**
 * Generate HTML template for quote PDF
 */
function generateQuotePdfTemplate(quote: any): string {
  const formatCurrency = (amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const currency = quote.metadata?.currency || 'NZD';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quote ${quote.quoteNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .quote-title { font-size: 20px; margin: 10px 0; }
        .quote-number { color: #666; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .text-right { text-align: right; }
        .totals-table { width: 300px; margin-left: auto; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Pivotal Flow Ltd</div>
        <div class="quote-title">${quote.title}</div>
        <div class="quote-number">Quote #${quote.quoteNumber}</div>
        <div>Date: ${new Date(quote.createdAt).toLocaleDateString()}</div>
        ${quote.validUntil ? `<div>Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}</div>` : ''}
    </div>

    <div class="section">
        <div class="section-title">Quote Details</div>
        <p><strong>Type:</strong> ${quote.type}</p>
        <p><strong>Status:</strong> ${quote.status}</p>
        ${quote.description ? `<p><strong>Description:</strong> ${quote.description}</p>` : ''}
    </div>

    ${quote.lineItems && quote.lineItems.length > 0 ? `
    <div class="section">
        <div class="section-title">Line Items</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${quote.lineItems.map((item: any) => `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice, currency)}</td>
                    <td class="text-right">${formatCurrency(item.totalPrice, currency)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Summary</div>
        <table class="totals-table">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">${formatCurrency(quote.subtotal, currency)}</td>
            </tr>
            ${quote.metadata?.discountAmount && parseFloat(quote.metadata.discountAmount) > 0 ? `
            <tr>
                <td>Discount (${quote.metadata.discountType === 'percentage' ? quote.metadata.discountValue + '%' : 'Fixed'}):</td>
                <td class="text-right">-${formatCurrency(parseFloat(quote.metadata.discountAmount), currency)}</td>
            </tr>
            ` : ''}
            <tr>
                <td>Tax (${quote.metadata?.taxRate ? (parseFloat(quote.metadata.taxRate) * 100).toFixed(1) + '%' : '15%'}):</td>
                <td class="text-right">${formatCurrency(quote.taxAmount, currency)}</td>
            </tr>
            <tr class="total-row">
                <td><strong>Total Amount:</strong></td>
                <td class="text-right"><strong>${formatCurrency(quote.totalAmount, currency)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>This quote is valid until ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'further notice'}.</p>
    </div>
</body>
</html>
  `.trim();
}
