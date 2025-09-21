/**
 * Quote Delivery Service - SaaS Multi-Tenant
 * Handles secure quote delivery with tenant isolation
 */

import { randomBytes, createHash } from 'crypto';
import { eq, and } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { quotes } from '../../lib/schema.js';

export interface DeliveryContext {
  organizationId: string;
  userId: string;
}

export interface DeliveryOptions {
  recipientEmail?: string;
  customMessage?: string;
  expirationDays?: number; // Max 30 days for SaaS compliance
}

export interface DeliveryResult {
  success: boolean;
  publicUrl: string;
  token: string;
  deliveredAt: Date;
  expiresAt: Date;
  message?: string;
}

export class QuoteDeliveryService {
  constructor(
    private fastify: FastifyInstance,
    private context: DeliveryContext
  ) {}

  /**
   * Generate secure public token for SaaS multi-tenant access
   * Token format: {organizationId}.{quoteId}.{randomBytes}.{timestamp}
   */
  private generateSecureToken(_quoteId: string): { token: string; expiresAt: Date } {
    // Generate short cryptographically secure token (16 bytes = 22 chars in base64url)
    const randomPart = randomBytes(16).toString('base64url');
    
    // Create organization hash for tenant isolation (SaaS requirement)
    const orgHash = createHash('sha256')
      .update(this.context.organizationId)
      .digest('hex')
      .substring(0, 8);

    // Short token format: orgHash + randomPart (total ~30 chars)
    const token = `${orgHash}${randomPart}`;
    
    // Set expiration (max 30 days for SaaS)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    return { token, expiresAt };
  }

  /**
   * Deliver quote to customer with SaaS tenant isolation
   */
  async deliverQuote(
    quoteId: string, 
    _options: DeliveryOptions = {}
  ): Promise<DeliveryResult> {
    const db = (this.fastify as any).db;
    
    try {
      // Verify quote exists and belongs to current tenant
      const quote = await db
        .select()
        .from(quotes)
        .where(
          and(
            eq(quotes.id, quoteId),
            eq(quotes.organizationId, this.context.organizationId)
          )
        )
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
        .where(
          and(
            eq(quotes.id, quoteId),
            eq(quotes.organizationId, this.context.organizationId)
          )
        );

      // Generate SaaS-appropriate public URL
      const baseUrl = process.env['PUBLIC_BASE_URL'] || 'http://localhost:3000';
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

    } catch (error) {
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
  static validatePublicToken(token: string): { 
    isValid: boolean; 
    quoteId?: string; 
    organizationHash?: string;
    timestamp?: number;
  } {
    try {
      // Parse short token format: orgHash(8) + randomPart(22)
      if (token.length !== 30) {
        return { isValid: false };
      }

      const orgHash = token.substring(0, 8);
      const randomPart = token.substring(8);

      // For the new format, we need to look up the quote from the database
      // The timestamp validation will be done via the tokenExpiresAt field

      // Basic validation
      if (!orgHash || !randomPart) {
        return { isValid: false };
      }

      return {
        isValid: true,
        organizationHash: orgHash
      };

    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Get organization ID from token hash (for tenant validation)
   */
  static getOrganizationFromTokenHash(
    tokenOrgHash: string, 
    candidateOrgId: string | undefined
  ): boolean {
    if (!candidateOrgId) return false;
    const expectedHash = createHash('sha256')
      .update(candidateOrgId)
      .digest('hex')
      .substring(0, 8);
    
    return expectedHash === tokenOrgHash;
  }
}
