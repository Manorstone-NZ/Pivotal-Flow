/**
 * App factory for testing
 * Creates a Fastify instance with minimal configuration for testing
 */
import Fastify from 'fastify';
export async function build(options = {}) {
    const app = Fastify({
        logger: options.logger ?? false, // Use provided logger option or default to false
        trustProxy: true,
    });
    // Add basic health endpoint
    app.get('/health', async () => {
        return { status: 'ok' };
    });
    return app;
}
//# sourceMappingURL=app.js.map