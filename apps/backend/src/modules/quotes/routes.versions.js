import { logger } from '../../lib/logger.js';
import { QuoteService } from './service.js';
/**
 * Register the get quote versions route
 */
export function registerGetQuoteVersionsRoute(fastify) {
    fastify.get('/v1/quotes/:id/versions', async (request, reply) => {
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
            const { id } = request.params;
            // Create quote service
            const quoteService = new QuoteService(fastify.db, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Get quote versions
            const versions = await quoteService.getQuoteVersions(id);
            return reply.status(200).send({
                quoteId: id,
                versions
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_VERSIONS_GET_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in getQuoteVersionsRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
/**
 * Register the get quote version route
 */
export function registerGetQuoteVersionRoute(fastify) {
    fastify.get('/v1/quotes/:id/versions/:versionId', async (request, reply) => {
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
            const { id, versionId } = request.params;
            // Create quote service
            const quoteService = new QuoteService(fastify.db, {
                organizationId: user.organizationId,
                userId: user.userId
            });
            // Get quote version
            const version = await quoteService.getQuoteVersion(id, versionId);
            if (!version) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Quote version not found',
                    code: 'QUOTE_VERSION_NOT_FOUND'
                });
            }
            return reply.status(200).send(version);
        }
        catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message,
                    code: 'QUOTE_VERSION_GET_FAILED'
                });
            }
            // Log unexpected errors
            logger.error('Unexpected error in getQuoteVersionRoute:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR'
            });
        }
    });
}
//# sourceMappingURL=routes.versions.js.map