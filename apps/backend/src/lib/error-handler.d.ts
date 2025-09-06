/**
 * Global Error Handler for C0 Backend Readiness
 * Standardized error responses with request tracking
 */
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
        timestamp: string;
        request_id: string;
    };
    meta: {
        api_version: string;
        documentation_url: string;
    };
}
/**
 * Create standardized error response
 */
export declare function createErrorResponse(code: string, message: string, _statusCode: number, requestId: string, details?: unknown): ErrorResponse;
/**
 * Send standardized error response
 */
export declare function sendErrorResponse(reply: FastifyReply, code: string, message: string, statusCode: number, requestId: string, details?: unknown): void;
export declare class AppError extends Error {
    code: string;
    statusCode: number;
    details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: unknown);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
/**
 * Global error handler middleware
 */
export declare function globalErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): void;
/**
 * Request ID middleware
 */
export declare function requestIdMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void): void;
/**
 * Request logging middleware
 */
export declare function requestLoggingMiddleware(_request: FastifyRequest, _reply: FastifyReply, done: () => void): void;
//# sourceMappingURL=error-handler.d.ts.map