/**
 * Quote Delivery Service - SaaS Multi-Tenant
 * Handles secure quote delivery with tenant isolation
 */
import { randomBytes, createHash } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { quotes } from '../../lib/schema.js';
export class QuoteDeliveryService {
    fastify;
    context;
    constructor(fastify, context) {
        this.fastify = fastify;
        this.context = context;
    }
    /**
     * Generate secure public token for SaaS multi-tenant access
     * Token format: {organizationId}.{quoteId}.{randomBytes}.{timestamp}
     */
    generateSecureToken(quoteId) {
        // Generate cryptographically secure random bytes
        const randomPart = randomBytes(32).toString('hex');
        // Create timestamp for expiration tracking
        const timestamp = Date.now().toString(36);
        // Include organization ID for tenant isolation (hashed for security)
        const orgHash = createHash('sha256')
            .update(this.context.organizationId)
            .digest('hex')
            .substring(0, 8);
        // Construct token: orgHash.quoteId.randomPart.timestamp
        const token = `${orgHash}.${quoteId}.${randomPart}.${timestamp}`;
        // Set expiration (max 30 days for SaaS)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        return { token, expiresAt };
    }
    /**
     * Deliver quote to customer with SaaS tenant isolation
     */
    async deliverQuote(quoteId, options = {}) {
        const db = this.fastify.db;
        try {
            // Verify quote exists and belongs to current tenant
            const quote = await db
                .select()
                .from(quotes)
                .where(and(eq(quotes.id, quoteId), eq(quotes.organizationId, this.context.organizationId)))
                .limit(1);
            if (!quote || quote.length === 0) {
                throw new Error('Quote not found or access denied');
            }
            const quoteData = quote[0];
            // Validate quote can be delivered
            if (!['draft', 'approved'].includes(quoteData.status)) {
                throw new Error(`Quote cannot be delivered from status: ${quoteData.status}`);
            }
            // Generate secure token with tenant isolation
            const { token, expiresAt } = this.generateSecureToken(quoteId);
            // Set delivery timestamp
            const deliveredAt = new Date();
            // Update quote with delivery information
            await db
                .update(quotes)
                .set({
                status: 'sent',
                deliveredAt,
                publicToken: token,
                tokenExpiresAt: expiresAt,
                sentAt: deliveredAt, // Maintain backward compatibility
                updatedAt: new Date(),
            })
                .where(and(eq(quotes.id, quoteId), eq(quotes.organizationId, this.context.organizationId)));
            // Generate SaaS-appropriate public URL
            const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
            const publicUrl = `${baseUrl}/public/quotes/${token}`;
            // Log delivery for audit trail (SaaS requirement)
            this.fastify.log.info({
                audit: {
                    action: 'quote.delivered',
                    userId: this.context.userId,
                    organizationId: this.context.organizationId,
                    quoteId,
                    publicToken: token.substring(0, 16) + '...', // Truncated for security
                    deliveredAt,
                    expiresAt,
                }
            }, 'Quote delivered to customer');
            return {
                success: true,
                publicUrl,
                token,
                deliveredAt,
                expiresAt,
                message: 'Quote delivered successfully'
            };
        }
        catch (error) {
            this.fastify.log.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: this.context.userId,
                organizationId: this.context.organizationId,
                quoteId,
            }, 'Failed to deliver quote');
            throw error;
        }
    }
    /**
     * Validate and decode public token for SaaS tenant isolation
     */
    static validatePublicToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 4) {
                return { isValid: false };
            }
            const [orgHash, quoteId, randomPart, timestampStr] = parts;
            const timestamp = parseInt(timestampStr, 36);
            // Basic validation
            if (!orgHash || !quoteId || !randomPart || !timestamp) {
                return { isValid: false };
            }
            // Check token age (max 30 days)
            const tokenAge = Date.now() - timestamp;
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
            if (tokenAge > maxAge) {
                return { isValid: false };
            }
            return {
                isValid: true,
                quoteId,
                organizationHash: orgHash,
                timestamp
            };
        }
        catch (error) {
            return { isValid: false };
        }
    }
    /**
     * Get organization ID from token hash (for tenant validation)
     */
    static getOrganizationFromTokenHash(tokenOrgHash, candidateOrgId) {
        const expectedHash = createHash('sha256')
            .update(candidateOrgId)
            .digest('hex')
            .substring(0, 8);
        return expectedHash === tokenOrgHash;
    }
}
//# sourceMappingURL=delivery.service.js.map