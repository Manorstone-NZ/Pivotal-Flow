import type { FastifyRequest } from 'fastify';
import { createRequestLogger } from './logger.js';
interface RequestWithContext extends FastifyRequest {
    requestId?: string;
    startTime?: number;
    requestLogger?: ReturnType<typeof createRequestLogger>;
}
export declare function requestLogger(request: RequestWithContext): Promise<void>;
export {};
//# sourceMappingURL=request-logger.d.ts.map