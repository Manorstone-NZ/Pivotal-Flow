import type { FastifyInstance } from 'fastify';
export interface OpaqueRegistrationStartRequest {
    username: string;
    clientRegistrationState: string;
}
export interface OpaqueRegistrationStartResponse {
    serverRegistrationState: string;
    registrationResponse: string;
}
export interface OpaqueRegistrationFinishRequest {
    username: string;
    registrationRecord: string;
    serverRegistrationState: string;
}
export interface OpaqueLoginStartRequest {
    username: string;
    clientLoginState: string;
}
export interface OpaqueLoginStartResponse {
    serverLoginState: string;
    loginResponse: string;
}
export interface OpaqueLoginFinishRequest {
    username: string;
    clientLoginFinish: string;
    serverLoginState: string;
}
export interface OpaqueLoginFinishResponse {
    sessionKey: string;
    userId: string;
    tenantId: string;
}
/**
 * OPAQUE PAKE (Password-Authenticated Key Exchange) Service
 * Implements secure password authentication without exposing passwords
 */
export declare class OpaquePakeService {
    private fastify;
    constructor(fastify: FastifyInstance);
    /**
     * Start OPAQUE registration flow
     * Client sends blinded password, server responds with evaluation
     */
    registrationStart(request: OpaqueRegistrationStartRequest): Promise<OpaqueRegistrationStartResponse>;
    /**
     * Finish OPAQUE registration flow
     * Store the OPRF record for future authentication
     */
    registrationFinish(request: OpaqueRegistrationFinishRequest): Promise<{
        success: boolean;
        userId: string;
    }>;
    /**
     * Start OPAQUE login flow
     * Client sends blinded password, server responds with OPRF evaluation
     */
    loginStart(request: OpaqueLoginStartRequest): Promise<OpaqueLoginStartResponse>;
    /**
     * Finish OPAQUE login flow
     * Verify client proof and establish session key
     */
    loginFinish(request: OpaqueLoginFinishRequest): Promise<OpaqueLoginFinishResponse>;
    /**
     * Generate server state for OPAQUE flows
     */
    private generateServerState;
    /**
     * Evaluate registration request (OPRF)
     * TODO: Replace with proper OPAQUE implementation
     */
    private evaluateRegistration;
    /**
     * Store OPRF record in database
     */
    private storeOprfRecord;
    /**
     * Get stored OPRF record for user
     */
    private getOprfRecord;
    /**
     * Evaluate login request (OPRF)
     * TODO: Replace with proper OPAQUE implementation
     */
    private evaluateLogin;
    /**
     * Verify login and generate session key
     * TODO: Replace with proper OPAQUE implementation
     */
    private verifyLoginAndGenerateSession;
    /**
     * Get user information for session creation
     */
    private getUserInfo;
}
export declare const createOpaquePakeService: (fastify: FastifyInstance) => OpaquePakeService;
//# sourceMappingURL=opaque-pake.d.ts.map