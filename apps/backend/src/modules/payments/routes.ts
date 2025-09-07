import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

import { 
  PaymentResponseSchema,
  PaymentErrorSchema,
  type PaymentResponse,
  type PaymentError
} from './typeboxSchemas.js';

export async function paymentRoutes(fastify: FastifyInstance) {
  // Get all payments
  fastify.get<{
    Reply: PaymentResponse[] | PaymentError;
  }>('/payments', {
    schema: {
      response: {
        200: Type.Array(PaymentResponseSchema),
        401: PaymentErrorSchema,
        403: PaymentErrorSchema,
        500: PaymentErrorSchema
      }
    }
  }, async (_request, reply) => {
    try {
      // Mock payments for now
      const payments = [
        {
          id: '1',
          amount: 100.00,
          currency: 'NZD',
          status: 'completed',
          method: 'credit_card',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return reply.status(200).send(payments);
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get payments',
        code: 'INTERNAL_ERROR'
      });
    }
  });
}