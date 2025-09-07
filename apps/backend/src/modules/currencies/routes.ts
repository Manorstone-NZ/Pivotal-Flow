import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

import { 
  CurrencyResponseSchema,
  CurrencyErrorSchema,
  type CurrencyResponse,
  type CurrencyError
} from './typeboxSchemas.js';

export async function currencyRoutes(fastify: FastifyInstance) {
  // Get all currencies
  fastify.get<{
    Reply: CurrencyResponse[] | CurrencyError;
  }>('/currencies', {
    schema: {
      response: {
        200: Type.Array(CurrencyResponseSchema),
        401: CurrencyErrorSchema,
        403: CurrencyErrorSchema,
        500: CurrencyErrorSchema
      }
    }
  }, async (_request, reply) => {
    try {
      // Mock currencies for now
      const currencies = [
        {
          code: 'NZD',
          name: 'New Zealand Dollar',
          symbol: '$',
          isActive: true
        },
        {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          isActive: true
        },
        {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          isActive: true
        }
      ];
      
      return reply.status(200).send(currencies);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get currencies',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}