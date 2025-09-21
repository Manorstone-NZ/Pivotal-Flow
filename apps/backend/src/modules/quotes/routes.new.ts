import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

import { QuoteService } from './service.js';
import { 
  CreateQuoteSchema, 
  QuoteResponseSchema,
  QuoteErrorSchema,
  type CreateQuote,
  type QuoteResponse,
  type QuoteError
} from './typeboxSchemas.js';

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

export async function quoteRoutes(fastify: FastifyInstance) {
  // Create a new quote
  fastify.post<{
    Body: CreateQuote;
    Reply: QuoteResponse | QuoteError;
  }>('/quotes', {
    schema: {
      body: CreateQuoteSchema,
      response: {
        201: QuoteResponseSchema,
        400: QuoteErrorSchema,
        401: QuoteErrorSchema,
        403: QuoteErrorSchema,
        500: QuoteErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateQuote }>, reply) => {
    try {
      const validatedData = request.body; // TypeBox handles validation automatically
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const quoteService = new QuoteService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await quoteService.createQuote({
        ...validatedData,
        metadata: validatedData.metadata || {}
      });

      return reply.status(201).send(result as any); // TODO: Fix response schema in API schemas task
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create quote',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get all quotes
  fastify.get<{
    Reply: QuoteResponse[] | QuoteError;
  }>('/quotes', {
    schema: {
      response: {
        200: Type.Array(QuoteResponseSchema),
        401: QuoteErrorSchema,
        403: QuoteErrorSchema,
        500: QuoteErrorSchema
      }
    }
  }, async (request, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const quoteService = new QuoteService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await quoteService.listQuotes();
      return reply.status(200).send(result as any); // TODO: Fix response schema in API schemas task
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get quotes',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Get quote by ID
  fastify.get<{
    Params: { id: string };
    Reply: QuoteResponse | QuoteError;
  }>('/quotes/:id', {
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: QuoteResponseSchema,
        401: QuoteErrorSchema,
        403: QuoteErrorSchema,
        404: QuoteErrorSchema,
        500: QuoteErrorSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      const quoteService = new QuoteService({
        organizationId: authenticatedRequest.user.organizationId,
        userId: authenticatedRequest.user.userId
      });
      
      const result = await quoteService.getQuoteById(request.params.id);
      if (!result) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quote not found',
          code: 'QUOTE_NOT_FOUND'
        });
      }
      
      return reply.status(200).send(result as any); // TODO: Fix response schema in API schemas task
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get quote',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}
