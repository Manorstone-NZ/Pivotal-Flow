import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

import { logger } from '../../lib/logger.js';

// TypeBox schemas for quotes
const CreateQuoteSchema = Type.Object({
  customerId: Type.String({ format: 'uuid' }),
  projectName: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  lineItems: Type.Array(Type.Object({
    description: Type.String({ minLength: 1 }),
    quantity: Type.Number({ minimum: 0 }),
    unitPrice: Type.Number({ minimum: 0 }),
    taxRate: Type.Optional(Type.Number({ minimum: 0, maximum: 1 }))
  }))
});

const QuoteResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  customerId: Type.String({ format: 'uuid' }),
  projectName: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  totalAmount: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

interface CreateQuoteRequest {
  customerId: string;
  projectName: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
}

interface QuoteResponse {
  id: string;
  customerId: string;
  projectName: string;
  description: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export async function createQuoteRoute(fastify: FastifyInstance) {
  fastify.post<{
    Body: CreateQuoteRequest;
    Reply: QuoteResponse;
  }>('/quotes', {
    schema: {
      body: CreateQuoteSchema,
      response: {
        201: QuoteResponseSchema,
        400: Type.Object({
          error: Type.String(),
          message: Type.String(),
          code: Type.String(),
          details: Type.Optional(Type.Any())
        }),
        401: Type.Object({
          error: Type.String(),
          message: Type.String(),
          code: Type.String()
        }),
        500: Type.Object({
          error: Type.String(),
          message: Type.String(),
          code: Type.String()
        })
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateQuoteRequest }>, reply: FastifyReply) => {
    try {
      const quoteData = request.body; // TypeBox handles validation automatically
      
      // Mock quote creation for now
      const mockQuote: QuoteResponse = {
        id: crypto.randomUUID(),
        customerId: quoteData.customerId,
        projectName: quoteData.projectName,
        description: quoteData.description || null,
        status: 'draft',
        totalAmount: quoteData.lineItems.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          const taxAmount = itemTotal * (item.taxRate || 0);
          return sum + itemTotal + taxAmount;
        }, 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info('Quote created successfully', { quoteId: mockQuote.id });
      
      return reply.status(201).send(mockQuote);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error creating quote:', error);
        return reply.status(400).send({
          error: 'Bad Request',
          message: error.message,
          code: 'QUOTE_CREATION_FAILED'
        });
      }

      // Log unexpected errors
      logger.error('Unexpected error in createQuoteRoute:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}