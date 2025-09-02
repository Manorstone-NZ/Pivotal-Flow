import type { FastifyInstance, FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { IdempotencyService } from '../lib/idempotency.js';

export const idempotencyPlugin: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  const idempotencyService = new IdempotencyService((app as any).db);

  // Add preHandler hook to check idempotency
  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const idempotencyKey = request.headers['idempotency-key'] as string;
    
    // Only process idempotency for POST and PATCH requests
    if (!idempotencyKey || !['POST', 'PATCH'].includes(request.method)) {
      return;
    }

    // Get user context
    const user = (request as any).user;
    if (!user) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Authentication required for idempotency',
        code: 'IDEMPOTENCY_AUTH_REQUIRED'
      });
    }

    // Generate request hash
    const requestHash = idempotencyService.generateRequestHash(
      request.body,
      request.headers as Record<string, string>
    );

    // Check if this is a duplicate request
    const context = {
      organizationId: user.organizationId,
      userId: user.userId,
      route: request.url,
      requestHash
    };

    const result = await idempotencyService.checkIdempotency(context);

    if (result.isDuplicate) {
      // Return cached response
      return reply
        .status(result.responseStatus!)
        .send(result.responseBody);
    }

    // Store context for postHandler
    (request as any).idempotencyContext = context;
  });

  // Add onResponse hook to store successful responses
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const context = (request as any).idempotencyContext;
    
    if (!context) {
      return;
    }

    // Only store successful responses (2xx status codes)
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      try {
        await idempotencyService.storeResponse(
          context,
          reply.statusCode,
          {} // Store empty object for now, can be enhanced later
        );
      } catch (error) {
        // Log error but don't fail the request
        app.log.error('Failed to store idempotency response:', error as any);
      }
    }
  });

  done();
};
