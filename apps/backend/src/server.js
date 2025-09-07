import Fastify from 'fastify';
import { register, collectDefaultMetrics } from 'prom-client';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { logger } from './lib/logger.js';
// Initialize metrics
const g = globalThis;
if (!g.__metricsInit) {
    try {
        collectDefaultMetrics({ register });
        g.__metricsInit = true;
    }
    catch (error) {
        // Metrics already registered, continue
        logger.warn('Default metrics already registered, skipping');
    }
}
export const app = Fastify({
    logger: {
        level: 'info',
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }),
            res: (res) => ({
                statusCode: res.statusCode
            })
        }
    },
    trustProxy: true,
    genReqId: () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
});
// Set Zod-aware compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
//# sourceMappingURL=server.js.map