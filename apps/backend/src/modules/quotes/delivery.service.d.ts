/**
 * Quote Delivery Service - SaaS Multi-Tenant
 * Handles secure quote delivery with tenant isolation
 */
import type { FastifyInstance } from 'fastify';
export interface DeliveryContext {
    organizationId: string;
    userId: string;
}
export interface DeliveryOptions {
    recipientEmail?: string;
    customMessage?: string;
    expirationDays?: number;
}
export interface DeliveryResult {
    success: boolean;
    publicUrl: string;
    token: string;
    deliveredAt: Date;
    expiresAt: Date;
    message?: string;
}
export declare class QuoteDeliveryService {
    private fastify;
    private context;
    constructor(fastify: FastifyInstance, context: DeliveryContext);
    /**
     * Generate secure public token for SaaS multi-tenant access
     * Token format: {organizationId}.{quoteId}.{randomBytes}.{timestamp}
     */
    private generateSecureToken;
    /**
     * Deliver quote to customer with SaaS tenant isolation
     */
    deliverQuote(quoteId: string, _options?: DeliveryOptions): Promise<DeliveryResult>;
    /**
     * Validate and decode public token for SaaS tenant isolation
     */
    static validatePublicToken(token: string): {
        isValid: boolean;
        quoteId?: string;
        organizationHash?: string;
        timestamp?: number;
    };
    /**
     * Get organization ID from token hash (for tenant validation)
     */
    static getOrganizationFromTokenHash(tokenOrgHash: string, candidateOrgId: string | undefined): boolean;
}
//# sourceMappingURL=delivery.service.d.ts.map