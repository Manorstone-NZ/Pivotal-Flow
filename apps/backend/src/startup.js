import { register } from 'prom-client';
import { app } from './server.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { registerPlugins } from './plugins.js';
import { registerRoutes } from './routes.js';
// Start server
async function startServer() {
    try {
        logger.info(`Startup at ${new Date().toISOString()} - WATCHER WORKING!`);
        logger.info({
            port: config.server.PORT,
            host: config.server.HOST,
            startupTime: new Date().toISOString(),
            message: '🚀 BACKEND STARTUP - NEW INSTANCE - FILE WATCHING TEST'
        }, 'Starting server');
        // Probe prom client early
        try {
            const testMetrics = await register.metrics();
            logger.info({ length: testMetrics.length }, 'Prometheus metrics test ok');
        }
        catch (promError) {
            logger.warn({ err: promError }, 'Prometheus metrics test failed');
        }
        await registerPlugins();
        await registerRoutes();
        logger.info({}, 'Ensuring plugins are ready');
        await app.ready();
        logger.info({}, 'Calling app.listen');
        await app.listen({
            port: config.server.PORT,
            host: config.server.HOST,
        });
        logger.info({}, 'app.listen completed');
        // Fail loud in dev if boot fails - check after listen
        try {
            if (!app.server || !app.server.listening) {
                logger.error({}, "Boot failed after listen - app not properly configured");
                process.exit(1);
            }
            logger.info({}, "App is properly configured and listening");
        }
        catch (error) {
            logger.error({ err: error }, "Boot failed after listen - error in configuration check");
            process.exit(1);
        }
        logger.info({ url: `http://${config.server.HOST}:${config.server.PORT}` }, 'Server running');
    }
    catch (err) {
        if (err instanceof Error) {
            logger.error({
                name: err.name,
                message: err.message,
                stack: err.stack,
                code: err?.code,
                errno: err?.errno,
                syscall: err?.syscall,
                address: err?.address,
                port: err?.port,
                cause: err?.cause,
            }, 'Failed to start server');
            if (err.code === 'EADDRINUSE' ||
                err.code === 'EACCES' ||
                err.code === 'EADDRNOTAVAIL') {
                logger.error({}, 'Critical server error - exiting');
                process.exit(1);
            }
        }
        else {
            logger.error({ err: err }, 'Failed to start server with unknown error');
        }
        if (config.server.NODE_ENV === 'development') {
            logger.warn({}, 'Server failed to start, continuing in development mode');
        }
        else {
            process.exit(1);
        }
    }
}
// Single start guard to prevent accidental double starts during watch reloads
if (globalThis.__appStarted) {
    logger.warn({}, "App already started in this process");
    setTimeout(() => process.exit(0), 50); // Give time for logs to flush
}
globalThis.__appStarted = true;
startServer().catch((error) => {
    logger.fatal({ err: error }, 'Fatal error during server startup');
    process.exit(1);
});
// Graceful shutdown
process.once('SIGTERM', () => {
    logger.info({}, 'SIGTERM received, shutting down gracefully');
    void app.close().then(() => process.exit(0));
});
process.once('SIGINT', () => {
    logger.info({}, 'SIGINT received, shutting down gracefully');
    void app.close().then(() => process.exit(0));
});
//# sourceMappingURL=startup.js.map