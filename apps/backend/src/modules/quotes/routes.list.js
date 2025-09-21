import { logger } from '../../lib/logger.js';
// import type { PaginationOptions } from '../../lib/repo.base.js'; // TODO: Use when needed
import { QuoteListFiltersSchema } from './typeboxSchemas.js';
import { QuoteService } from './service.js';
import { AuditLogger } from '../../lib/audit-logger.drizzle.js';
/**
 * Register the list quotes route
 */
export function registerListQuotesRoute(fastify) {
    fastify.get('/v1/quotes', {
        schema: {
            querystring: QuoteListFiltersSchema
        }
    }, async (request, reply) => {
        try {
            // Get user context
            const user = request.user;
            if (!user) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Authentication required',
                    code: 'TENANT_ACCESS_DENIED'
                });
            }
            // Parse and validate query parameters
            const pagination = {
                page: request.query.page || 1,
                size: request.query.pageSize || 20
            };
            const filters = {
                status: request.query.status,
                customerId: request.query.customerId,
                projectId: request.query.projectId,
                type: request.query.type,
                q: request.query.q,
                validFrom: request.query.validFrom,
                validUntil: request.query.validUntil,
                createdBy: request.query.createdBy
            };
            // Create quote service
            const auditLogger = new AuditLogger(request.server);
            const quoteService = new QuoteService({
                organizationId: user.organizationId,
                userId: user.userId
            }, auditLogger);
            // List quotes
            const result = await quoteService.listQuotes(pagination, filters);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_LIST_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in listQuotesRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.list.js.map