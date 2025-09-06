import type { FastifyRequest, FastifyReply } from 'fastify';
import type { RequestLogger } from './logger.js';
export interface LogContext {
    userId?: string;
    organizationId?: string;
    route?: string | undefined;
    status?: number;
    duration?: number;
    userAgent?: string | undefined;
    ip?: string;
}
interface AuthenticatedUser {
    id: string;
    organizationId: string;
}
type AuthenticatedRequest = FastifyRequest & {
    user: AuthenticatedUser;
};
export declare class LogEnricher {
    /**
     * Enriches a request logger with authentication context
     */
    static enrichRequestLogger(request: AuthenticatedRequest, logger: RequestLogger, context?: LogContext): RequestLogger;
    /**
     * Enriches response logging with status and duration
     */
    static enrichResponseLogger(_request: FastifyRequest, reply: FastifyReply, logger: RequestLogger, startTime: number): RequestLogger;
    /**
     * Creates a structured log entry for cloud destinations
     */
    static createCloudLogEntry(level: string, message: string, context: LogContext, additionalData?: Record<string, unknown>): Record<string, unknown>;
    /**
     * Formats logs for cloud shipping (JSON without pretty formatting)
     */
    static isCloudShippingEnabled(): boolean;
}
export {};
//# sourceMappingURL=log-enricher.d.ts.map